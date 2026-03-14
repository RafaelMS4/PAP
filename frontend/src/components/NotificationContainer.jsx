import { useState, useCallback } from 'react';
import Notification from './Notification';
import './components.css';

export default function NotificationContainer() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((type, message, duration = 5000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Expose addNotification globally
  window.showNotification = addNotification;

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={removeNotification}
          duration={notification.duration}
        />
      ))}
    </div>
  );
}