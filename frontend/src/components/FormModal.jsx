import { useState, useEffect, memo } from 'react';
import { Modal } from './Modal';
import '../styles/forms.css';

export const FormModal = memo(({ 
  isOpen, 
  title, 
  fields, 
  onSubmit, 
  onClose, 
  loading = false,
  initialData = null
}) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
    } else if (isOpen && !initialData) {
      setFormData({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <Modal isOpen={isOpen} title={title} onClose={onClose} size="medium">
      <form className="form" onSubmit={handleSubmit}>
        {fields.map(field => (
          <div key={field.name} className="form-group">
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
            
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading}
                rows={field.rows || 4}
                className="form-input form-textarea"
              />
            ) : field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
                disabled={loading}
                className="form-input"
              >
                <option value="">Seleciona uma opção</option>
                {field.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <div className="checkbox-group">
                <input
                  id={field.name}
                  type="checkbox"
                  name={field.name}
                  checked={formData[field.name] || false}
                  onChange={handleChange}
                  disabled={loading}
                  className="form-checkbox"
                />
                <label htmlFor={field.name} className="checkbox-label">
                  {field.label}
                </label>
              </div>
            ) : (
              <input
                id={field.name}
                type={field.type || 'text'}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleChange}
                placeholder={field.placeholder}
                required={field.required}
                disabled={loading}
                className="form-input"
              />
            )}
            
            {field.help && <p className="form-help">{field.help}</p>}
          </div>
        ))}

        <div className="form-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </div>
      </form>
    </Modal>
  );
});

export default FormModal;
