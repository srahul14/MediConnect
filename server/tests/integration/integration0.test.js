require("dotenv").config();
const { ExpectationFailed } = require("http-errors");
const { TestScheduler } = require("jest");
const cookieParser = require("cookie-parser");
const supertest = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const Doctor = require("../../models/doctor");
const Patient = require("../../models/patient");
const populateDB = require("../../utility/populatedb");

const patientRouter = require("../../routes/patientRoutes");
const doctorRouter = require("../../routes/doctorRoutes");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/patient", patientRouter);
app.use("/doctor", doctorRouter);

let patients = [];
let doctors = [];
let appointments = [];
const nextYear = new Date().getFullYear() + 1;

beforeAll(async () => {
  await mongoose.connect(process.env.DB_CONNECTION + "/integrationtest0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  const retval = await populateDB();

  if (retval !== null) {
    patients = retval.patients;
    doctors = retval.doctors;
    appointments = retval.appointments;
  }
});

afterAll(async () => {
  await mongoose.connection.dropCollection("users");
  await mongoose.connection.dropCollection("appointments");
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

/**
 * User tries to sign up
 */
test("User tries to sign up", async () => {
  // first test for patient sign up
  let userFields = {
    first_name: "firstName",
    last_name: "lastName",
    email: "firstName@gmail.com",
    password: "12345678",
  };
  let res = await supertest(app).post("/patient/signup").send(userFields);
  expect(res.status).toBe(201);

  // email already registered
  res = await supertest(app).post("/patient/signup").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.email).toBe("Email already registered");

  // email invalid
  userFields = {
    first_name: "firstName",
    last_name: "lastName",
    email: "firstName.com",
    password: "12345678",
  };
  res = await supertest(app).post("/patient/signup").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.email).toBe("Please enter valid email");

  // password less than 8 characters
  userFields = {
    first_name: "firstName",
    last_name: "lastName",
    email: "firstName.com",
    password: "123678",
  };
  res = await supertest(app).post("/patient/signup").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.password).toBe("Password must be at least 8 characters long");

  userFields = {
    first_name: "firstName",
    email: "firstName.com",
    password: "123678",
    age: -1,
  };
  res = await supertest(app).post("/patient/signup").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.last_name).toBe("Please enter your last name");
  expect(res.body.age).toBe("Age must be at least 0");

  // second test for doctor sign up
  // email already registered
  userFields = {
    first_name: "firstName",
    last_name: "lastName",
    email: "firstName@gmail.com",
    password: "12345678",
  };
  res = await supertest(app).post("/doctor/signup").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.email).toBe("Email already registered");

  // successful sign up case
  userFields = {
    first_name: "firstName",
    last_name: "lastName",
    email: "lastName@gmail.com",
    password: "12345678",
  };
  res = await supertest(app).post("/doctor/signup").send(userFields);
  expect(res.status).toBe(201);
});

/**
 * User tries to sign in
 */
test("User tries to sign in", async () => {
  // first test patient sign in
  let userFields = {
    email: "firstName@gmail.com",
    password: "12345678",
  };
  let res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  const userID = res.body.user;
  const userCookie = res.headers["set-cookie"];

  res = await supertest(app)
    .get(`/patient/${userID}`)
    .set("Cookie", userCookie);
  expect(res.status).toBe(200);
  expect(res.body.gender).toBe("Other");
  expect(res.body.height).toBe(0);
  expect(res.body.weight).toBe(0);

  // password incorrect
  userFields = {
    email: "firstName@gmail.com",
    password: "12345679",
  };
  res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.password).toBe("Incorrect password");

  // Please enter a password
  userFields = {
    email: "firstName@gmail.com",
  };
  res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.password).toBe("Please enter password");

  // Please enter a password
  userFields = {
    password: "12345679",
  };
  res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.email).toBe("Please enter email");

  // Email is not registered
  userFields = {
    email: "firstNameName@gmail.com",
    password: "12345678",
  };
  res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(400);
  expect(res.body.email).toBe("Email not registered");

  // second test doctor sign in
  userFields = {
    email: "lastName@gmail.com",
    password: "12345678",
  };
  res = await supertest(app).post("/doctor/signin").send(userFields);
  expect(res.status).toBe(200);

  res = await supertest(app).get("/doctor/signout");
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Logout successful");
});

/**
 * User signs in, gets own info, and tries to update, then deletes
 */
test("User signs in, gets own info, tries to update, then deletes", async () => {
  let patientFields = {
    email: "maryjoe@gmail.com",
    password: "password",
  };
  let res = await supertest(app).post("/patient/signin").send(patientFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(patients[1]);
  const patientCookie = res.headers["set-cookie"];

  // get all patients
  res = await supertest(app).get("/patient");
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(9);
  expect(res.body[1]._id).toBe(patients[1]);

  // get own info, failure case
  res = await supertest(app)
    .get(`/patient/${appointments[1]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("User account doesn't exist");

  // get own info
  res = await supertest(app)
    .get(`/patient/${patients[1]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(patients[1]);

  let newAge = res.body.age + 1;
  let updateFields = {
    age: newAge,
  };
  res = await supertest(app)
    .put(`/patient/${appointments[1]}`)
    .set("Cookie", patientCookie)
    .send(updateFields);
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("User account doesn't exist");

  res = await supertest(app)
    .put(`/patient/${patients[1]}`)
    .set("Cookie", patientCookie)
    .send(updateFields);
  expect(res.status).toBe(200);

  // get own info
  res = await supertest(app)
    .get(`/patient/${patients[1]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(patients[1]);
  expect(res.body.age).toBe(newAge);

  // unsuccessful delete account
  res = await supertest(app)
    .delete(`/patient/${appointments[1]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("Patient account doesn't exist");

  let doctorFields = {
    email: "alexjones@gmail.com",
    password: "12345678",
  };
  res = await supertest(app).post("/doctor/signin").send(doctorFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(doctors[0]);
  const doctorCookie = res.headers["set-cookie"];

  // get all doctors
  res = await supertest(app).get("/doctor");
  expect(res.status).toBe(200);
  expect(res.body.length).toBe(11);
  expect(res.body[0]._id).toBe(doctors[0]);

  // get own info, failure case
  res = await supertest(app)
    .get(`/doctor/${appointments[1]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("User account doesn't exist");

  // get own info
  res = await supertest(app)
    .get(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(doctors[0]);
  expect(res.body.years_of_experience).toBe(20);

  newAge = res.body.age + 1;
  updateFields = {
    age: newAge,
  };
  res = await supertest(app)
    .put(`/doctor/${appointments[1]}`)
    .set("Cookie", doctorCookie)
    .send(updateFields);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("User account doesn't exist");

  res = await supertest(app)
    .put(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie)
    .send(updateFields);
  expect(res.status).toBe(200);

  // get own info
  res = await supertest(app)
    .get(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(doctors[0]);
  expect(res.body.age).toBe(newAge);

  updateFields = {
    years_of_experience: 25,
  };

  res = await supertest(app)
    .put(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie)
    .send(updateFields);
  expect(res.status).toBe(200);

  // get own info
  res = await supertest(app)
    .get(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(doctors[0]);
  expect(res.body.years_of_experience).toBe(25);
  expect(res.body.rating).toBe(50);

  updateFields = {
    years_of_experience: 30,
    verified: false,
  };

  res = await supertest(app)
    .put(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie)
    .send(updateFields);
  expect(res.status).toBe(200);

  // get own info
  res = await supertest(app)
    .get(`/doctor/${doctors[0]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body._id).toBe(doctors[0]);
  expect(res.body.years_of_experience).toBe(30);
  expect(res.body.rating).toBe(30);

  // unsuccessful delete account
  res = await supertest(app)
    .delete(`/doctor/${appointments[1]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("Doctor account doesn't exist");
});

/**
 * User gets appointments, failure cases
 */
test("User gets appointments, success and failure cases", async () => {
  let userFields = {
    email: "kylered@gmail.com",
    password: "passlmao",
  };
  let res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(patients[3]);
  const cookie = res.headers["set-cookie"];

  // don't send token, expect error
  res = await supertest(app).get("/patient/appointment/trololol");
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Token not valid");

  // send wrong token, expect error
  res = await supertest(app)
    .get("/patient/appointment/trololol")
    .set("Cookie", ["jwt=reallyRandomToken"]);
  expect(res.status).toBe(400);
  expect(res.body.message).toBe("Token not valid");

  // send wrong user ID, expect error
  res = await supertest(app)
    .get("/patient/appointment/trololol")
    .set("Cookie", cookie);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "trololol" at path "_id" for model "User"'
  );

  // send wrong user ID, expect error
  res = await supertest(app)
    .get(`/patient/appointment/${appointments[0]}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("User account doesn't exist");

  // success case
  res = await supertest(app)
    .get(`/patient/appointment/${patients[3]}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(2);
});

test("User makes appointment in the past, then gets them, expect them to be deleted", async () => {
  let userFields = {
    email: "johnsmith@gmail.com",
    password: "password",
  };
  let res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  let cookie = res.headers["set-cookie"];

  // GLOBAL mock of Date.now because mongoose model uses the Date function
  const realDateNow = Date.now.bind(global.Date);
  const theTime = 1.1692224e12;
  const dateNowStub = jest.fn(() => theTime);
  global.Date.now = dateNowStub;

  let appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(2010, 10, 20, 12, 0),
    end_time: new Date(2010, 10, 20, 13, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(2009, 10, 20, 12, 0),
    end_time: new Date(2009, 10, 20, 13, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(2008, 10, 20, 12, 0),
    end_time: new Date(2008, 10, 20, 13, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  patient = await Patient.findById(patients[0]).populate("appointments");
  doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(7);
  expect(doctor.appointments.length).toBe(9);

  // changing Date.now back to normal
  global.Date.now = realDateNow;

  res = await supertest(app)
    .get(`/patient/appointment/${patients[0]}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(4);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.patientId).toBe(patients[0]);
    expect(appointments).toContain(appointment._id);
  });

  res = await supertest(app)
    .get(`/doctor/appointment/${doctors[0]}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(6);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.doctorId).toBe(doctors[0]);
    expect(appointments).toContain(appointment._id);
  });
});

/**
 * User tries to make a new appointment
 */
test("User tries to make a new appointment, successful case and some failure cases", async () => {
  let userFields = {
    email: "kylered@gmail.com",
    password: "passlmao",
  };
  let res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  const cookie = res.headers["set-cookie"];

  let appointmentFields = {
    patientId: patients[3],
    doctorId: doctors[1],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  // checking whether appointment was actually added to patient and doctor appointment array
  // at the correct spot
  const patient = await Patient.findById(patients[3]).populate("appointments");
  const doctor = await Doctor.findById(doctors[1]).populate("appointments");
  expect(patient.appointments.length).toBe(3);
  expect(doctor.appointments.length).toBe(3);
  let addedToPatient = false;
  let addedToDoctor = false;
  if (String(patient.appointments[1]._id) === String(res.body.appointment)) {
    addedToPatient = true;
  }
  if (String(doctor.appointments[2]._id) === String(res.body.appointment)) {
    addedToDoctor = true;
  }
  expect(addedToPatient && addedToDoctor).toBe(true);

  // input start_time and end_time more than 1 day apart
  appointmentFields = {
    patientId: patients[3],
    doctorId: doctors[1],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 22, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment cannot be longer than 1 day");

  // input end_time is earlier than start_time
  appointmentFields = {
    patientId: patients[4],
    doctorId: doctors[2],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 20, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment end time earlier than start time"
  );

  // input start_time and end_time is in the past
  appointmentFields = {
    patientId: patients[4],
    doctorId: doctors[2],
    start_time: new Date(2010, 11, 21, 14, 0),
    end_time: new Date(2010, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Must make future appointments");

  // Invalid dates
  appointmentFields = {
    patientId: patients[4],
    doctorId: doctors[2],
    start_time: "really cool start time",
    end_time: "really cool end time",
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    'Cast to date failed for value "really cool start time" at path "start_time"'
  );
});

test("User tries to post or update appointment to time slow which already exists", async () => {
  let doctorFields = {
    email: "micjordan@gmail.com",
    password: "abcdefghi",
  };
  let res = await supertest(app).post("/doctor/signin").send(doctorFields);
  expect(res.status).toBe(200);
  let doctorCookie = res.headers["set-cookie"];

  let patientFields = {
    email: "johnsmith@gmail.com",
    password: "password",
  };
  res = await supertest(app).post("/patient/signin").send(patientFields);
  expect(res.status).toBe(200);
  let patientCookie = res.headers["set-cookie"];

  let appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[1],
    start_time: new Date(nextYear, 11, 30, 14, 0),
    end_time: new Date(nextYear, 11, 30, 15, 0),
  };
  res = await supertest(app)
    .post("/doctor/appointment")
    .set("Cookie", doctorCookie)
    .send(appointmentFields);
  expect(res.status).toBe(200);
  let appointId = res.body.appointment;

  res = await supertest(app)
    .post("/doctor/appointment")
    .set("Cookie", doctorCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", patientCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  appointmentFields = {
    patientId: patients[1],
    doctorId: doctors[1],
    start_time: new Date(nextYear, 11, 30, 14, 0),
    end_time: new Date(nextYear, 11, 30, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .set("Cookie", patientCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  appointmentFields = {
    start_time: new Date(nextYear, 11, 30, 14, 0),
    end_time: new Date(nextYear, 11, 30, 15, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[0]}`)
    .set("Cookie", patientCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  res = await supertest(app)
    .put(`/patient/appointment/${appointments[3]}`)
    .set("Cookie", patientCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  res = await supertest(app)
    .delete(`/doctor/appointment/${appointId}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
});

test("User tries to update appointment, successful case and longer than 1 day case", async () => {
  let patientFields = {
    email: "johnsmith@gmail.com",
    password: "password",
  };
  let res = await supertest(app).post("/patient/signin").send(patientFields);
  expect(res.status).toBe(200);
  const cookie = res.headers["set-cookie"];

  let appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[7]}`)
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  // checking whether appointment was actually added to patient and doctor appointment array
  // at the correct spot
  const patient = await Patient.findById(patients[0]).populate("appointments");
  const doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(4);
  expect(doctor.appointments.length).toBe(6);
  let addedToPatient = false;
  let addedToDoctor = false;
  if (String(patient.appointments[2]._id) === String(res.body.appointment)) {
    addedToPatient = true;
  }
  if (String(doctor.appointments[2]._id) === String(res.body.appointment)) {
    addedToDoctor = true;
  }
  expect(addedToPatient && addedToDoctor).toBe(true);

  // input start_time and end_time more than 1 day apart
  appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 22, 15, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[7]}`)
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment cannot be longer than 1 day");

  // input end_time is earlier than start_time
  appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 20, 15, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[7]}`)
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment end time earlier than start time"
  );

  // input start_time and end_time is in the past
  appointmentFields = {
    start_time: new Date(2010, 11, 21, 14, 0),
    end_time: new Date(2010, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[7]}`)
    .set("Cookie", cookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Must make future appointments");
});

test("User tries to make appointment, delete case", async () => {
  let patientFields = {
    email: "kylered@gmail.com",
    password: "passlmao",
  };
  let res = await supertest(app).post("/patient/signin").send(patientFields);
  expect(res.status).toBe(200);
  const patientCookie = res.headers["set-cookie"];

  // sign in to doctor account to delete
  let doctorFields = {
    email: "micjordan@gmail.com",
    password: "abcdefghi",
  };
  res = await supertest(app).post("/doctor/signin").send(doctorFields);
  expect(res.status).toBe(200);
  let doctorCookie = res.headers["set-cookie"];

  res = await supertest(app)
    .delete(`/doctor/${doctors[1]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete doctor account successful");

  // book appointment when doctor already deleted
  let appointmentFields = {
    patientId: patients[3],
    doctorId: doctors[1],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment/")
    .set("Cookie", patientCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("Doctor account doesn't exist");

  // delete patient account this time
  res = await supertest(app)
    .delete(`/patient/${patients[3]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete patient account successful");

  doctorFields = {
    email: "micjackson@gmail.com",
    password: "thriller",
  };
  res = await supertest(app).post("/doctor/signin").send(doctorFields);
  expect(res.status).toBe(200);
  doctorCookie = res.headers["set-cookie"];

  // book appointment when patient already deleted
  appointmentFields = {
    patientId: patients[3],
    doctorId: doctors[2],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/doctor/appointment/")
    .set("Cookie", doctorCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("Patient account doesn't exist");
});

test("User tries to update appointment, delete case", async () => {
  let patientFields = {
    email: "johnsmith@gmail.com",
    password: "password",
  };
  let res = await supertest(app).post("/patient/signin").send(patientFields);
  expect(res.status).toBe(200);
  const patientCookie = res.headers["set-cookie"];

  let doctorFields = {
    email: "alexjones@gmail.com",
    password: "12345678",
  };
  res = await supertest(app).post("/doctor/signin").send(doctorFields);
  expect(res.status).toBe(200);
  let doctorCookie = res.headers["set-cookie"];

  // delete appointment, invalid ID case
  let appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .delete(`/patient/appointment/${patients[0]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment doesn't exist");

  res = await supertest(app)
    .delete(`/patient/appointment/${appointments[7]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete appointment successful");

  res = await supertest(app)
    .put(`/doctor/appointment/${appointments[7]}`)
    .set("Cookie", patientCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment doesn't exist");

  // delete patient account
  res = await supertest(app)
    .delete(`/patient/${patients[0]}`)
    .set("Cookie", patientCookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete patient account successful");

  res = await supertest(app)
    .put(`/doctor/appointment/${appointments[0]}`)
    .set("Cookie", doctorCookie)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment doesn't exist");
});

test("Doctor deletes appointment and checks whether its actually deleted", async () => {
  let doctorFields = {
    email: "alexjones@gmail.com",
    password: "12345678",
  };
  let res = await supertest(app).post("/doctor/signin").send(doctorFields);
  expect(res.status).toBe(200);
  let doctorCookie = res.headers["set-cookie"];

  res = await supertest(app)
    .get(`/doctor/appointment/${doctors[0]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(3);
  const appointId = res.body.appointments[0]._id;

  res = await supertest(app)
    .delete(`/doctor/appointment/${appointId}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete appointment successful");

  res = await supertest(app)
    .get(`/doctor/appointment/${doctors[0]}`)
    .set("Cookie", doctorCookie);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(2);
});
