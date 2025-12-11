import './components.css'

export default function Alert({ type = 'info', message, onClose }) {
  return (
    <div className={`alert alert-${type}`} role="alert">
      <span>{message}</span>
      {onClose && (
        <button 
          className="alert-close" 
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  )
}
