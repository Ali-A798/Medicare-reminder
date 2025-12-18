const aiInput = document.getElementById("aiMedicineInput");
const aiBtn = document.getElementById("aiSearchBtn");
const aiResult = document.getElementById("aiResult");

const symptomData = [
  {
    keywords: ["fever", "high temperature", "body pain", "viral"],
    medicine: "Paracetamol",
    info: "Used for fever and mild to moderate pain such as headache, body ache, toothache.",
    note: "Do not exceed recommended daily dose; overdose can damage the liver.",
  },
  {
    keywords: [
      "strong pain",
      "joint pain",
      "period pain",
      "muscle pain",
      "sprain",
    ],
    medicine: "Ibuprofen / Diclofenac",
    info: "Painkiller and anti‑inflammatory for joint, muscle and period pain.",
    note: "Take with food; long‑term self‑use is unsafe in some heart, kidney or stomach problems.",
  },
  {
    keywords: ["cold", "runny nose", "sneezing", "blocked nose"],
    medicine:
      "Cold combinations + Antihistamines (Cetirizine / Levocetirizine)",
    info: "Used for common cold symptoms like sneezing, runny nose and mild fever.",
    note: "Many brands already contain paracetamol + antihistamine + decongestant; avoid taking similar products together.",
  },
  {
    keywords: ["allergy", "itching", "hives"],
    medicine: "Cetirizine / Levocetirizine",
    info: "Antihistamines for allergy symptoms of nose and skin.",
    note: "Can cause drowsiness; avoid driving if you feel sleepy.",
  },
  {
    keywords: ["headache", "migraine", "tension headache"],
    medicine: "Paracetamol / Ibuprofen (headache)",
    info: "Commonly used for headache and mild migraine attacks.",
    note: "Very frequent or severe headaches should be checked by a doctor.",
  },
  {
    keywords: ["throat pain", "sore throat", "throat infection"],
    medicine:
      "Pain relief lozenges, Paracetamol; sometimes Amoxicillin (only if prescribed).",
    info: "Lozenges and paracetamol relieve pain and fever; antibiotics only if bacterial infection and prescribed.",
    note: "Do not start antibiotics like Amoxicillin on your own for simple sore throat.",
  },
  {
    keywords: ["acidity", "gas", "heartburn", "reflux"],
    medicine: "Pantoprazole / Omeprazole / Antacids",
    info: "Reduce stomach acid and give relief in acidity, gas and heartburn.",
    note: "Repeated or long‑term acidity needs medical advice.",
  },
  {
    keywords: ["stomach pain", "abdominal cramps", "colicky pain"],
    medicine: "Dicyclomine",
    info: "Antispasmodic used for abdominal cramps and spasmodic stomach pain.",
    note: "Not for regular daily use; severe or repeated pain should be evaluated.",
  },
  {
    keywords: ["vomiting", "nausea", "travel sickness"],
    medicine: "Domperidone / Ondansetron",
    info: "Medicines used to control nausea and vomiting.",
    note: "Use under medical advice, especially in children and people with heart disease.",
  },
  {
    keywords: ["diarrhoea", "loose motion", "dehydration", "weakness"],
    medicine: "ORS (Oral Rehydration Salts)",
    info: "Replaces water and salts lost in diarrhoea or vomiting.",
    note: "If diarrhoea is severe, bloody, or lasts more than 2 days, visit a doctor.",
  },
];

function searchBySymptomOrName(query) {
  if (!aiResult) return;

  if (!query) {
    aiResult.textContent = "Type a symptom or medicine name to search.";
    return;
  }

  const q = query.toLowerCase();

  const matches = symptomData.filter((item) => {
    const inKeywords = item.keywords.some((k) => k.toLowerCase().includes(q));
    const inName = item.medicine.toLowerCase().includes(q);
    return inKeywords || inName;
  });

  if (!matches.length) {
    aiResult.textContent =
      "No match found in this demo list. Try another symptom or medicine name.";
    return;
  }

  aiResult.innerHTML = matches
    .map(
      (m) => `
      <div style="margin-bottom:8px;">
        <strong>Suggested medicine:</strong> ${m.medicine}<br>
        <strong>Use:</strong> ${m.info}<br>
        <strong>Note:</strong> ${m.note}
      </div>
    `
    )
    .join("");
}

if (aiBtn && aiInput) {
  aiBtn.addEventListener("click", () => {
    searchBySymptomOrName(aiInput.value.trim());
  });

  aiInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchBySymptomOrName(aiInput.value.trim());
    }
  });
}
