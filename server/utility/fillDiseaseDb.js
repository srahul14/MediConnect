const mongoose = require("mongoose");
const fs = require("fs").promises;
const Symptom = require("../models/disease");

const userArgs = process.argv.slice(2);

const fillSymptomDB = async () => {
  const data = await fs.readFile("./public/data/symptom-disease.json");
  const diseases_list = JSON.parse(data);

  try {
    for (const [key, value] of Object.entries(diseases_list)) {
      let symptomDetail = {
        symptom: key,
        disease: value,
      };
      await Symptom.create(symptomDetail);
    }
  } catch (err) {
    console.log(err);
  }
};

const main = async () => {
  console.log("Reading JSON file to MongoDB");

  const mongoDB = userArgs[0];
  await mongoose.connect(mongoDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));

  await fillSymptomDB();

  db.close();
};

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.log(err);
  }
}

module.exports = fillSymptomDB;
