import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { Modal } from '../components/Modal';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/list-page.css';

export default function ClosedTicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState([
    {
      key: 'status',
      label: 'Status',
      value: 'closed',
      options: [
        { value: 'closed', label: 'Fechado' },
        { value: 'resolved', label: 'Resolvido' }
      ]
    },
    {
      key: 'priority',
      label: 'Prioridade',
      value: '',
      options: [
        { value: '', label: 'Todas' },
        { value: 'low', label: 'Baixa' },
        { value: 'medium', label: 'Média' },
        { value: 'high', label: 'Alta' },
        { value: 'urgent', label: 'Urgente' }
      ]
    }
  ]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ITEMS_PER_PAGE = 20;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);

      const status = filters.find((f) => f.key === 'status')?.value;
      const priority = filters.find((f) => f.key === 'priority')?.value;

      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        title: search || undefined,
        status: status || undefined,
        priority: priority || undefined
      };

      const response = await api.get('/tickets', { params });
      setTickets(response.data.tickets || []);
      setTotal(response.data.pagination?.total ?? response.data.total ?? 0);
    } catch (error) {
      console.error('Erro ao buscar tickets fechados:', error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters(prev => prev.map((f) => (f.key === key ? { ...f, value } : f)));
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

  const handleSearch = (value) => {
    setPage(1);
    setSearch(value);
  };

  const handleDeleteTicket = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/tickets/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      fetchTickets();
      window.showNotification('success', 'Ticket deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar ticket:', error);
      window.showNotification('error', 'Erro ao deletar ticket. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

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
      key: 'assigned_to_name',
      label: 'Atribuído a'
    },
    {
      key: 'resolved_at',
      label: 'Fechado em',
      render: (value) => value ? new Date(value).toLocaleDateString('pt-PT') : '-'
    }
  ], [getSortIcon, toggleSort]);

  const actions = [
    {
      id: 'view',
      icon: <VisibilityIcon sx={{ fontSize: '1.1rem' }} />,
      label: 'Ver',
      onClick: (row) => navigate(`/tickets/${row.id}`)
    },
    {
      id: 'delete',
      icon: <DeleteIcon sx={{ fontSize: '1.1rem' }} />,
      label: 'Deletar',
      onClick: (row) => setDeleteModal({ open: true, id: row.id })
    }
  ];

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
          <h1>Tickets Fechados</h1>
          <p className="page-subtitle">Gerencie tickets resolvidos e fechados</p>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Procurar por título..."
        loading={loading}
      />

      <div className="table-section">
        <p className="total-info">Total: {total} tickets</p>
        <Table
          columns={columns}
          rows={sortedTickets}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum ticket fechado encontrado"
          onRowClick={(ticket) => navigate(`/tickets/${ticket.id}`)}
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

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        title="Confirmar Exclusão"
        onClose={() => setDeleteModal({ open: false, id: null })}
      >
        <div className="modal-content">
          <p>Tem certeza que deseja deletar este ticket? Esta ação não pode ser desfeita.</p>
          <div className="modal-actions">
            <button
              className="btn-secondary"
              onClick={() => setDeleteModal({ open: false, id: null })}
              disabled={deleteLoading}
            >
              Cancelar
            </button>
            <button
              className="btn-danger"
              onClick={handleDeleteTicket}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}