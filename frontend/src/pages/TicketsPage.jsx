import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Modal } from '../components/Modal';
import FormModal from '../components/FormModal';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/list-page.css';

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);

  const pageSize = 20;

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit: pageSize,
        offset: (page - 1) * pageSize,
        ...filters
      };
      
      const response = await api.get('/tickets', { params });
      setTickets(response.data.tickets || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Erro ao buscar tickets:', error);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = (value) => {
    setPage(1);
    setSearch(value);
    setFilters(prev => ({ ...prev, search: value }));
  };

  const handleCreateTicket = async (formData) => {
    try {
      setCreateLoading(true);
      await api.post('/tickets', formData);
      setShowCreateModal(false);
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
      await api.delete(`/tickets/${selectedTicket.id}`);
      setShowDeleteModal(false);
      fetchTickets();
    } catch (error) {
      console.error('Erro ao deletar ticket:', error);
      alert('Erro ao deletar ticket');
    } finally {
      setCreateLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      key: 'id',
      label: 'ID',
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
  ], []);

  const actions = useMemo(() => [
    {
      id: 'view',
      icon: <VisibilityIcon sx={{ fontSize: '1.1rem' }} />,
      label: 'Ver',
      onClick: (row) => navigate(`/tickets/${row.id}`)
    },
    {
      id: 'edit',
      icon: <EditIcon sx={{ fontSize: '1.1rem' }} />,
      label: 'Editar',
      onClick: (row) => navigate(`/tickets/${row.id}/edit`)
    },
    {
      id: 'delete',
      icon: <DeleteIcon sx={{ fontSize: '1.1rem' }} />,
      label: 'Deletar',
      onClick: (row) => {
        setSelectedTicket(row);
        setShowDeleteModal(true);
      }
    }
  ], [navigate]);

  const createFields = [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Título do ticket'
    },
    {
      name: 'description',
      label: 'Descrição',
      type: 'textarea',
      required: true,
      placeholder: 'Descreve o problema ou pedido'
    },
    {
      name: 'priority',
      label: 'Prioridade',
      type: 'select',
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
      type: 'text',
      placeholder: 'Ex: software, hardware'
    }
  ];

  return (
    <div className="list-page">
      <div className="page-header">
        <div>
          <h1><AssignmentIcon sx={{ fontSize: '1.5rem', mr: 0.5, verticalAlign: 'middle' }} /> Tickets</h1>
          <p>Gerencia todos os tickets do sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <AddIcon sx={{ fontSize: '1.1rem', mr: 0.3 }} /> Novo Ticket
        </button>
      </div>

      <FilterBar
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: filters.status,
            options: [
              { value: 'open', label: 'Aberto' },
              { value: 'in_progress', label: 'Em Progresso' },
              { value: 'closed', label: 'Fechado' }
            ]
          },
          {
            key: 'priority',
            label: 'Prioridade',
            value: filters.priority,
            options: [
              { value: 'low', label: 'Baixa' },
              { value: 'medium', label: 'Média' },
              { value: 'high', label: 'Alta' },
              { value: 'urgent', label: 'Urgente' }
            ]
          }
        ]}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        searchPlaceholder="Pesquisa por título..."
        loading={loading}
      />

      <div className="table-section">
        <p className="total-info">Total: {total} tickets</p>
        <Table
          columns={columns}
          rows={tickets}
          loading={loading}
          actions={actions}
          onRowClick={(row) => navigate(`/tickets/${row.id}`)}
        />
        <Pagination
          total={total}
          current={page}
          pageSize={pageSize}
          onChange={setPage}
        />
      </div>

      <FormModal
        isOpen={showCreateModal}
        title="Criar Novo Ticket"
        fields={createFields}
        onSubmit={handleCreateTicket}
        onClose={() => setShowCreateModal(false)}
        loading={createLoading}
      />

      <Modal
        isOpen={showDeleteModal}
        title="Confirmar Deleção"
        onClose={() => setShowDeleteModal(false)}
      >
        <p>Tem certeza que quer deletar o ticket "{selectedTicket?.title}"?</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={handleDeleteTicket} disabled={createLoading}>
            Deletar
          </button>
        </div>
      </Modal>
    </div>
  );
}
