const mongoose = require("mongoose");

// Error handler
const handleErrors = (err) => {
  let errors = { first_name: "", last_name: "", email: "", password: "" };

  // incorrect email
  if (err.message === "Incorrect email") {
    errors.email = "Email not registered";
  }

  // incorrect password
  if (err.message === "Incorrect password") {
    errors.password = err.message;
  }

  // duplicate error code
  if (err.code === 11000) {
    errors.email = "Email already registered";
    return errors;
  }

  if (err.message === "Please enter email") {
    errors.email = err.message;
  }

  if (err.message === "Please enter password") {
    errors.password = err.message;
  }

  // incorrect patient ID
  if (err.message === "Invalid patient ID") {
    errors.patient = "Patient account doesn't exist";
  }

  // incorrect doctor ID
  if (err.message === "Invalid doctor ID") {
    errors.doctor = "Doctor account doesn't exist";
  }

  // incorrect user ID
  if (err.message === "Invalid user ID") {
    errors.patient = "User account doesn't exist";
    errors.doctor = "User account doesn't exist";
  }

  // incorrect notification ID
  if (err.message === "Invalid notification ID") {
    errors.notification = "Notification doesn't exist";
  }

  // CastError
  if (err.name === "CastError") {
    errors[err.path] = err.message;
  }

  // validation errors
  if (
    err.message.includes("Patient validation failed") ||
    err.message.includes("Doctor validation failed") ||
    err.message.includes("Validation failed")
  ) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }

  return errors;
};

const handleAppointmentErrors = (err) => {
  let errors = { patientId: "", doctorId: "", start_time: "", end_time: "" };

  // incorrect patient ID
  if (err.message === "Invalid patient ID") {
    errors.patient = "Patient account doesn't exist";
  }

  // incorrect doctor ID
  if (err.message === "Invalid doctor ID") {
    errors.doctor = "Doctor account doesn't exist";
  }

  // incorrect user ID
  if (err.message === "Invalid user ID") {
    errors.patient = "User account doesn't exist";
    errors.doctor = "User account doesn't exist";
  }

  // incorrect appointment ID
  if (err.message === "Invalid appointment ID") {
    errors.start_time = "Appointment doesn't exist";
    errors.end_time = "Appointment doesn't exist";
  }

  // Appointment longer than 1 day
  if (err.message === "Longer than 1 day") {
    errors.start_time = "Appointment cannot be longer than 1 day";
  }

  // Appointment end_time earlier than start_time
  if (err.message === "Negative time") {
    errors.start_time = "Appointment end time earlier than start time";
  }

  // Time slot already has an appointment
  if (err.message === "Time slot already booked") {
    errors.start_time = "Appointment can't be booked for this time slot";
    errors.end_time = "Appointment can't be booked for this time slot";
  }
  // Appointment start time in the past
  if (err.message === "Past appointment") {
    errors.start_time = "Must make future appointments";
  }

  // CastError
  if (err.name === "CastError") {
    errors[err.path] = err.message;
  }

  // validation errors
  if (err.message.includes("Appointment validation failed")) {
    Object.values(err.errors).forEach((error) => {
      errors[error.path] = error.message;
    });
  }

  return errors;
};

module.exports = { handleErrors, handleAppointmentErrors };
