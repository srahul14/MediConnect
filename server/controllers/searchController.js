const Doctor = require("../models/doctor");
const Symptom = require("../models/disease");
const Specialty = require("../models/specialty");

// map provided symptoms to related diseases
const symptomToDisease = async (req, res) => {
  const { symptoms } = req.body;

  let diseases = [];

  // for each given symptom, get the corresponding disease from database
  for (const symptom of symptoms) {
    let diseaseList = await Symptom.findOne({ symptom: symptom });
    if (diseaseList) {
      diseaseList = diseaseList.disease;
      diseases = diseases.concat(diseaseList);
    }
  }

  return diseases;
};

// map diseases to specializations
const diseaseToSpecialization = async (diseases) => {
  // read temporary JSON file containing mappings of disease to specializations
  let specializations = {};
  let mostCommon = {
    common1: [0, undefined],
    common2: [0, undefined],
    common3: [0, undefined],
  };

  // for each possible disease, return the 3 most common specializations
  for (const disease of diseases) {
    let specs = await Specialty.findOne({ disease: disease });
    specs = specs.specialty;

    for (const spec of specs) {
      if (specializations[spec]) {
        specializations[spec] += 1;
        let num = specializations[spec];

        if (mostCommon.common1[0] < num) {
          mostCommon.common1 = [num, spec];
        } else if (mostCommon.common2[0] < num) {
          mostCommon.common2 = [num, spec];
        } else if (mostCommon.common3[0] < num) {
          mostCommon.common3 = [num, spec];
        }
      } else {
        specializations[spec] = 1;

        if (mostCommon.common1[0] < 1) {
          mostCommon.common1 = [1, spec];
        } else if (mostCommon.common2[0] < 1) {
          mostCommon.common2 = [1, spec];
        } else if (mostCommon.common3[0] < 1) {
          mostCommon.common3 = [1, spec];
        }
      }
    }
  }

  return [mostCommon.common1[1], mostCommon.common2[1], mostCommon.common3[1]];
};

// find a list of doctors suitable for a patient given a patient's symptoms
const findDoctor = async (req, res) => {
  try {
    const diseases = await symptomToDisease(req, res);
    const specializations = await diseaseToSpecialization(diseases);

    const sortedDocs = {};

    // for each of the most suitable specializations, append doctors in order
    // of decreasing ratings
    await Promise.all(
      specializations.map(async (specialization) => {
        const verifiedDoc = [];
        const unverifiedDoc = [];

        const doctors = await Doctor.find({
          specialization: specialization,
        }).sort({
          rating: -1,
        });

        doctors.forEach((doctor) => {
          if (doctor.verified) {
            verifiedDoc.push(doctor);
          } else {
            unverifiedDoc.push(doctor);
          }
        });
        sortedDocs[specialization] = verifiedDoc.concat(unverifiedDoc);
      })
    );

    res.json(sortedDocs);
  } catch (err) {
    res.status(400).json(err);
  }
};

module.exports = { findDoctor };
