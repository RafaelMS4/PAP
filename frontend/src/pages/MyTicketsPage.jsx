import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import { Modal } from '../components/Modal';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
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
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
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
      setTotal(response.data.pagination?.total ?? response.data.total ?? 0);
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

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearchChange = (query) => {
    setSearch(query);
    setPage(1);
  };

  const toggleSort = useCallback((column) => {
    if (sortBy === column) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  }, [sortBy]);

  const getSortIcon = useCallback((column) => {
    if (sortBy !== column) return null;
    return sortDir === 'asc' ? ' ▲' : ' ▼';
  }, [sortBy, sortDir]);

  const columns = useMemo(() => [
    {
      key: 'id',
      label: (
        <span style={{ cursor: 'pointer' }} onClick={() => toggleSort('id')}>
          ID{getSortIcon('id')}
        </span>
      ),
      render: (value) => `#${value.toString().padStart(4, '0')}`
    },
    {
      key: 'title',
      label: 'Título'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />
    },
    {
      key: 'priority',
      label: 'Prioridade',
      render: (value) => <PriorityBadge priority={value} />
    },
    {
      key: 'created_at',
      label: 'Criado',
      render: (value) => new Date(value).toLocaleDateString('pt-PT')
    }
  ], [getSortIcon, toggleSort]);

  const sortedTickets = useMemo(() => {
    const sorted = [...tickets].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return aVal - bVal;
      }

      return String(aVal).localeCompare(String(bVal), 'pt', { numeric: true });
    });

    return sortDir === 'asc' ? sorted : sorted.reverse();
  }, [tickets, sortBy, sortDir]);

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1>Os Meus Tickets</h1>
          <p className="page-subtitle">Tickets atribuidos a si</p>
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

      <div className="table-section">
        <p className="total-info">Total: {total} tickets</p>
        <Table
          columns={columns}
          rows={sortedTickets}
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
              id: 'edit',
              icon: <EditIcon sx={{ fontSize: '1.1rem' }} />,
              label: 'Editar',
              onClick: (ticket) => navigate(`/tickets/${ticket.id}/edit`)
            },
            {
              id: 'delete',
              icon: <DeleteIcon sx={{ fontSize: '1.1rem' }} />,
              label: 'Eliminar',
              onClick: (ticket) => setDeleteModal({ open: true, id: ticket.id })
            }
          ]}
        />

        {total > ITEMS_PER_PAGE && (
          <div className="pagination-wrapper">
            <Pagination
              total={total}
              current={page}
              pageSize={ITEMS_PER_PAGE}
              onChange={setPage}
            />
          </div>
        )}
      </div>

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
