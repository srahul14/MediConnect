require("dotenv").config();
const { ExpectationFailed } = require("http-errors");
const { TestScheduler } = require("jest");
const cookieParser = require("cookie-parser");
const supertest = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const populateDB = require("../../utility/populatedb");
const fillSymptomDB = require("../../utility/fillDiseaseDb");
const fillSpecialtyDB = require("../../utility/fillSpecialtyDb");

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

beforeAll(async () => {
  await mongoose.connect(process.env.DB_CONNECTION + "/integrationtest1", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  const retval = await populateDB();
  await fillSymptomDB();
  await fillSpecialtyDB();

  if (retval !== null) {
    patients = retval.patients;
    doctors = retval.doctors;
    appointments = retval.appointments;
  }
});

afterAll(async () => {
  await mongoose.connection.dropCollection("symptoms");
  await mongoose.connection.dropCollection("specialties");
  await mongoose.connection.dropCollection("users");
  await mongoose.connection.dropCollection("appointments");
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

/**
 * User signs in and makes a payment intent
 */
test("User signs in and makes a payment intent", async () => {
  let userFields = {
    email: "brucewayne@gmail.com",
    password: "batmanishere",
  };
  let res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(patients[7]);
  const cookie = res.headers["set-cookie"];

  res = await supertest(app).post("/patient/pay").set("Cookie", cookie);
  expect(res.status).toBe(200);
});

/**
 * User signs in, searches for a doctor, and then signs out
 */
test("User signs in, searches for doctor, then signs out", async () => {
  let userFields = {
    email: "maryjoe@gmail.com",
    password: "password",
  };
  let res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(patients[1]);
  const cookie = res.headers["set-cookie"];

  // send invalid symptoms first, expect error
  res = await supertest(app).post("/patient/search").set("Cookie", cookie);
  expect(res.status).toBe(400);

  // send valid symptoms now
  res = await supertest(app)
    .post("/patient/search")
    .set("Cookie", cookie)
    .send({
      symptoms: [
        "pain chest",
        "shortness of breath",
        "asthenia",
        "random symptom",
      ],
    });
  expect(res.status).toBe(200);
  expect(res.body["Family Medicine"][0].first_name).toBe("Ben");
  expect(res.body["Family Medicine"][1].first_name).toBe("Bob");

  res = await supertest(app).get("/patient/signout");
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Logout successful");
});

/**
 * User signs in, posts new notifications, then deletes them
 */
test("User signs in, posts new notifications, then deletes them", async () => {
  let userFields = {
    email: "toraamodt@gmail.com",
    password: "CPEN211HELL",
  };
  let res = await supertest(app).post("/doctor/signin").send(userFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(doctors[4]);
  let cookie = res.headers["set-cookie"];
  let userId = res.body.user;

  // POST new notification, successful case
  let notifFields = {
    userId: userId,
    title: "Notif title",
    text: "Notif text",
  };
  res = await supertest(app)
    .post("/doctor/notif")
    .set("Cookie", cookie)
    .send(notifFields);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Notification posted");

  notifFields = {
    userId: userId,
    title: "Another title",
    text: "Another text",
  };
  res = await supertest(app)
    .post("/doctor/notif")
    .set("Cookie", cookie)
    .send(notifFields);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Notification posted");

  // POST new notification, failure case
  notifFields = {
    title: "Notif title",
    text: "Notif text",
  };
  res = await supertest(app)
    .post("/doctor/notif")
    .set("Cookie", cookie)
    .send(notifFields);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("User account doesn't exist");

  // GET notifications, failure case
  res = await supertest(app)
    .get(`/doctor/notif/${appointments[0]}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(400);
  expect(res.body.doctor).toBe("User account doesn't exist");

  res = await supertest(app)
    .get("/doctor/notif/asdfasdf")
    .set("Cookie", cookie);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "asdfasdf" at path "_id" for model "User"'
  );

  // GET notifications, successful case
  res = await supertest(app)
    .get(`/doctor/notif/${userId}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.notifications.length).toBe(2);
  expect(res.body.notifications[0].title).toBe("Notif title");
  expect(res.body.notifications[1].text).toBe("Another text");
  let notifId = res.body.notifications[0]._id;

  // DELETE notification, cast ERROR
  res = await supertest(app)
    .delete("/doctor/notif/asdfasdf")
    .set("Cookie", cookie);
  expect(res.status).toBe(400);
  expect(res.body._id).toBe(
    'Cast to ObjectId failed for value "asdfasdf" at path "_id" for model "Notification"'
  );

  res = await supertest(app)
    .delete(`/doctor/notif/${notifId}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete notification successful");

  res = await supertest(app)
    .delete(`/doctor/notif/${notifId}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(400);
  expect(res.body.notification).toBe("Notification doesn't exist");

  // new notif for patient
  userFields = {
    email: "maryjoe@gmail.com",
    password: "password",
  };
  res = await supertest(app).post("/patient/signin").send(userFields);
  expect(res.status).toBe(200);
  expect(res.body.user).toBe(patients[1]);
  cookie = res.headers["set-cookie"];
  userId = res.body.user;

  notifFields = {
    userId: userId,
    title: "Cool title",
    text: "Notif text",
  };
  res = await supertest(app)
    .post("/patient/notif")
    .set("Cookie", cookie)
    .send(notifFields);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Notification posted");

  res = await supertest(app)
    .get(`/patient/notif/${userId}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.notifications.length).toBe(1);
  expect(res.body.notifications[0].title).toBe("Cool title");
  notifId = res.body.notifications[0]._id;

  res = await supertest(app)
    .delete(`/patient/notif/${notifId}`)
    .set("Cookie", cookie);
  expect(res.status).toBe(200);
  expect(res.body.message).toBe("Delete notification successful");
});
