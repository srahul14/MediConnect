const mongoose = require("mongoose");
const fs = require("fs").promises;
const Specialty = require("../models/specialty.js");

const userArgs = process.argv.slice(2);

const specialties = [
  "Allergy and Immunology",
  "Anesthesiology",
  "Colon and Rectal Surgery",
  "Dermatology",
  "Emergency Medicine",
  "Family Medicine",
  "Internal Medicine",
  "Medical Genetics and Genomics",
  "Neurological Surgery",
  "Nuclear Medicine",
  "Obstetrics and Gynecology",
  "Ophthalmology",
  "Orthopaedic Surgery",
  "Otolaryngology",
  "Pathology",
  "Pediatrics",
  "Physical Medicine and Rehabilitation",
  "Plastic Surgery",
  "Preventive Medicine",
  "Psychiatry and Neurology",
  "Radiology",
  "Surgery",
  "Thoracic Surgery",
  "Urology",
];

/*
 * Get list of diseases from the JSON file that has the symptom-disease mapping
 */
const getDiseaseList = async () => {
  const data = await fs.readFile("./public/data/symptom-disease.json");
  const diseases_list = JSON.parse(data);
  const diseases = [];

  // Create a list of diseases in the diseases[] array
  try {
    for (const [key, value] of Object.entries(diseases_list)) {
      for (var i = 0; i < value.length; i++) {
        if (!diseases.includes(value[i])) diseases.push(value[i]);
      }
    }
  } catch (err) {
    console.log(err);
  }

  return diseases;
};

const fillSpecialtyDB = async () => {
  const diseases = await getDiseaseList();

  // Create Mongo objects for the specialty schema and add them to the database
  try {
    for (let i = 0; i < diseases.length; i++) {
      // Arbitrarily pick 1-4 specialties
      let numSpecialties = Math.floor(Math.random() * 3 + 1);
      let specs = ["Family Medicine"];

      // Find 1-4 random specialties set them as the specialties for a given disease
      for (let j = 0; j < numSpecialties; j++) {
        spec = specialties[Math.floor(Math.random() * specialties.length)];
        while (specs.includes(spec))
          spec = specialties[Math.floor(Math.random() * specialties.length)];

        specs.push(spec);
      }

      let specialtyDetail = {
        disease: diseases[i],
        specialty: specs,
      };
      // Create object in the database with this info
      await Specialty.create(specialtyDetail);
    }
  } catch (err) {
    console.log(err);
  }
};

const main = async () => {
  console.log("Adding disease-specialties to MongoDB");

  const mongoDB = userArgs[0];
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  await fillSpecialtyDB();

  db.close();
};

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.log(err);
  }
}

module.exports = fillSpecialtyDB;
