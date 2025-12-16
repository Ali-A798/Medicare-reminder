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

  alarmSound.volume = 0;
  alarmSound
    .play()
    .then(() => {
      alarmSound.pause();
      alarmSound.currentTime = 0;
      alarmSound.volume = 1;
      enableSoundBtn.style.display = "none";
    })
    .catch(() => {
      // ignore if browser still blocks it
    });
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
