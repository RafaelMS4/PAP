import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FormModal from '../components/FormModal';
import { ConfirmModal, Modal } from '../components/Modal';
import Card from '../components/Card';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ComputerIcon from '@mui/icons-material/Computer';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { getEmailUsername, buildHelpdeskEmail, HELPDESK_EMAIL_DOMAIN } from '../utils/email';
import '../styles/detail-page.css';

export default function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [availableEquipment, setAvailableEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [assignEquipmentModal, setAssignEquipmentModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    assignedEquipment: 0
  });

  useEffect(() => {
    fetchUserData();
  }, [id]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = availableEquipment.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredEquipment(filtered);
    } else {
      setFilteredEquipment(availableEquipment);
    }
  }, [searchQuery, availableEquipment]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [userRes, ticketsRes, equipmentRes] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/tickets`, { params: { user_id: id, limit: 100 } }),
        api.get(`/equipment/getUserEquipment/${id}`).catch(() => ({ data: { equipment: [] } }))
      ]);

      setUser(userRes.data.user);
      const ticketList = ticketsRes.data.tickets || [];
      setTickets(ticketList);
      setEquipment(equipmentRes.data.equipment || []);

      // Calculate stats
      setStats({
        totalTickets: ticketList.length,
        openTickets: ticketList.filter(t => ['open', 'in_progress'].includes(t.status)).length,
        closedTickets: ticketList.filter(t => ['resolved', 'closed'].includes(t.status)).length,
        assignedEquipment: (equipmentRes.data.equipment || []).length
      });

      // Fetch user history
      try {
        const historyResponse = await api.get(`/users/${id}/history`);
        setHistory(historyResponse.data.history || []);
      } catch (error) {
        console.error('Erro ao buscar histórico do utilizador:', error);
        setHistory([]);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do utilizador:', error);
      if (error.response?.status === 404) {
        navigate('/users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (formData) => {
    try {
      setFormLoading(true);
      const normalizedEmail = buildHelpdeskEmail(formData.email);

      if (!normalizedEmail) {
        alert(`Email inválido. Usa apenas @${HELPDESK_EMAIL_DOMAIN}`);
        return;
      }

      await api.put(`/users/updateUser/${id}`, {
        name: formData.name,
        email: normalizedEmail,
        role: formData.role
      });
      setEditModal(false);
      fetchUserData();
    } catch (error) {
      console.error('Erro ao atualizar utilizador:', error);
      alert('Erro ao atualizar utilizador');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setFormLoading(true);
      await api.delete(`/users/deleteUser/${id}`);
      navigate('/users');
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      alert('Erro ao eliminar utilizador');
      setFormLoading(false);
    }
  };

  const fetchAvailableEquipment = async () => {
    try {
      const response = await api.get('/equipment/getEquipment', {
        params: { status: 'available', limit: 100 }
      });
      setAvailableEquipment(response.data.equipment || []);
    } catch (error) {
      console.error('Erro ao buscar equipamento disponível:', error);
    }
  };

  const handleUnassignEquipment = async (equipmentId) => {
    try {
      await api.put(`/equipment/updateEquipment/${equipmentId}`, {
        assignedTo: null,
        status: 'available'
      });
      fetchUserData();
    } catch (error) {
      console.error('Erro ao desatribuir equipamento:', error);
      alert('Erro ao desatribuir equipamento');
    }
  };

  const ticketColumns = [
    {
      label: 'ID',
      key: 'id',
      render: (value) => `#${value}`
    },
    {
      label: 'Título',
      key: 'title'
    },
    {
      label: 'Status',
      key: 'status',
      render: (value) => {
        const statusMap = {
          open: 'Aberto',
          in_progress: 'Em Progresso',
          waiting: 'Aguardando',
          resolved: 'Resolvido',
          closed: 'Fechado'
        };
        const colors = {
          open: '#3d6aff',
          in_progress: '#ff9800',
          waiting: '#9c27b0',
          resolved: '#4caf50',
          closed: '#999'
        };
        return (
          <span style={{ 
            background: colors[value], 
            color: '#fff', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '12px', 
            fontSize: '0.85rem' 
          }}>
            {statusMap[value] || value}
          </span>
        );
      }
    },
    {
      label: 'Prioridade',
      key: 'priority',
      render: (value) => {
        const priorityMap = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' };
        const colors = { low: '#4caf50', medium: '#ff9800', high: '#f44336', urgent: '#9c27b0' };
        return (
          <span style={{ 
            background: colors[value], 
            color: '#fff', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '12px', 
            fontSize: '0.85rem' 
          }}>
            {priorityMap[value] || value}
          </span>
        );
      }
    },
    {
      label: 'Data',
      key: 'created_at',
      render: (value) => new Date(value).toLocaleDateString('pt-PT')
    }
  ];

  const equipmentColumns = [
    {
      label: 'Nome',
      key: 'name'
    },
    {
      label: 'Tipo',
      key: 'type'
    },
    {
      label: 'Modelo',
      key: 'model',
      render: (value) => value || '-'
    },
    {
      label: 'Status',
      key: 'status',
      render: (value) => {
        const statusMap = { 
          available: 'Disponível', 
          in_use: 'Em Uso', 
          maintenance: 'Manutenção', 
          retired: 'Reformado' 
        };
        const colors = { 
          available: '#4caf50', 
          in_use: '#3d6aff', 
          maintenance: '#ff9800', 
          retired: '#999' 
        };
        return (
          <span style={{ 
            background: colors[value], 
            color: '#fff', 
            padding: '0.25rem 0.75rem', 
            borderRadius: '12px', 
            fontSize: '0.85rem' 
          }}>
            {statusMap[value] || value}
          </span>
        );
      }
    }
  ];

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

  if (!user) {
    return (
      <div className="detail-page">
        <p>Utilizador não encontrado</p>
      </div>
    );
  }

  const emailUsername = getEmailUsername(user.email);

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="header-top">
          <button className="btn-back" onClick={() => navigate('/users')}>
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
          <h1>{user.name}</h1>
          <p className="user-email">{emailUsername}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3d6aff' }}>
            <AssessmentIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{stats.totalTickets}</div>
            <div className="stat-label">Total Tickets</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ff9800' }}>
            <LockOpenIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{stats.openTickets}</div>
            <div className="stat-label">Tickets Abertos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#4caf50' }}>
            <CheckCircleIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{stats.closedTickets}</div>
            <div className="stat-label">Tickets Fechados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#9c27b0' }}>
            <ComputerIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{stats.assignedEquipment}</div>
            <div className="stat-label">Equipamento Atribuído</div>
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
          className={`tab ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          Tickets ({tickets.length})
        </button>
        <button 
          className={`tab ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          Equipamento ({equipment.length})
        </button>
        <button 
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Histórico
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'info' && (
          <Card>
            <h3>Detalhes do Utilizador</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nome</label>
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
                    background: user.role === 'admin' ? '#f44336' : '#3d6aff',
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem'
                  }}>
                    {user.role === 'admin' ? 'Admin' : 'Utilizador'}
                  </span>
                </p>
              </div>
              <div className="info-item">
                <label>Data de Registo</label>
                <p>{new Date(user.created_at).toLocaleDateString('pt-PT', { 
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

        {activeTab === 'tickets' && (
          <Card>
            <h3>Tickets Criados</h3>
            {tickets.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Nenhum ticket criado
              </p>
            ) : (
              <Table
                columns={ticketColumns}
                rows={tickets}
                onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
              />
            )}
          </Card>
        )}

        {activeTab === 'equipment' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Equipamento Atribuído</h3>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  fetchAvailableEquipment();
                  setAssignEquipmentModal(true);
                }}
              >
                + Atribuir Equipamento
              </button>
            </div>
            {equipment.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999', padding: '2rem' }}>
                Nenhum equipamento atribuído
              </p>
            ) : (
              <Table
                columns={equipmentColumns}
                rows={equipment}
                actions={[
                  {
                    id: 'unassign',
                    label: 'Desatribuir equipamento',
                    icon: <CloseIcon sx={{ fontSize: '1.1rem' }} />,
                    onClick: (item) => {
                      if (confirm(`Desatribuir "${item.name}" deste utilizador?`)) {
                        handleUnassignEquipment(item.id);
                      }
                    }
                  }
                ]}
              />
            )}
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <h3>Histórico de Alterações</h3>
            <div className="history-list">
              {history.length > 0 ? (
                history.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-action">
                      <strong>{item.username || 'Sistema'}</strong> alterou <strong>{item.field_changed}</strong>
                      {item.old_value && item.new_value && (
                        <span> de <em>"{item.old_value}"</em> para <em>"{item.new_value}"</em></span>
                      )}
                      {!item.old_value && item.new_value && (
                        <span> para <em>"{item.new_value}"</em></span>
                      )}
                      {item.old_value && !item.new_value && (
                        <span> removendo <em>"{item.old_value}"</em></span>
                      )}
                    </div>
                    <div className="history-meta">
                      {new Date(item.created_at).toLocaleString('pt-PT')}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>
                  Nenhum histórico disponível
                </p>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <FormModal
        isOpen={editModal}
        title="Editar Utilizador"
        fields={[
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Nome do utilizador'
          },
          {
            name: 'email',
            label: `Email (sem @${HELPDESK_EMAIL_DOMAIN})`,
            type: 'text',
            required: true,
            placeholder: 'nome.apelido',
            help: `Domínio fixo: @${HELPDESK_EMAIL_DOMAIN}`
          },
          {
            name: 'role',
            label: 'Função',
            type: 'select',
            options: [
              { value: 'user', label: 'Utilizador' },
              { value: 'admin', label: 'Admin' }
            ]
          }
        ]}
        initialData={{ ...user, email: emailUsername }}
        onSubmit={handleUpdateUser}
        onClose={() => setEditModal(false)}
        loading={formLoading}
      />

      {/* Equipment Assignment Modal */}
      <Modal isOpen={assignEquipmentModal} onClose={() => setAssignEquipmentModal(false)} title="Atribuir Equipamento" size="large">
        <div className="equipment-search-modal">
          <input
            type="text"
            placeholder="Pesquisar equipamento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
            autoFocus
          />
          <div className="equipment-list">
            {filteredEquipment.length === 0 ? (
              <p className="no-results">Nenhum equipamento disponível</p>
            ) : (
              filteredEquipment.map((item) => (
                <div
                  key={item.id}
                  className="equipment-item"
                  onClick={async () => {
                    try {
                      setFormLoading(true);
                      await api.put(`/equipment/updateEquipment/${item.id}`, {
                        assignedTo: parseInt(id),
                        status: 'in_use'
                      });
                      setAssignEquipmentModal(false);
                      setSearchQuery('');
                      fetchUserData();
                    } catch (error) {
                      console.error('Erro ao atribuir equipamento:', error);
                      alert('Erro ao atribuir equipamento');
                    } finally {
                      setFormLoading(false);
                    }
                  }}
                >
                  <div className="equipment-item-main">
                    <div className="equipment-item-icon"><ComputerIcon sx={{ fontSize: '1.5rem' }} /></div>
                    <div>
                      <div className="equipment-item-name">{item.name}</div>
                      <div className="equipment-item-details">
                        {item.type} {item.model && `• ${item.model}`} • {item.location}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-primary btn-sm">Atribuir</button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal}
        title="Eliminar Utilizador"
        message={`Tens a certeza que queres eliminar o utilizador "${user?.name}"? Esta ação não pode ser desfeita e todos os tickets criados por este utilizador serão afetados.`}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteModal(false)}
        isDangerous
      />
    </div>
  );
}
