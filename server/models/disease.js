const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const symptomSchema = new Schema({
  symptom: {
    type: String,
    required: true,
  },
  disease: [{ type: String }],
});

module.exports = mongoose.model("Symptom", symptomSchema);
