import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import { Modal } from '../components/Modal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/list-page.css';

export default function MyTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [createLoading, setCreateLoading] = useState(false);

  const ITEMS_PER_PAGE = 20;

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

      const response = await api.get('/tickets/my/tickets', { params });
      setTickets(response.data.tickets || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar os meus tickets:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async (formData) => {
    try {
      setCreateLoading(true);
      await api.post('/tickets', {
        title: formData.title,
        description: formData.description,
        category: formData.category || 'general',
        priority: formData.priority || 'medium'
      });
      setShowCreateModal(false);
      setPage(1);
      fetchTickets();
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      alert('Erro ao criar ticket');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    try {
      setCreateLoading(true);
      await api.delete(`/tickets/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      fetchTickets();
    } catch (error) {
      console.error('Erro ao eliminar ticket:', error);
      alert('Erro ao eliminar ticket');
    } finally {
      setCreateLoading(false);
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
        const statusMap = { open: 'Aberto', in_progress: 'Em Progresso', waiting: 'Aguardando', resolved: 'Resolvido', closed: 'Fechado' };
        const colors = { open: '#ff9800', in_progress: '#3d6aff', waiting: '#9c27b0', resolved: '#4caf50', closed: '#999' };
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
          <h1>Os Meus Tickets</h1>
          <p style={{ color: '#999', margin: '0.5rem 0 0 0' }}>
            Tickets atribuídos a mim — Total: {total} {total === 1 ? 'ticket' : 'tickets'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Novo Ticket
        </button>
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
        isOpen={showCreateModal}
        title="Novo Ticket"
        fields={[
          {
            name: 'title',
            label: 'Título',
            type: 'text',
            required: true,
            placeholder: 'Escreve o título do ticket'
          },
          {
            name: 'description',
            label: 'Descrição',
            type: 'textarea',
            required: true,
            placeholder: 'Descreve o problema em detalhe'
          },
          {
            name: 'category',
            label: 'Categoria',
            type: 'select',
            options: [
              { value: 'general', label: 'Geral' },
              { value: 'technical', label: 'Técnico' },
              { value: 'billing', label: 'Faturação' },
              { value: 'account', label: 'Conta' }
            ]
          },
          {
            name: 'priority',
            label: 'Prioridade',
            type: 'select',
            options: [
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Elevada' },
              { value: 'urgent', label: 'Urgente' }
            ]
          }
        ]}
        onSubmit={handleCreateTicket}
        onClose={() => setShowCreateModal(false)}
        loading={createLoading}
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
            loading: createLoading
          }
        ]}
        onClose={() => setDeleteModal({ open: false, id: null })}
      />
    </div>
  );
}
