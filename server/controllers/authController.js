/*
 * Module for controlling routes that handle user (both patient and doctor)
 * authentication. Uses JSON web tokens to sign users into MediConnect
 */

const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const { handleErrors } = require("../middleware/errMiddleware");
const jwt = require("jsonwebtoken");

/*
 * Common functions for all users (patients and doctors), the type of user
 * is specified by the model parameter
 */

// Token creation
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "mediconnect sneaky secret", { expiresIn: maxAge });
};

// Register user in database. User must have provided legal parameters
const signupUser = async (req, res, model, userObj) => {
  try {
    const newUser = await model.create(userObj);
    const token = createToken(newUser._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: newUser._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

// Sign in user. User must have provided legal parameters
const signinUser = async (req, res, model) => {
  const { email, password } = req.body;

  try {
    const user = await model.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json(errors);
  }
};

// Sign out user
const signoutUser = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ message: "Logout successful" });
};

/*
 * Controller functions for patient routes and doctor routes. Usually call
 * common handler functions "User"
 */

// Post a new patient to database through signup
const signupPatient = (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    age,
    gender,
    height,
    weight,
  } = req.body;

  signupUser(req, res, Patient, {
    first_name,
    last_name,
    email,
    password,
    age,
    gender,
    height,
    weight,
  });
};

// Post a patient signin
const signinPatient = (req, res) => {
  signinUser(req, res, Patient);
};

// Get patient signout
const signoutPatient = (req, res) => {
  signoutUser(req, res);
};

// Post a new doctor to database through signup
const signupDoctor = (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    age,
    specialization,
    years_of_experience,
    verified,
  } = req.body;

  signupUser(req, res, Doctor, {
    first_name,
    last_name,
    email,
    password,
    age,
    specialization,
    years_of_experience,
    verified,
  });
};

// Post a doctor signin
const signinDoctor = (req, res) => {
  signinUser(req, res, Doctor);
};

// Get doctor signout
const signoutDoctor = (req, res) => {
  signoutUser(req, res);
};

module.exports = {
  signupPatient,
  signinPatient,
  signoutPatient,
  signupDoctor,
  signinDoctor,
  signoutDoctor,
};
