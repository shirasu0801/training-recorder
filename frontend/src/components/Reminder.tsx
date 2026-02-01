import { useState, useEffect } from 'react';

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    padding: '20px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap' as const,
    alignItems: 'flex-end',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  disabledButton: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  reminderList: {
    marginTop: '20px',
  },
  reminderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #eee',
  },
  reminderInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '3px',
  },
  reminderDay: {
    fontWeight: 'bold',
  },
  reminderTime: {
    color: '#666',
    fontSize: '14px',
  },
  deleteButton: {
    padding: '6px 12px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  permissionWarning: {
    backgroundColor: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: '4px',
    padding: '15px',
    marginBottom: '15px',
  },
  permissionButton: {
    marginTop: '10px',
    padding: '8px 16px',
    backgroundColor: '#ff9800',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  noReminders: {
    color: '#999',
    textAlign: 'center' as const,
    padding: '20px',
  },
};

interface Reminder {
  id: string;
  day: string;
  time: string;
  message: string;
}

const DAYS = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
const DAY_VALUES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function ReminderComponent() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [selectedTime, setSelectedTime] = useState('18:00');
  const [message, setMessage] = useState('ワークアウトの時間です!');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Load reminders from localStorage
    const saved = localStorage.getItem('workout-reminders');
    if (saved) {
      setReminders(JSON.parse(saved));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    // Set up reminder check interval
    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Save reminders to localStorage whenever they change
    localStorage.setItem('workout-reminders', JSON.stringify(reminders));
  }, [reminders]);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const checkReminders = () => {
    const now = new Date();
    const currentDay = DAY_VALUES[now.getDay()];
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    reminders.forEach((reminder) => {
      if (reminder.day === currentDay && reminder.time === currentTime) {
        showNotification(reminder.message);
      }
    });
  };

  const showNotification = (message: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('筋トレ記録', {
        body: message,
        icon: '/favicon.ico',
        tag: 'workout-reminder',
      });
    }
  };

  const addReminder = () => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      day: selectedDay,
      time: selectedTime,
      message,
    };
    setReminders([...reminders, newReminder]);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const getDayLabel = (dayValue: string) => {
    const index = DAY_VALUES.indexOf(dayValue);
    return index >= 0 ? DAYS[index] : dayValue;
  };

  const notificationsSupported = 'Notification' in window;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>リマインダー設定</h3>

      {!notificationsSupported && (
        <div style={styles.permissionWarning}>
          このブラウザは通知をサポートしていません。
        </div>
      )}

      {notificationsSupported && notificationPermission === 'default' && (
        <div style={styles.permissionWarning}>
          リマインダーを受け取るには通知を許可してください。
          <br />
          <button style={styles.permissionButton} onClick={requestPermission}>
            通知を許可する
          </button>
        </div>
      )}

      {notificationsSupported && notificationPermission === 'denied' && (
        <div style={styles.permissionWarning}>
          通知がブロックされています。ブラウザの設定から許可してください。
        </div>
      )}

      <div style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>曜日</label>
          <select
            style={styles.select}
            value={selectedDay}
            onChange={(e) => setSelectedDay(e.target.value)}
          >
            {DAY_VALUES.map((day, index) => (
              <option key={day} value={day}>
                {DAYS[index]}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>時間</label>
          <input
            type="time"
            style={styles.input}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.label}>メッセージ</label>
          <input
            type="text"
            style={{ ...styles.input, minWidth: '200px' }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="リマインダーメッセージ"
          />
        </div>
        <button
          style={{
            ...styles.button,
            ...(notificationPermission !== 'granted' ? styles.disabledButton : {}),
          }}
          onClick={addReminder}
          disabled={notificationPermission !== 'granted'}
        >
          追加
        </button>
      </div>

      <div style={styles.reminderList}>
        {reminders.length > 0 ? (
          reminders.map((reminder) => (
            <div key={reminder.id} style={styles.reminderItem}>
              <div style={styles.reminderInfo}>
                <span style={styles.reminderDay}>{getDayLabel(reminder.day)}</span>
                <span style={styles.reminderTime}>
                  {reminder.time} - {reminder.message}
                </span>
              </div>
              <button
                style={styles.deleteButton}
                onClick={() => deleteReminder(reminder.id)}
              >
                削除
              </button>
            </div>
          ))
        ) : (
          <div style={styles.noReminders}>リマインダーがありません</div>
        )}
      </div>
    </div>
  );
}

export default ReminderComponent;
