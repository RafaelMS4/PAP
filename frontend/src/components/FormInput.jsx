import './components.css'

export default function FormInput({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  error,
  ...props 
}) {
  return (
    <div className="form-input-group">
      {label && <label className="form-input-label" htmlFor={props.id}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-input-field ${error ? 'error' : ''}`}
        {...props}
      />
      {error && <span className="form-input-error">{error}</span>}
    </div>
  )
}
