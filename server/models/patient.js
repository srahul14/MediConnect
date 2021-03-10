const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

// Patient model inheriting from base User and adding new requisite fields
const Patient = User.discriminator(
  "Patient",
  Schema({
    gender: {
      type: String,
      default: "Other",
      enum: ["Female", "Male", "Other"],
    },
    height: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
  })
);

module.exports = mongoose.model("Patient");
