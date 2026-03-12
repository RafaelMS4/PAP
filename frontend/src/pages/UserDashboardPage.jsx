import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Card from '../components/Card';
import Table from '../components/Table';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import FormModal from '../components/FormModal';
import '../styles/detail-page.css';

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createTicketModal, setCreateTicketModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);

      // Fetch user's tickets
      const ticketsResponse = await api.get('/tickets', {
        params: { user_id: userData.id, limit: 100 }
      });

      const userTickets = ticketsResponse.data.tickets || [];
      setTickets(userTickets);

      // Calculate stats
      setStats({
        totalTickets: userTickets.length,
        openTickets: userTickets.filter(t => ['open', 'in_progress'].includes(t.status)).length,
        closedTickets: userTickets.filter(t => ['resolved', 'closed'].includes(t.status)).length
      });
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (formData) => {
    try {
      setFormLoading(true);
      await api.post('/tickets', {
        title: formData.title,
        description: formData.description,
        priority: formData.priority || 'medium',
        category: formData.category || 'general'
      });
      setCreateTicketModal(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      alert('Erro ao criar ticket');
    } finally {
      setFormLoading(false);
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

  return (
    <div className="detail-page">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">
          <h1>Bem-vindo, {user?.name || 'Utilizador'}</h1>
          <p className="user-email">Painel de Controlo</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setCreateTicketModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <AddIcon style={{ fontSize: '18px' }} /> Criar Ticket
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#3d6aff' }}>
            <AssignmentIcon style={{ fontSize: '28px', color: '#fff' }} />
          </div>
          <div>
            <div className="stat-value">{stats.totalTickets}</div>
            <div className="stat-label">Total de Tickets</div>
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
      </div>

      {/* Tickets Table */}
      <Card>
        <h3>Meus Tickets</h3>
        {tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#999', marginBottom: '1.5rem' }}>
              Ainda não criou nenhum ticket
            </p>
            <button 
              className="btn btn-primary" 
              onClick={() => setCreateTicketModal(true)}
            >
              <AddIcon style={{ fontSize: '18px' }} /> Criar Primeiro Ticket
            </button>
          </div>
        ) : (
          <Table
            columns={ticketColumns}
            rows={tickets}
            onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
          />
        )}
      </Card>

      {/* Create Ticket Modal */}
      <FormModal
        isOpen={createTicketModal}
        onClose={() => setCreateTicketModal(false)}
        onSubmit={handleCreateTicket}
        title="Criar Novo Ticket"
        fields={[
          {
            name: 'title',
            label: 'Título',
            type: 'text',
            required: true,
            placeholder: 'Descreva o problema resumidamente'
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: true,
            placeholder: 'Forneça mais detalhes sobre o problema'
          },
          {
            name: 'priority',
            label: 'Prioridade',
            type: 'select',
            required: true,
            options: [
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
              { value: 'urgent', label: 'Urgente' }
            ]
          },
          {
            name: 'category',
            label: 'Categoria',
            type: 'select',
            required: true,
            options: [
              { value: 'hardware', label: 'Hardware' },
              { value: 'software', label: 'Software' },
              { value: 'network', label: 'Rede' },
              { value: 'access', label: 'Acesso' },
              { value: 'other', label: 'Outro' }
            ]
          }
        ]}
        loading={formLoading}
      />
    </div>
  );
}
