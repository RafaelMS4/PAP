import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FormModal from '../components/FormModal';
import { ConfirmModal, Modal } from '../components/Modal';
import Card from '../components/Card';
import ComputerIcon from '@mui/icons-material/Computer';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../styles/detail-page.css';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState(null);
  const [assignedUser, setAssignedUser] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [assignUserModal, setAssignUserModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  useEffect(() => {
    // Block access for non-admin users
    if (!isAdmin) {
      navigate('/user-dashboard');
      return;
    }
    fetchEquipmentData();
  }, [id, isAdmin, navigate]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableUsers.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(availableUsers);
    }
  }, [searchQuery, availableUsers]);

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/equipment/getEquipmentID/${id}`);
      
      const equipmentData = response.data.equipment;
      if (!equipmentData) {
        navigate('/equipment');
        return;
      }

      setEquipment(equipmentData);

      // Fetch assigned user if equipment is assigned
      if (equipmentData.assigned_to) {
        try {
          const userResponse = await api.get(`/users/${equipmentData.assigned_to}`);
          setAssignedUser(userResponse.data.user);
        } catch (error) {
          console.error('Erro ao buscar utilizador atribuído:', error);
          setAssignedUser(null);
        }
      } else {
        setAssignedUser(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do equipamento:', error);
      navigate('/equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEquipment = async (formData) => {
    try {
      setFormLoading(true);
      await api.put(`/equipment/updateEquipment/${id}`, {
        name: formData.name,
        type: formData.type,
        model: formData.model,
        location: formData.location,
        status: formData.status
      });
      setEditModal(false);
      fetchEquipmentData();
    } catch (error) {
      console.error('Erro ao atualizar equipamento:', error);
      alert('Erro ao atualizar equipamento');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteEquipment = async () => {
    try {
      setFormLoading(true);
      await api.delete(`/equipment/deleteEquipment/${id}`);
      navigate('/equipment');
    } catch (error) {
      console.error('Erro ao eliminar equipamento:', error);
      alert('Erro ao eliminar equipamento');
      setFormLoading(false);
    }
  };

  const handleUnassignUser = async () => {
    if (!confirm('Desatribuir este equipamento do utilizador?')) return;
    
    try {
      await api.put(`/equipment/updateEquipment/${id}`, {
        assignedTo: null,
        status: 'available'
      });
      fetchEquipmentData();
    } catch (error) {
      console.error('Erro ao desatribuir equipamento:', error);
      alert('Erro ao desatribuir equipamento');
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/users/getUsers', {
        params: { limit: 100 }
      });
      setAvailableUsers(response.data.users || []);
    } catch (error) {
      console.error('Erro ao buscar utilizadores disponíveis:', error);
    }
  };

  const handleAssignUser = async (userId) => {
    try {
      await api.put(`/equipment/updateEquipment/${id}`, {
        assignedTo: userId,
        status: 'in_use'
      });
      setAssignUserModal(false);
      setSearchQuery('');
      fetchEquipmentData();
    } catch (error) {
      console.error('Erro ao atribuir utilizador:', error);
      alert('Erro ao atribuir utilizador');
    }
  };

  const getStatusInfo = () => {
    const statusMap = {
      available: { label: 'Disponível', color: '#4caf50', icon: '✓' },
      in_use: { label: 'Em Uso', color: '#3d6aff', icon: '●' },
      maintenance: { label: 'Manutenção', color: '#ff9800', icon: '⚠' },
      retired: { label: 'Reformado', color: '#999', icon: '✕' }
    };
    return statusMap[equipment?.status] || statusMap.available;
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>A carregar...</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="detail-page">
        <p>Equipamento não encontrado</p>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="header-top">
          <button className="btn-back" onClick={() => navigate('/equipment')}>
            <ArrowBackIcon style={{ fontSize: '20px' }} /> Voltar
          </button>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={() => setEditModal(true)}>
              <EditIcon style={{ fontSize: '18px' }} /> Editar
            </button>
            <button className="btn btn-danger" onClick={() => setDeleteModal(true)}>
              <DeleteIcon style={{ fontSize: '18px' }} /> Eliminar
            </button>
          </div>
        </div>
        <div className="detail-title">
          <h1>{equipment.name}</h1>
          <p className="user-email">{equipment.type}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: statusInfo.color }}>
            <CheckCircleIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{statusInfo.label}</div>
            <div className="stat-label">Status</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#9c27b0' }}>
            <LocationOnIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{equipment.location || '-'}</div>
            <div className="stat-label">Localização</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ff9800' }}>
            <ComputerIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>{equipment.model || '-'}</div>
            <div className="stat-label">Modelo</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: assignedUser ? '#3d6aff' : '#666' }}>
            <PersonIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.5rem' }}>
              {assignedUser ? assignedUser.name : 'Não atribuído'}
            </div>
            <div className="stat-label">Utilizador</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Informação
        </button>
        <button 
          className={`tab ${activeTab === 'user' ? 'active' : ''}`}
          onClick={() => setActiveTab('user')}
        >
          Utilizador Atribuído
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <Card>
            <h3>Detalhes do Equipamento</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nome</label>
                <p>{equipment.name}</p>
              </div>
              <div className="info-item">
                <label>Tipo</label>
                <p>{equipment.type}</p>
              </div>
              <div className="info-item">
                <label>Modelo</label>
                <p>{equipment.model || '-'}</p>
              </div>
              <div className="info-item">
                <label>Localização</label>
                <p>{equipment.location || '-'}</p>
              </div>
              <div className="info-item">
                <label>Status</label>
                <p>
                  <span style={{ 
                    background: statusInfo.color,
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem'
                  }}>
                    {statusInfo.label}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Data de Criação</label>
                <p>{new Date(equipment.created_at).toLocaleDateString('pt-PT', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'user' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Utilizador Atribuído</h3>
              {assignedUser ? (
                <button className="btn btn-danger" onClick={handleUnassignUser}>
                  Desatribuir
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    fetchAvailableUsers();
                    setAssignUserModal(true);
                  }}
                >
                  + Atribuir Utilizador
                </button>
              )}
            </div>
            {!assignedUser ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Este equipamento não está atribuído a nenhum utilizador
              </p>
            ) : (
              <div className="info-grid">
                <div className="info-item">
                  <label>Nome</label>
                  <p>{assignedUser.name}</p>
                </div>
                <div className="info-item">
                  <label>Email</label>
                  <p>{assignedUser.email}</p>
                </div>
                <div className="info-item">
                  <label>Função</label>
                  <p>
                    <span style={{ 
                      background: assignedUser.role === 'admin' ? '#f44336' : '#3d6aff',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem'
                    }}>
                      {assignedUser.role === 'admin' ? 'Admin' : 'Utilizador'}
                    </span>
                  </p>
                </div>
                <div className="info-item">
                  <label>Ver Perfil</label>
                  <p>
                    <button 
                      className="btn btn-primary" 
                      onClick={() => navigate(`/users/${assignedUser.id}`)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                    >
                      Ver Utilizador
                    </button>
                  </p>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={editModal}
        onClose={() => setEditModal(false)}
        onSubmit={handleUpdateEquipment}
        title="Editar Equipamento"
        fields={[
          { name: 'name', label: 'Nome', type: 'text', defaultValue: equipment.name, required: true },
          { name: 'type', label: 'Tipo', type: 'text', defaultValue: equipment.type, required: true },
          { name: 'model', label: 'Modelo', type: 'text', defaultValue: equipment.model },
          { name: 'location', label: 'Localização', type: 'text', defaultValue: equipment.location },
          { 
            name: 'status', 
            label: 'Status', 
            type: 'select',
            defaultValue: equipment.status,
            options: [
              { value: 'available', label: 'Disponível' },
              { value: 'in_use', label: 'Em Uso' },
              { value: 'maintenance', label: 'Manutenção' },
              { value: 'retired', label: 'Reformado' }
            ]
          }
        ]}
        loading={formLoading}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteEquipment}
        title="Eliminar Equipamento"
        message={`Tem a certeza que deseja eliminar "${equipment.name}"?`}
        loading={formLoading}
      />

      {/* Assign User Modal */}
      <Modal
        isOpen={assignUserModal}
        onClose={() => {
          setAssignUserModal(false);
          setSearchQuery('');
        }}
        title="Atribuir Utilizador"
      >
        <div className="equipment-search-modal">
          <input
            type="text"
            placeholder="Procurar por nome ou email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <div className="equipment-list">
            {filteredUsers.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                {searchQuery ? 'Nenhum utilizador encontrado' : 'A carregar utilizadores...'}
              </p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="equipment-item"
                  onClick={() => handleAssignUser(user.id)}
                >
                  <div>
                    <div className="equipment-item-name">{user.name}</div>
                    <div className="equipment-item-details">
                      {user.email}
                      {user.role && (
                        <span style={{
                          marginLeft: '0.5rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          background: user.role === 'admin' ? '#f44336' : '#3d6aff',
                          color: '#fff'
                        }}>
                          {user.role === 'admin' ? 'Admin' : 'Utilizador'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
