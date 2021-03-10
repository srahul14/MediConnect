const fs = require("fs").promises;

const get_list = async () => {
  const data = await fs.readFile("./public/data/symptom-disease.json");
  const json_data = JSON.parse(data);
  let symptoms = [];
  try {
    for (const [key, value] of Object.entries(json_data)) {
      symptoms.push(key);
    }
    await fs.writeFile(
      "./public/data/symptom_list.json",
      JSON.stringify(symptoms)
    );
  } catch (err) {
    console.log(err);
  }
};

const main = async () => {
  get_list();
};

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.log(err);
  }
}
