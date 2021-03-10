/*
 * Module for controlling routes that handle user appointment booking
 */

const User = require("../models/user");
const Patient = require("../models/patient");
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");
const { handleAppointmentErrors } = require("../middleware/errMiddleware");
const appointment = require("../models/appointment");

/**
 * Helper function for postAppointment and putAppointment to find the correct
 * index for adding an appointment to the user's appointments array
 */
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

/**
 * Gets all appointments of a user sorted by appointment start time
 */
const getAppointments = async (req, res) => {
  const id = req.params.id;

  try {
    let appointments = await User.findById(id, "appointments").populate(
      "appointments"
    );
    if (!appointments) throw Error("Invalid user ID");

    for (let i = appointments.appointments.length - 1; i >= 0; i--) {
      if (appointments.appointments[i].end_time < new Date(Date.now())) {
        appointments.appointments.splice(0, i + 1);
      }
    }
    await appointments.save();
    appointments = await User.findById(id, "appointments").populate(
      "appointments"
    );

    res.status(200).json(appointments);
  } catch (err) {
    const errors = handleAppointmentErrors(err);
    res.status(400).json(errors);
  }
};

/**
 * Create a new appointment for patient and doctor with given start_time and
 * end_time. New appointment is added to both users' appointments array
 * in sorted order
 */
const postAppointment = async (req, res) => {
  const { patientId, doctorId } = req.body;

  try {
    // if patient or doctor ID is not valid, do not proceed
    const patient = await Patient.findById(patientId).populate("appointments");
    if (!patient) throw Error("Invalid patient ID");
    const doctor = await Doctor.findById(doctorId).populate("appointments");
    if (!doctor) throw Error("Invalid doctor ID");

    const newAppointment = await Appointment.create(req.body);

    for (
      let patientIndex = 0;
      patientIndex < patient.appointments.length;
      patientIndex++
    ) {
      if (
        patient.appointments[patientIndex].start_time.getTime() ===
          newAppointment.start_time.getTime() ||
        patient.appointments[patientIndex].end_time.getTime() ===
          newAppointment.end_time.getTime()
      ) {
        await newAppointment.deleteOne();
        throw Error("Time slot already booked");
      }
    }

    for (
      let doctorIndex = 0;
      doctorIndex < doctor.appointments.length;
      doctorIndex++
    ) {
      if (
        doctor.appointments[doctorIndex].start_time.getTime() ===
          newAppointment.start_time.getTime() ||
        doctor.appointments[doctorIndex].end_time.getTime() ===
          newAppointment.end_time.getTime()
      ) {
        await newAppointment.deleteOne();
        throw Error("Time slot already booked");
      }
    }

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
    res.status(200).json({ appointment: newAppointment._id });
  } catch (err) {
    const errors = handleAppointmentErrors(err);
    res.status(400).json(errors);
  }
};

/**
 * Update an appointment for patient and doctor with given start_time and
 * end_time. Updated appointment's position in both user's appointments array
 * are updated
 */
const putAppointment = async (req, res) => {
  const appointmentId = req.params.id;

  try {
    const oldAppointment = await Appointment.findById(appointmentId);
    if (!oldAppointment) throw Error("Invalid appointment ID");
    let patient = await Patient.findById(oldAppointment.patientId).populate(
      "appointments"
    );
    let doctor = await Doctor.findById(oldAppointment.doctorId).populate(
      "appointments"
    );
    await Appointment.findByIdAndUpdate(appointmentId, req.body, {
      runValidators: true,
    });
    let appointment = await Appointment.findById(appointmentId);

    for (
      let patientIndex = 0;
      patientIndex < patient.appointments.length;
      patientIndex++
    ) {
      if (
        patient.appointments[patientIndex].start_time.getTime() ===
          appointment.start_time.getTime() ||
        patient.appointments[patientIndex].end_time.getTime() ===
          appointment.end_time.getTime()
      ) {
        await Appointment.findByIdAndUpdate(appointmentId, {
          patientId: oldAppointment.patientId,
          doctorId: oldAppointment.doctorId,
          start_time: oldAppointment.start_time,
          end_time: oldAppointment.end_time,
        });
        throw Error("Time slot already booked");
      }
    }

    for (
      let doctorIndex = 0;
      doctorIndex < doctor.appointments.length;
      doctorIndex++
    ) {
      if (
        doctor.appointments[doctorIndex].start_time.getTime() ===
          appointment.start_time.getTime() ||
        doctor.appointments[doctorIndex].end_time.getTime() ===
          appointment.end_time.getTime()
      ) {
        await Appointment.findByIdAndUpdate(appointmentId, {
          patientId: oldAppointment.patientId,
          doctorId: oldAppointment.doctorId,
          start_time: oldAppointment.start_time,
          end_time: oldAppointment.end_time,
        });
        throw Error("Time slot already booked");
      }
    }

    // get updated version of appointment
    patient = await Patient.findById(appointment.patientId).populate(
      "appointments"
    );
    doctor = await Doctor.findById(appointment.doctorId).populate(
      "appointments"
    );

    // remove the appointment from both the patient's and doctor's appointments
    patient.appointments.pull({ _id: appointmentId });
    doctor.appointments.pull({ _id: appointmentId });

    // add updated appointment to patient and doctor appointments in sorted order
    patient.appointments.splice(
      binarySearch(patient.appointments, appointment.start_time),
      0,
      appointment
    );
    doctor.appointments.splice(
      binarySearch(doctor.appointments, appointment.start_time),
      0,
      appointment
    );
    await patient.save();
    await doctor.save();

    res.status(200).json({ appointment: appointmentId });
  } catch (err) {
    const errors = handleAppointmentErrors(err);
    res.status(400).json(errors);
  }
};

/**
 * Delete specified appointment from database and remove it from patient and
 * doctor's appointments array
 */
const deleteAppointment = async (req, res) => {
  const appointmentId = req.params.id;

  try {
    // if the appointment ID is not valid, do not proceed
    const appointment = await Appointment.findById(appointmentId)
      .populate("patientId")
      .populate("doctorId");
    if (!appointment) throw Error("Invalid appointment ID");

    // remove the appointment from both the patient's and doctor's appointments
    appointment.patientId.appointments.pull({ _id: appointmentId });
    appointment.doctorId.appointments.pull({ _id: appointmentId });
    await appointment.patientId.save();
    await appointment.doctorId.save();
    await appointment.deleteOne();

    res.status(200).json({ message: "Delete appointment successful" });
  } catch (err) {
    const errors = handleAppointmentErrors(err);
    res.status(400).json(errors);
  }
};

module.exports = {
  getAppointments,
  postAppointment,
  putAppointment,
  deleteAppointment,
};
