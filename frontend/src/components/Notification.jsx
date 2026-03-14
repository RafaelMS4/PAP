import { useEffect } from 'react';
import './components.css';

export default function Notification({ id, type = 'info', message, onClose, duration = 5000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, onClose, duration]);

  return (
    <div className={`notification notification-${type}`} role="alert">
      <div className="notification-content">
        <span className="notification-icon">
          {type === 'success' && '✓'}
          {type === 'error' && '✕'}
          {type === 'warning' && '⚠'}
          {type === 'info' && 'ℹ'}
        </span>
        <span className="notification-message">{message}</span>
      </div>
      <button
        className="notification-close"
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}