(function () {
  const audio = new Audio('alarm.mp3');
  audio.loop = true;

  const popupId = 'reminderPopup';
  let activeAlarmReminder = null;

  // Tab coordination
  const tabId = `${Date.now()}-${Math.random()}`;
  localStorage.setItem('activeAlarmTab', tabId);
  let isLeaderTab = true;

  window.addEventListener('storage', (e) => {
    if (e.key === 'activeAlarmTab' && e.newValue !== tabId) {
      isLeaderTab = false;
    }
  });

  // Optional: Request permission for notifications
  if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
    Notification.requestPermission();
  }

  function notifyUser(reminder) {
    if (Notification.permission === 'granted') {
      new Notification(`⏰ Reminder: ${reminder.name}`, {
        body: reminder.description || 'Your reminder is due!',
        icon: 'alarm-icon.png' // Optional: Add an icon if available
      });
    }
  }

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
      audio.pause();
      audio.currentTime = 0;

      if (activeAlarmReminder) {
        const history = JSON.parse(localStorage.getItem('history')) || [];

        history.push({
          id: activeAlarmReminder.id,
          name: activeAlarmReminder.name,
          purpose: activeAlarmReminder.purpose,
          time: activeAlarmReminder.time
        });

        localStorage.setItem('history', JSON.stringify(history));
      }

      activeAlarmReminder = null;

      // Redirect to history page
      window.location.href = 'history.html';
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

        const popup = document.getElementById(popupId);
        const message = document.getElementById('reminderMessage');
        const description = document.getElementById('reminderDescription');
        const purpose = document.getElementById('reminderPurpose');

        if (message) {
          message.innerHTML = `⏰ Reminder: <strong>${reminder.name}</strong><br>At: ${formatDateTime(reminder.time)}`;
        }
        if (description) {
          description.textContent = reminder.description || '';
        }
        if (purpose) {
          purpose.textContent = reminder.purpose ? `Purpose: ${reminder.purpose}` : '';
        }
        if (popup) popup.style.display = 'block';

        audio.play().catch(err => console.warn('🎵 Alarm audio failed to play:', err));

        notifyUser(reminder);

        // Save notification to Supabase
        saveAlarmNotificationToSupabase(reminder);

        break;
      }
    }
  }

  // Add this function to save notification to Supabase
  async function saveAlarmNotificationToSupabase(reminder) {
    if (typeof supabaseClient === 'undefined') return; // Only run if supabaseClient is available
    try {
      // Check if already notified
      const { data: existing } = await supabaseClient
        .from('notifications')
        .select('id')
        .eq('reminder_id', reminder.id)
        .eq('message', 'Your alarm is coming Up!');

      if (!existing || existing.length === 0) {
        await supabaseClient.from('notifications').insert([{
          reminder_id: reminder.id,
          message: 'Your alarm is coming Up!',
          time: reminder.time,
          read: false
        }]);
      }
    } catch (e) {
      console.warn('Failed to save notification to Supabase:', e.message);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    createPopup();
  });

  setInterval(() => {
    if (document.visibilityState === 'visible' && isLeaderTab) {
      checkReminders();
    }
  }, 1000);

})();
