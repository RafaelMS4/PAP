import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import FormModal from '../components/FormModal';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import '../styles/detail-page.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [equipment, setEquipment] = useState([]);
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
        const [userResponse, equipmentResponse] = await Promise.all([
          api.get(`/users/${userData.id}`),
          api.get(`/equipment/getUserEquipment/${userData.id}`).catch(() => ({ data: { equipment: [] } }))
        ]);
        
        setUser(userResponse.data.user || userResponse.data);
        setEquipment(equipmentResponse.data.equipment || []);
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
      await api.put(`/users/updateUser/${userData.id}`, {
        name: formData.name,
        email: formData.email
      });
      
      // Update localStorage
      const updatedUser = { ...userData, name: formData.name, email: formData.email };
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

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">
          <h1>{user.name}</h1>
          <p className="user-email">{user.email}</p>
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
            <div className="stat-value" style={{ fontSize: '1.1rem' }}>{user.email}</div>
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
      </div>

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
            <p>{user.email}</p>
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
                        📍 {item.location}
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
              label: 'Email',
              type: 'text',
              required: true,
              defaultValue: user.email,
              placeholder: 'teu@email.com'
            }
          ]}
          loading={formLoading}
        />
      )}
    </div>
  );
}
