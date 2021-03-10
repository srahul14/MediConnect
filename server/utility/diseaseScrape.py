import requests, re, json
from bs4 import BeautifulSoup

# get the disease page's html
source = requests.get(
    "https://impact.dbmi.columbia.edu/~friedma/Projects/DiseaseSymptomKB/index.html"
).text
soup = BeautifulSoup(source, "lxml")

# iterate through all table rows and build symptom to disease mapping
table = soup.find("table", class_="MsoTableWeb3")
rows = table.find_all("tr")
freq_table = {}
last_disease = ""
num_diseases, num_symptoms = 0, 0
for row in rows[1:]:
    disease_raw, _, symptom_raw = row.find_all("td")

    disease_new = disease_raw.text.replace("\n", " ").strip()
    disease_new = re.sub(r"(\s)+", " ", disease_new)[14:]
    if disease_new:
        num_diseases += 1
        last_disease = disease_new.split("^")[0]

    symptom_new = symptom_raw.text.replace("\n", " ").strip()
    symptom_new = re.sub(r"(\s)+", " ", symptom_new)[14:]

    if symptom_new:
        symptom_new = symptom_new.split("^")[0]

        if symptom_new in freq_table:
            freq_table[symptom_new].append(last_disease)
        else:
            num_symptoms += 1
            freq_table[symptom_new] = [last_disease]

print(num_diseases, num_symptoms)
# write symptom to disease mapping to JSON file
with open("symptom-disease.json", "w") as f:
    json.dump(freq_table, f)