const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const specialtySchema = new Schema({
  disease: {
    type: String,
    required: true,
  },
  specialty: [{ type: String }],
});

module.exports = mongoose.model("Specialty", specialtySchema);
