import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import { Modal } from '../components/Modal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PanToolIcon from '@mui/icons-material/PanTool';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/list-page.css';

export default function AdminQueuePage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: 'open', priority: '' });
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState({ open: false, ticket: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [assignLoading, setAssignLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const ITEMS_PER_PAGE = 20;

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users/getUsers');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        title: search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined
      };

      const response = await api.get('/tickets/admin/queue', { params });
      setTickets(response.data.tickets || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar fila de admin:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleAssignTicket = async (formData) => {
    try {
      setAssignLoading(true);
      await api.put(`/tickets/${assignModal.ticket.id}/assign`, {
        assigned_to: formData.admin_id
      });
      setAssignModal({ open: false, ticket: null });
      fetchTickets();
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
      alert('Erro ao atribuir ticket');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignToMe = async (ticket) => {
    try {
      setAssignLoading(true);
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      await api.put(`/tickets/${ticket.id}/assign`, {
        assigned_to: currentUser.id
      });
      fetchTickets();
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
      alert('Erro ao atribuir ticket');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      setAssignLoading(true);
      await api.delete(`/tickets/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      fetchTickets();
    } catch (error) {
      console.error('Erro ao eliminar ticket:', error);
      alert('Erro ao eliminar ticket');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const columns = [
    {
      label: 'ID',
      key: 'id',
      render: (value) => `#${value.toString().padStart(4, '0')}`
    },
    {
      label: 'Título',
      key: 'title'
    },
    {
      label: 'Criado por',
      key: 'creator_display_name',
      render: (value, row) => value || row.creator_name || '-'
    },
    {
      label: 'Status',
      key: 'status',
      render: (value) => {
        const statusMap = { open: 'Aberto', in_progress: 'Em Progresso', closed: 'Fechado' };
        const colors = { open: '#ff9800', in_progress: '#3d6aff', closed: '#4caf50' };
        return (
          <span style={{ background: colors[value], color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
            {statusMap[value] || value}
          </span>
        );
      }
    },
    {
      label: 'Prioridade',
      key: 'priority',
      render: (value) => {
        const priorityMap = { low: 'Baixa', medium: 'Média', high: 'Elevada', urgent: 'Urgente' };
        const colors = { low: '#4caf50', medium: '#3d6aff', high: '#ff9800', urgent: '#f44336' };
        return (
          <span style={{ background: colors[value], color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
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

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1>Fila de Tickets</h1>
          <p style={{ color: '#999', margin: '0.5rem 0 0 0' }}>
            Total: {total} {total === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
      </div>

      <FilterBar
        searchPlaceholder="Procurar por título..."
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: '', label: 'Todos' },
              { value: 'open', label: 'Aberto' },
              { value: 'in_progress', label: 'Em Progresso' },
              { value: 'closed', label: 'Fechado' }
            ]
          },
          {
            name: 'priority',
            label: 'Prioridade',
            options: [
              { value: '', label: 'Todas' },
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Elevada' },
              { value: 'urgent', label: 'Urgente' }
            ]
          }
        ]}
        onSearch={handleSearchChange}
        onFiltersChange={handleFilterChange}
        loading={loading}
      />

      <Table
        columns={columns}
        rows={tickets}
        loading={loading}
        onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
        actions={[
          {
            id: 'view',
            icon: <VisibilityIcon sx={{ fontSize: '1.1rem' }} />,
            label: 'Ver ticket',
            onClick: (ticket) => navigate(`/tickets/${ticket.id}`)
          },
          {
            id: 'assign-me',
            icon: <PanToolIcon sx={{ fontSize: '1.1rem' }} />,
            label: 'Ficar com ticket',
            onClick: (ticket) => handleAssignToMe(ticket)
          },
          {
            id: 'assign',
            icon: <AssignmentIcon sx={{ fontSize: '1.1rem' }} />,
            label: 'Atribuir a outro',
            onClick: (ticket) => setAssignModal({ open: true, ticket })
          },
          {
            id: 'delete',
            icon: <DeleteIcon sx={{ fontSize: '1.1rem' }} />,
            label: 'Eliminar',
            onClick: (ticket) => setDeleteModal({ open: true, id: ticket.id })
          }
        ]}
      />

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Modals */}
      <FormModal
        isOpen={assignModal.open}
        title={`Atribuir Ticket ${assignModal.ticket ? '#' + assignModal.ticket.id : ''}`}
        fields={[
          {
            name: 'admin_id',
            label: 'Admin',
            type: 'select',
            required: true,
            options: users
              .filter(u => u.role === 'admin')
              .map(u => ({ value: u.id, label: u.name }))
          }
        ]}
        onSubmit={handleAssignTicket}
        onClose={() => setAssignModal({ open: false, ticket: null })}
        loading={assignLoading}
      />

      <Modal
        isOpen={deleteModal.open}
        title="Eliminar Ticket"
        body="Tens a certeza que queres eliminar este ticket? Esta ação não pode ser desfeita."
        buttons={[
          {
            label: 'Cancelar',
            onClick: () => setDeleteModal({ open: false, id: null }),
            className: 'btn btn-secondary'
          },
          {
            label: 'Eliminar',
            onClick: handleDeleteTicket,
            className: 'btn btn-danger',
            loading: assignLoading
          }
        ]}
        onClose={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}
