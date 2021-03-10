const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const appointmentOptions = {
  timestamps: true,
};

const AppointmentSchema = new Schema(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Please enter patient"],
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: [true, "Please enter doctor"],
    },
    start_time: {
      type: Date,
      required: [true, "Please enter start time"],
    },
    end_time: {
      type: Date,
      required: [true, "Please enter end time"],
    },
  },
  appointmentOptions
);

const secInHour = 1000 * 60 * 60;
AppointmentSchema.pre("save", async function (next) {
  const timeDiff = this.end_time.getTime() - this.start_time.getTime();
  if (timeDiff / secInHour > 24) {
    throw Error("Longer than 1 day");
  }
  if (timeDiff < 0) {
    throw Error("Negative time");
  }
  if (this.start_time < new Date(Date.now())) {
    throw Error("Past appointment");
  }
  next();
});

AppointmentSchema.pre("findOneAndUpdate", async function (next) {
  const start_time = new Date(this._update.start_time);
  const end_time = new Date(this._update.end_time);
  const timeDiff = end_time.getTime() - start_time.getTime();
  if (timeDiff / secInHour > 24) {
    throw Error("Longer than 1 day");
  }
  if (timeDiff < 0) {
    throw Error("Negative time");
  }
  if (start_time < new Date(Date.now())) {
    throw Error("Past appointment");
  }
  next();
});

module.exports = mongoose.model("Appointment", AppointmentSchema);
