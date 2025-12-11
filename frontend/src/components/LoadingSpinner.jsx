import './components.css'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-spinner-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  )
}
