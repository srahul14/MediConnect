#! /usr/bin/env node

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const Doctor = require("../models/doctor");
const Patient = require("../models/patient");
const Appointment = require("../models/appointment");
const mongoose = require("mongoose");

const doctors = [];
const patients = [];
const appointments = [];
const nextYear = new Date().getFullYear() + 1;

async function doctorCreate(
  first_name,
  last_name,
  email,
  pw,
  age,
  specialization,
  years_of_exp,
  verified = false
) {
  const doctorDetails = {
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: pw,
    age: age,
    specialization: specialization,
    years_of_experience: years_of_exp,
    verified: verified,
  };

  try {
    const doctor = await Doctor.create(doctorDetails);
    doctors.push(String(doctor._id));
  } catch (err) {
    console.log(err);
  }
}

async function patientCreate(
  first_name,
  last_name,
  email,
  pw,
  age,
  gender,
  height,
  weight
) {
  const patientDetails = {
    first_name: first_name,
    last_name: last_name,
    email: email,
    password: pw,
    age: age,
    gender: gender,
    height: height,
    weight: weight,
  };

  try {
    const patient = await Patient.create(patientDetails);
    patients.push(String(patient._id));
  } catch (err) {
    console.log(err);
  }
}

const binarySearch = (array, value) => {
  let low = 0;
  let high = array.length;

  while (low < high) {
    let mid = (low + high) >>> 1;
    if (array[mid].start_time < value) low = mid + 1;
    else high = mid;
  }

  return low;
};

async function appointmentCreate(
  patientIndex,
  doctorIndex,
  start_time,
  end_time
) {
  const patientId = patients[patientIndex];
  const doctorId = doctors[doctorIndex];

  const appointmentDetails = {
    patientId: patientId,
    doctorId: doctorId,
    start_time: start_time,
    end_time: end_time,
  };

  // if patient or doctor ID is not valid, do not proceed
  const patient = await Patient.findById(patientId).populate("appointments");
  const doctor = await Doctor.findById(doctorId).populate("appointments");

  const newAppointment = await Appointment.create(appointmentDetails);

  // add new appointment to patient and doctor appointments in sorted order
  patient.appointments.splice(
    binarySearch(patient.appointments, newAppointment.start_time),
    0,
    newAppointment
  );
  doctor.appointments.splice(
    binarySearch(doctor.appointments, newAppointment.start_time),
    0,
    newAppointment
  );
  await patient.save();
  await doctor.save();

  appointments.push(String(newAppointment._id));
}

async function createDoctors() {
  await doctorCreate(
    "Alex",
    "Jones",
    "alexjones@gmail.com",
    "12345678",
    46,
    "Neurology",
    20,
    true
  );
  await doctorCreate(
    "Michael",
    "Jordan",
    "micjordan@gmail.com",
    "abcdefghi",
    57,
    "Neurology",
    10
  );
  await doctorCreate(
    "Michael",
    "Jackson",
    "micjackson@gmail.com",
    "thriller",
    50,
    "Gynecology",
    5
  );
  await doctorCreate(
    "Donald",
    "Drumpf",
    "donalddrumpf@gmail.com",
    "makedonalddrumpfagain",
    74,
    "Internal medicine",
    40,
    true
  );
  await doctorCreate(
    "Tor",
    "Aamodt",
    "toraamodt@gmail.com",
    "CPEN211HELL",
    45,
    "Oncology",
    30
  );
  await doctorCreate(
    "John",
    "Lennon",
    "johnlennon@gmail.com",
    "imaginetheresnoheaven",
    40,
    "Pulmonology",
    2
  );
  await doctorCreate(
    "Mickey",
    "Mouse",
    "mickeymouse@gmail.com",
    "talkingrat",
    100,
    "Oncology",
    70,
    true
  );
  await doctorCreate(
    "Rick",
    "Astley",
    "rickastley@gmail.com",
    "nevergonnagiveyouup",
    54,
    "Psychiatry",
    7
  );
  await doctorCreate(
    "Bob",
    "Builder",
    "sendbobs@gmail.com",
    "bobsandvagene",
    80,
    "Family Medicine",
    50
  );
  await doctorCreate(
    "Ben",
    "Dover",
    "mike_oxlong@gmail.com",
    "bdebdebde",
    40,
    "Family Medicine",
    10,
    true
  );
}

async function createPatients() {
  await patientCreate(
    "John",
    "Smith",
    "johnsmith@gmail.com",
    "password",
    30,
    "Male",
    180,
    80
  );
  await patientCreate(
    "Mary",
    "Joe",
    "maryjoe@gmail.com",
    "password",
    30,
    "Female",
    170,
    60
  );
  await patientCreate(
    "Sam",
    "Sung",
    "samsung@gmail.com",
    "password",
    20,
    "Male",
    175,
    60
  );
  await patientCreate(
    "Kyle",
    "Red",
    "kylered@gmail.com",
    "passlmao",
    12,
    "Male",
    160,
    50
  );
  await patientCreate(
    "Lucy",
    "Stank",
    "lucystank@gmail.com",
    "bigpwpwpw",
    22,
    "Female",
    150,
    40
  );
  await patientCreate(
    "Susan",
    "Doyle",
    "susandoyle@gmail.com",
    "sdpwsdpw",
    40,
    "Female",
    165,
    70
  );
  await patientCreate(
    "Cpt",
    "Jack",
    "cptjack@gmail.com",
    "ayeayecpt",
    29,
    "Male",
    175,
    70
  );
  await patientCreate(
    "Bruce",
    "Wayne",
    "brucewayne@gmail.com",
    "batmanishere",
    40,
    "Male",
    185,
    80
  );
}

async function createAppointments() {
  await appointmentCreate(
    0,
    0,
    new Date(nextYear, 11, 20, 11, 0),
    new Date(nextYear, 11, 20, 12, 0)
  );
  await appointmentCreate(
    1,
    0,
    new Date(nextYear, 11, 21, 11, 0),
    new Date(nextYear, 11, 21, 12, 0)
  );
  await appointmentCreate(
    2,
    0,
    new Date(nextYear, 11, 22, 11, 0),
    new Date(nextYear, 11, 22, 12, 0)
  );
  await appointmentCreate(
    3,
    1,
    new Date(nextYear, 11, 20, 11, 0),
    new Date(nextYear, 11, 20, 12, 0)
  );
  await appointmentCreate(
    0,
    1,
    new Date(nextYear, 11, 21, 11, 0),
    new Date(nextYear, 11, 21, 12, 0)
  );
  await appointmentCreate(
    0,
    2,
    new Date(nextYear, 11, 22, 11, 0),
    new Date(nextYear, 11, 22, 12, 0)
  );
  await appointmentCreate(
    3,
    0,
    new Date(nextYear, 11, 23, 11, 0),
    new Date(nextYear, 11, 23, 12, 0)
  );
  await appointmentCreate(
    0,
    0,
    new Date(nextYear, 11, 24, 11, 0),
    new Date(nextYear, 11, 24, 12, 0)
  );
  await appointmentCreate(
    5,
    5,
    new Date(nextYear, 11, 24, 11, 0),
    new Date(nextYear, 11, 24, 12, 0)
  );
  await appointmentCreate(
    5,
    0,
    new Date(nextYear, 11, 26, 11, 0),
    new Date(nextYear, 11, 26, 12, 0)
  );
}

const populateDB = async () => {
  try {
    await createPatients();
    await createDoctors();
    await createAppointments();

    console.log("Done populating");

    return {
      doctors,
      patients,
      appointments,
    };
  } catch (err) {
    console.log(err);

    return null;
  }
};

const main = async () => {
  const mongoDB = userArgs[0];
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  await populateDB();

  db.close();
};

// this part only gets executed if running populatedb.js as the main file
if (require.main === module) {
  console.log(
    "This script populates your database with entries for doctors and patients"
  );

  main();
}

module.exports = populateDB;
