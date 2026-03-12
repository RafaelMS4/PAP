import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import FormModal from '../components/FormModal';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getEmailUsername, buildHelpdeskEmail, HELPDESK_EMAIL_DOMAIN } from '../utils/email';
import '../styles/detail-page.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [equipment, setEquipment] = useState([]);
  const [adminTime, setAdminTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (userData.id) {
        const requests = [
          api.get(`/users/${userData.id}`),
          api.get(`/equipment/getUserEquipment/${userData.id}`).catch(() => ({ data: { equipment: [] } }))
        ];

        // Fetch admin hours if admin
        if (userData.role === 'admin') {
          requests.push(
            api.get('/tickets/stats/admin-hours').catch(() => ({ data: { adminHours: [] } }))
          );
        }

        const responses = await Promise.all(requests);
        
        setUser(responses[0].data.user || responses[0].data);
        setEquipment(responses[1].data.equipment || []);

        if (userData.role === 'admin' && responses[2]) {
          const adminHours = responses[2].data.adminHours || [];
          const myTime = adminHours.find(a => a.id === userData.id);
          setAdminTime(myTime || { total_minutes: 0, total_hours: 0 });
        }
      } else {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData) => {
    try {
      setFormLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const normalizedEmail = buildHelpdeskEmail(formData.email);

      if (!normalizedEmail) {
        alert(`Email inválido. Usa apenas @${HELPDESK_EMAIL_DOMAIN}`);
        return;
      }

      await api.put(`/users/updateUser/${userData.id}`, {
        name: formData.name,
        email: normalizedEmail
      });
      
      // Update localStorage
      const updatedUser = { ...userData, name: formData.name, email: normalizedEmail };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setShowEditModal(false);
      fetchUserProfile();
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>A carregar perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="detail-page">
        <p style={{ color: '#999' }}>Perfil não encontrado</p>
      </div>
    );
  }

  const isAdmin = user.role === 'admin';
  const emailUsername = getEmailUsername(user.email);

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">
          <h1>{user.name}</h1>
          <p className="user-email">{emailUsername}</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
            Editar Perfil
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3d6aff' }}>
            <PersonIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>{user.name}</div>
            <div className="stat-label">Nome</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#9c27b0' }}>
            <EmailIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>{emailUsername}</div>
            <div className="stat-label">Email</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: isAdmin ? '#f44336' : '#3d6aff' }}>
            <BadgeIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.3rem' }}>
              {isAdmin ? 'Administrador' : 'Utilizador'}
            </div>
            <div className="stat-label">Função</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: equipment.length > 0 ? '#4caf50' : '#666' }}>
            <ComputerIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{equipment.length}</div>
            <div className="stat-label">Equipamentos Atribuídos</div>
          </div>
        </div>
        {isAdmin && adminTime && (
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#ff9800' }}>
              <AccessTimeIcon style={{ fontSize: '28px', color: '#fff' }} />
            </div>
            <div>
              <div className="stat-value" style={{ fontSize: '1.3rem' }}>
                {adminTime.total_hours?.toFixed(1) || '0'}h
              </div>
              <div className="stat-label">Tempo Total Registado</div>
            </div>
          </div>
        )}
      </div>

      <div className="profile-sections">
        {/* User Info */}
        <Card>
          <h3>Informações da Conta</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Nome Completo</label>
              <p>{user.name}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{emailUsername}</p>
            </div>
            <div className="info-item">
              <label>Função</label>
              <p>
                <span style={{ 
                  background: isAdmin ? '#f44336' : '#3d6aff',
                  color: '#fff',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  {isAdmin ? 'Administrador' : 'Utilizador'}
                </span>
              </p>
            </div>
            <div className="info-item">
              <label>Data de Registo</label>
              <p>{new Date(user.created_at).toLocaleDateString('pt-PT', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric'
              })}</p>
            </div>
          </div>
        </Card>

        {/* Equipment Section */}
        <Card>
          <h3>Equipamentos Atribuídos</h3>
          {equipment.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
              Nenhum equipamento atribuído
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              {equipment.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: '#2a2a2a',
                    padding: '1.5rem',
                    borderRadius: '10px',
                    borderLeft: '4px solid #3d6aff',
                    cursor: isAdmin ? 'pointer' : 'default',
                    transition: isAdmin ? 'transform 0.2s' : 'none',
                  }}
                  onClick={isAdmin ? () => navigate(`/equipment/${item.id}`) : undefined}
                  onMouseEnter={isAdmin ? (e) => e.currentTarget.style.transform = 'translateX(4px)' : undefined}
                  onMouseLeave={isAdmin ? (e) => e.currentTarget.style.transform = 'translateX(0)' : undefined}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                        {item.name}
                      </div>
                      <div style={{ color: '#999', fontSize: '0.9rem' }}>
                        {item.type} {item.model ? `• ${item.model}` : ''}
                      </div>
                      {item.location && (
                        <div style={{ color: '#999', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {item.location}
                        </div>
                      )}
                    </div>
                    <span style={{ 
                      background: item.status === 'in_use' ? '#3d6aff' : '#4caf50',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem'
                    }}>
                      {item.status === 'in_use' ? 'Em Uso' : item.status === 'available' ? 'Disponível' : item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Profile Modal */}
      {isAdmin && (
        <FormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProfile}
          title="Editar Perfil"
          fields={[
            {
              name: 'name',
              label: 'Nome',
              type: 'text',
              required: true,
              defaultValue: user.name,
              placeholder: 'Escreve o teu nome'
            },
            {
              name: 'email',
              label: `Email (sem @${HELPDESK_EMAIL_DOMAIN})`,
              type: 'text',
              required: true,
              defaultValue: emailUsername,
              placeholder: 'teu.nome'
            }
          ]}
          initialData={{ name: user.name, email: emailUsername }}
          loading={formLoading}
        />
      )}
    </div>
  );
}
