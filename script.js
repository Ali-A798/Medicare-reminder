// DOM elements
const form = document.getElementById("reminderForm");
const patientInput = document.getElementById("patientName");
const medicineInput = document.getElementById("medicineName");
const timeInput = document.getElementById("dosageTime");
const list = document.getElementById("reminderList");
const alarmSound = document.getElementById("alarmSound");

// Create a notification bar (hidden by default)
const notificationBar = document.createElement("div");
notificationBar.className = "notification-bar";
notificationBar.style.display = "none";
document.body.appendChild(notificationBar);

// Optional: button to unlock audio (helps with browser autoplay rules)
const enableSoundBtn = document.createElement("button");
enableSoundBtn.id = "enableSoundBtn";
enableSoundBtn.textContent = "Enable Sound";
enableSoundBtn.style.position = "fixed";
enableSoundBtn.style.top = "16px";
enableSoundBtn.style.right = "16px";
enableSoundBtn.style.zIndex = "10000";
enableSoundBtn.style.padding = "6px 10px";
enableSoundBtn.style.borderRadius = "999px";
enableSoundBtn.style.border = "none";
enableSoundBtn.style.background = "#2f80ed";
enableSoundBtn.style.color = "#fff";
enableSoundBtn.style.fontSize = "12px";
enableSoundBtn.style.cursor = "pointer";
document.body.appendChild(enableSoundBtn);

enableSoundBtn.addEventListener("click", () => {
  if (!alarmSound) return;

  // try to unlock audio with a tiny sound
  alarmSound.volume = 0.01;
  alarmSound.currentTime = 0;

  const playPromise = alarmSound.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        // success: audio is now unlocked on this device
        alarmSound.pause();
        alarmSound.currentTime = 0;
        alarmSound.volume = 1;
        enableSoundBtn.textContent = "Sound enabled ✅";
        // hide after a moment
        setTimeout(() => {
          enableSoundBtn.style.display = "none";
        }, 800);
      })
      .catch((err) => {
        console.log("Mobile audio unlock failed:", err);
        alert(
          "Your browser blocked the sound. Please turn off silent/vibrate mode and tap Enable Sound again."
        );
      });
  }
});

// Load existing reminders from localStorage
let reminders = JSON.parse(localStorage.getItem("reminders")) || [];
renderReminders();

// Handle form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const reminder = {
    id: Date.now(),
    patient: patientInput.value.trim(),
    medicine: medicineInput.value.trim(),
    time: timeInput.value, // "HH:MM"
    triggered: false,
  };

  if (!reminder.patient || !reminder.medicine || !reminder.time) return;

  reminders.push(reminder);
  saveReminders();
  renderReminders();
  form.reset();
});

// Render list items
function renderReminders() {
  list.innerHTML = "";
  reminders.forEach((r) => {
    const li = document.createElement("li");
    li.className = "reminder-item";
    li.innerHTML = `
      <span>${r.patient} – ${r.medicine} at ${r.time}</span>
      <button onclick="deleteReminder(${r.id})">✕</button>
    `;
    list.appendChild(li);
  });
}

// Delete a reminder
window.deleteReminder = function (id) {
  reminders = reminders.filter((r) => r.id !== id);
  saveReminders();
  renderReminders();
};

function saveReminders() {
  localStorage.setItem("reminders", JSON.stringify(reminders));
}

// Show notification message
function showNotification(message) {
  notificationBar.textContent = message;
  notificationBar.style.display = "block";

  // Hide after 15 seconds
  setTimeout(() => {
    notificationBar.style.display = "none";
  }, 15000);
}

// Check every 30 seconds if any reminder is due
setInterval(() => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  reminders.forEach((r) => {
    if (!r.triggered && r.time === currentTime) {
      r.triggered = true;

      // Show message instead of alert (non‑blocking)
      showNotification(
        `Time to take ${r.medicine} for ${r.patient} at ${r.time}`
      );

      // Try to play alarm sound
      if (alarmSound) {
        alarmSound.currentTime = 0;
        alarmSound.play().catch(() => {
          // If blocked, user can press "Enable Sound" button
        });
      }
    }
  });

  saveReminders();
}, 30000);
const testAlarmBtn = document.getElementById("testAlarmBtn");

if (testAlarmBtn) {
  testAlarmBtn.addEventListener("click", () => {
    if (!alarmSound) return;
    alarmSound.currentTime = 0;
    alarmSound.play().catch((err) => {
      console.log("Test alarm blocked:", err);
      alert("Browser blocked the sound. Check volume and sound settings.");
    });
  });
}
// ---------- Medicine info helper: search by symptom or name ----------

const aiInput = document.getElementById("aiMedicineInput");
const aiBtn = document.getElementById("aiSearchBtn");
const aiResult = document.getElementById("aiResult");

// Demo dataset (simplified, not medical advice)
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
