(function () {
  let audio = null;
  let activeAlarmReminder = null;
  const popupId = 'reminderPopup';

  // Format date/time nicely
  function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Create popup container if it doesn't exist
  function createPopup() {
    if (document.getElementById(popupId)) return;
    const popup = document.createElement('div');
    popup.id = popupId;
    popup.style = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      z-index: 9999;
      display: none;
      max-width: 320px;
      text-align: center;
      font-family: Arial, sans-serif;
    `;

    popup.innerHTML = `
      <p id="reminderMessage" style="font-size: 18px; margin-bottom: 10px;">⏰ Reminder!</p>
      <p id="reminderDescription" style="font-size: 14px; color: #555; margin-bottom: 6px;"></p>
      <p id="reminderPurpose" style="font-size: 14px; color: #555; margin-bottom: 12px;"></p>
      <button id="closeReminderPopup" style="
        background-color: #ff4444;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
      ">Close</button>
    `;

    document.body.appendChild(popup);

    document.getElementById('closeReminderPopup').onclick = () => {
      popup.style.display = 'none';
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      activeAlarmReminder = null;
    };
  }

  function checkReminders() {
    const reminders = JSON.parse(localStorage.getItem('reminders')) || [];
    const now = new Date();

    for (const reminder of reminders) {
      if (
        reminder.alarmOn &&
        !reminder.done &&
        !reminder.alerted &&
        new Date(reminder.time) <= now
      ) {
        reminder.alerted = true;
        localStorage.setItem('reminders', JSON.stringify(reminders));

        activeAlarmReminder = reminder;

        // Update popup message with reminder details
        const popup = document.getElementById(popupId);
        const message = document.getElementById('reminderMessage');
        const description = document.getElementById('reminderDescription');
        const purpose = document.getElementById('reminderPurpose');

        if (message) {
          message.innerHTML = `⏰ Reminder: <strong>${reminder.name}</strong><br>At: ${formatDateTime(reminder.time)}`;
        }

        if (description) {
          description.textContent = reminder.description || '';  // fallback if no description
        }

        if (purpose) {
          purpose.textContent = reminder.purpose ? `Purpose: ${reminder.purpose}` : '';
        }

        if (popup) popup.style.display = 'block';

        if (!audio) {
          audio = new Audio('NUNCA MUDA_.mp3'); // Your alarm sound file
        }
        audio.play();

        break; // Only alert for one reminder at a time
      }
    }
  }

  createPopup();
  setInterval(checkReminders, 1000);
})();
