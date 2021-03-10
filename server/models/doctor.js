const mongoose = require("mongoose");
const User = require("./user");
const Schema = mongoose.Schema;

const DoctorSchema = new Schema({
  specialization: {
    type: String,
    default: "Unknown",
    required: [false, "Please enter specialization"],
  },
  years_of_experience: {
    type: Number,
    default: 0,
    required: [false, "Please enter years of experience"],
    min: [0, "Years of experience must be at least 0"],
  },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
});

DoctorSchema.pre("save", function (next) {
  this.rating = this.verified
    ? this.years_of_experience * 2
    : this.years_of_experience;
  next();
});

DoctorSchema.pre("findOneAndUpdate", async function (next) {
  const verified = this._update.verified;
  const years_of_exp = this._update.years_of_experience;
  this._update.rating = verified ? years_of_exp * 2 : years_of_exp;
  next();
});

// Doctor model inheriting from base User and adding new requisite fields
const Doctor = User.discriminator("Doctor", DoctorSchema);

module.exports = mongoose.model("Doctor");
