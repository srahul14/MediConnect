require("dotenv").config();
const { ExpectationFailed } = require("http-errors");
const { TestScheduler } = require("jest");
const supertest = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const Doctor = require("../../models/doctor");
const Patient = require("../../models/patient");
const Appointment = require("../../models/appointment");
const populateDB = require("../../utility/populatedb");

const patientRouter = require("../../routes/patientRoutes");
const doctorRouter = require("../../routes/doctorRoutes");

const app = express();
app.use(express.json());
app.use("/patient", patientRouter);
app.use("/doctor", doctorRouter);

jest.mock("../../middleware/authMiddleware");
jest.mock("../../middleware/errMiddleware");
const { requireAuth } = require("../../middleware/authMiddleware");
const { handleAppointmentErrors } = require("../../middleware/errMiddleware");

let patients = [];
let doctors = [];
let appointments = [];
const nextYear = new Date().getFullYear() + 1;

beforeAll(async () => {
  await mongoose.connect(process.env.DB_CONNECTION + "/appointtest", {
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
 * getAppointment testing
 */
test("Expect to get all appointments of a patient, successful case", async () => {
  requireAuth.mockImplementation((req, res, next) => next());

  let res = await supertest(app).get(`/patient/appointment/${patients[0]}`);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(4);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.patientId).toBe(patients[0]);
    expect(appointments).toContain(appointment._id);
  });

  res = await supertest(app).get(`/doctor/appointment/${doctors[0]}`);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(6);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.doctorId).toBe(doctors[0]);
    expect(appointments).toContain(appointment._id);
  });
});

test("Make past appointments, expect get appointment to delete them", async () => {
  requireAuth.mockImplementation((req, res, next) => next());

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
  let patient = await Patient.findById(patients[0]).populate("appointments");
  let doctor = await Doctor.findById(doctors[0]).populate("appointments");

  let newAppointment = await Appointment.create(appointmentFields);
  patient.appointments.splice(0, 0, newAppointment);
  doctor.appointments.splice(0, 0, newAppointment);

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(2009, 10, 20, 12, 0),
    end_time: new Date(2009, 10, 20, 13, 0),
  };
  newAppointment = await Appointment.create(appointmentFields);
  patient.appointments.splice(0, 0, newAppointment);
  doctor.appointments.splice(0, 0, newAppointment);

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(2008, 10, 20, 12, 0),
    end_time: new Date(2008, 10, 20, 13, 0),
  };
  newAppointment = await Appointment.create(appointmentFields);
  patient.appointments.splice(0, 0, newAppointment);
  doctor.appointments.splice(0, 0, newAppointment);

  await patient.save();
  await doctor.save();

  patient = await Patient.findById(patients[0]).populate("appointments");
  doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(7);
  expect(doctor.appointments.length).toBe(9);

  // changing Date.now back to normal
  global.Date.now = realDateNow;

  let res = await supertest(app).get(`/patient/appointment/${patients[0]}`);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(4);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.patientId).toBe(patients[0]);
    expect(appointments).toContain(appointment._id);
  });

  res = await supertest(app).get(`/doctor/appointment/${doctors[0]}`);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(6);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.doctorId).toBe(doctors[0]);
    expect(appointments).toContain(appointment._id);
  });
});

test("Expect error 400 when get appointment of patient that doesn't exist", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    if (err.message === "Invalid user ID") {
      errors.patient = "User account doesn't exist";
      errors.doctor = "User account doesn't exist";
    }
    return errors;
  });

  const res = await supertest(app).get(
    `/patient/appointment/${appointments[0]}`
  );
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("User account doesn't exist");
});

test("Expect error 400 when get appointment of patient with invalid ID", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  const nonexistentID = "0";
  const res = await supertest(app).get(`/patient/appointment/${nonexistentID}`);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "0" at path "_id" for model "User"'
  );
});

// getAppointment testing for doctors
test("Expect to get all appointments of a doctor, successful case", async () => {
  requireAuth.mockImplementation((req, res, next) => next());

  const res = await supertest(app).get(`/doctor/appointment/${doctors[0]}`);
  expect(res.status).toBe(200);
  expect(res.body.appointments.length).toBe(6);
  res.body.appointments.forEach((appointment) => {
    expect(appointment.doctorId).toBe(doctors[0]);
    expect(appointments).toContain(appointment._id);
  });
});

test("Expect error 400 when get appointment of doctor that doesn't exist", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    if (err.message === "Invalid user ID") {
      errors.patient = "User account doesn't exist";
      errors.doctor = "User account doesn't exist";
    }
    return errors;
  });

  const res = await supertest(app).get(
    `/doctor/appointment/${appointments[0]}`
  );
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("User account doesn't exist");
});

test("Expect error 400 when get appointment of doctor with invalid ID", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  const nonexistentID = "0";
  const res = await supertest(app).get(`/doctor/appointment/${nonexistentID}`);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "0" at path "_id" for model "User"'
  );
});

/**
 * postAppointment testing
 */
test("Expect to post valid appointment for patient", async () => {
  requireAuth.mockImplementation((req, res, next) => next());

  const appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  const res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(200);

  // checking whether appointment was actually added to patient and doctor appointment array
  // at the correct spot
  const patient = await Patient.findById(patients[0]).populate("appointments");
  const doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(5);
  expect(doctor.appointments.length).toBe(7);
  let addedToPatient = false;
  let addedToDoctor = false;
  if (String(patient.appointments[2]._id) === String(res.body.appointment)) {
    addedToPatient = true;
  }
  if (String(doctor.appointments[2]._id) === String(res.body.appointment)) {
    addedToDoctor = true;
  }
  expect(addedToPatient && addedToDoctor).toBe(true);

  // get the appointment from database, check whether its valid, and then delete it
  const appointment = await Appointment.findById(res.body.appointment)
    .populate("patientId")
    .populate("doctorId");
  expect(String(appointment.patientId._id)).toBe(patients[0]);
  expect(String(appointment.doctorId._id)).toBe(doctors[0]);

  appointment.patientId.appointments.pull({ _id: res.body.appointment });
  appointment.doctorId.appointments.pull({ _id: res.body.appointment });
  await appointment.patientId.save();
  await appointment.doctorId.save();
  await appointment.deleteOne();
});

test("Expect error 400 when post appointment with invalid IDs", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};

    // incorrect patient ID
    if (err.message === "Invalid patient ID") {
      errors.patient = "Patient account doesn't exist";
    }

    // incorrect doctor ID
    if (err.message === "Invalid doctor ID") {
      errors.doctor = "Doctor account doesn't exist";
    }

    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  let appointmentFields = {
    patientId: "0",
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  let res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "0" at path "_id" for model "Patient"'
  );

  appointmentFields = {
    patientId: patients[0],
    doctorId: "0",
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "0" at path "_id" for model "Doctor"'
  );

  appointmentFields = {
    patientId: appointments[0],
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.patient).toBe("Patient account doesn't exist");

  appointmentFields = {
    patientId: patients[0],
    doctorId: appointments[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("Doctor account doesn't exist");
});

test("Expected error 400 when post appointment with non dates", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  let appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: "NOT A DATE",
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  let res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    'Cast to date failed for value "NOT A DATE" at path "start_time"'
  );

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: "NOT A DATE",
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.end_time).toBe(
    'Cast to date failed for value "NOT A DATE" at path "end_time"'
  );
});

test("Expect error 400 when post appointment with start time and end time that overlaps a timeslot already booked for a patient and then for doctor", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = { patientId: "", doctorId: "", start_time: "", end_time: "" };

    if (err.message === "Time slot already booked") {
      errors.start_time = "Appointment can't be booked for this time slot";
      errors.end_time = "Appointment can't be booked for this time slot";
    }

    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        errors[error.path] = error.message;
      });
    }

    return errors;
  });

  let appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };

  let res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(200);

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[1],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };

  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );
  expect(res.body.end_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  appointmentFields = {
    patientId: patients[1],
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );
  expect(res.body.end_time).toBe(
    "Appointment can't be booked for this time slot"
  );
});

test("Expected error 400 when post appointment with missing fields", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  let appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  let res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Please enter start time");

  appointmentFields = {
    patientId: patients[0],
    doctorId: doctors[0],
    start_time: new Date(nextYear, 11, 21, 14, 0),
  };
  res = await supertest(app)
    .post("/patient/appointment")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.end_time).toBe("Please enter end time");
});

/**
 * putAppointment testing
 */
test("Expect to put valid appointment for patient", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = { patientId: "", doctorId: "", start_time: "", end_time: "" };
    if (err.message === "Time slot already booked") {
      errors.start_time = "Appointment can't be booked for this time slot";
      errors.end_time = "Appointment can't be booked for this time slot";
    }

    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        errors[error.path] = error.message;
      });
    }

    return errors;
  });

  let appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 16, 0),
    end_time: new Date(nextYear, 11, 21, 17, 0),
  };
  let res = await supertest(app)
    .put(`/patient/appointment/${appointments[0]}`)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  // checking whether appointment was actually updated in patient and doctor appointment array
  // from position 0 to 1
  let patient = await Patient.findById(patients[0]).populate("appointments");
  let doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(5);
  expect(doctor.appointments.length).toBe(7);
  let addedToPatient = false;
  let addedToDoctor = false;
  if (String(patient.appointments[2]._id) === String(appointments[0])) {
    addedToPatient = true;
  }
  if (String(doctor.appointments[2]._id) === String(appointments[0])) {
    addedToDoctor = true;
  }
  expect(addedToPatient && addedToDoctor).toBe(true);

  appointmentFields = {
    start_time: new Date(nextYear, 11, 20, 11, 0),
    end_time: new Date(nextYear, 11, 20, 12, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[0]}`)
    .send(appointmentFields);
  expect(res.status).toBe(200);

  // checking whether appointment was actually updated in patient and doctor appointment array
  // from position 1 to 0
  patient = await Patient.findById(patients[0]).populate("appointments");
  doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(5);
  expect(doctor.appointments.length).toBe(7);
  addedToPatient = false;
  addedToDoctor = false;
  if (String(patient.appointments[0]._id) === String(appointments[0])) {
    addedToPatient = true;
  }
  if (String(doctor.appointments[0]._id) === String(appointments[0])) {
    addedToDoctor = true;
  }
  expect(addedToPatient && addedToDoctor).toBe(true);
});

test("Expect error 400 when put appointment with invalid ID", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // incorrect appointment ID
    if (err.message === "Invalid appointment ID") {
      errors.start_time = "Appointment doesn't exist";
      errors.end_time = "Appointment doesn't exist";
    }
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  let appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  let res = await supertest(app)
    .put("/patient/appointment/0")
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "0" at path "_id" for model "Appointment"'
  );

  res = await supertest(app)
    .put(`/patient/appointment/${patients[0]}`)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment doesn't exist");
  expect(res.body.end_time).toBe("Appointment doesn't exist");
});

test("Expect error 400 when put appointment with non dates", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  let appointmentFields = {
    start_time: "NOT A DATE",
    end_time: new Date(nextYear, 11, 21, 15, 0),
  };
  let res = await supertest(app)
    .put(`/patient/appointment/${appointments[0]}`)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    'Cast to date failed for value "NOT A DATE" at path "start_time"'
  );

  appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 14, 0),
    end_time: "NOT A DATE",
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[0]}`)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.end_time).toBe(
    'Cast to date failed for value "NOT A DATE" at path "end_time"'
  );
});

test("Expect to get error 400 when trying to put appointment and changing start_time and end_time so that they are the same as a different appointment", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = { patientId: "", doctorId: "", start_time: "", end_time: "" };
    if (err.message === "Time slot already booked") {
      errors.start_time = "Appointment can't be booked for this time slot";
      errors.end_time = "Appointment can't be booked for this time slot";
    }

    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        errors[error.path] = error.message;
      });
    }

    return errors;
  });

  const oldAppointment = await Appointment.findById(appointments[1]);

  let appointmentFields = {
    start_time: new Date(nextYear, 11, 20, 11, 0),
    end_time: new Date(nextYear, 11, 20, 12, 0),
  };
  let res = await supertest(app)
    .put(`/patient/appointment/${appointments[1]}`)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );
  expect(res.body.end_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  let appointment = await Appointment.findById(appointments[1]);
  expect(appointment._id).toEqual(oldAppointment._id);
  expect(appointment.patientId).toEqual(oldAppointment.patientId);
  expect(appointment.doctorId).toEqual(oldAppointment.doctorId);
  expect(appointment.start_time.getTime()).toBe(
    oldAppointment.start_time.getTime()
  );
  expect(appointment.end_time.getTime()).toBe(
    oldAppointment.end_time.getTime()
  );

  appointmentFields = {
    start_time: new Date(nextYear, 11, 21, 11, 0),
    end_time: new Date(nextYear, 11, 21, 12, 0),
  };
  res = await supertest(app)
    .put(`/patient/appointment/${appointments[1]}`)
    .send(appointmentFields);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe(
    "Appointment can't be booked for this time slot"
  );
  expect(res.body.end_time).toBe(
    "Appointment can't be booked for this time slot"
  );

  appointment = await Appointment.findById(appointments[1]);
  expect(appointment._id).toEqual(oldAppointment._id);
  expect(appointment.patientId).toEqual(oldAppointment.patientId);
  expect(appointment.doctorId).toEqual(oldAppointment.doctorId);
  expect(appointment.start_time.getTime()).toBe(
    oldAppointment.start_time.getTime()
  );
  expect(appointment.end_time.getTime()).toBe(
    oldAppointment.end_time.getTime()
  );
});

/**
 * deleteAppointment testing
 */
test("Expected to delete existing appointment twice, and error 400 when delete appointment with invalid ID", async () => {
  requireAuth.mockImplementation((req, res, next) => next());
  handleAppointmentErrors.mockImplementation((err) => {
    let errors = {};
    // incorrect appointment ID
    if (err.message === "Invalid appointment ID") {
      errors.start_time = "Appointment doesn't exist";
      errors.end_time = "Appointment doesn't exist";
    }
    // validation errors
    if (err.message.includes("Appointment validation failed")) {
      Object.values(err.errors).forEach((error) => {
        if (error.name === "CastError") {
          errors[error.path] = error.message;
        } else {
          errors[error.path] = error.message;
        }
      });
    }
    // CastError
    if (err.name === "CastError") {
      errors[err.path] = err.message;
    }
    return errors;
  });

  let res = await supertest(app).delete(
    `/patient/appointment/${appointments[0]}`
  );
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete appointment successful");
  let patient = await Patient.findById(patients[0]).populate("appointments");
  let doctor = await Doctor.findById(doctors[0]).populate("appointments");
  expect(patient.appointments.length).toBe(4);
  expect(doctor.appointments.length).toBe(6);
  addedToPatient = false;
  addedToDoctor = false;
  if (String(patient.appointments[0]._id) === String(appointments[0])) {
    addedToPatient = true;
  }
  if (String(doctor.appointments[0]._id) === String(appointments[0])) {
    addedToDoctor = true;
  }
  expect(addedToPatient || addedToDoctor).toBe(false);

  // deleting same appointment again, appointment shouldn't exist
  res = await supertest(app).delete(`/patient/appointment/${appointments[0]}`);
  expect(res.status).toBe(400);
  expect(res.body.start_time).toBe("Appointment doesn't exist");
  expect(res.body.end_time).toBe("Appointment doesn't exist");

  // deleting appointment with invalid ID
  res = await supertest(app).delete("/patient/appointment/0");
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "0" at path "_id" for model "Appointment"'
  );
});
