import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import { ConfirmModal } from '../components/Modal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import '../styles/list-page.css';

export default function EquipmentPage() {
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '' });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, equipment: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [formLoading, setFormLoading] = useState(false);

  const ITEMS_PER_PAGE = 20;

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        name: search || undefined,
        status: filters.status || undefined
      };

      const response = await api.get('/equipment/getEquipment', { params });
      setEquipment(response.data.equipment || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleCreateEquipment = async (formData) => {
    try {
      setFormLoading(true);
      await api.post('/equipment/createEquipment', {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        status: formData.status || 'available',
        model: formData.model
      });
      setShowCreateModal(false);
      setPage(1);
      fetchEquipment();
    } catch (error) {
      console.error('Erro ao criar equipamento:', error);
      alert('Erro ao criar equipamento');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditEquipment = async (formData) => {
    try {
      setFormLoading(true);
      await api.put(`/equipment/updateEquipment/${editModal.equipment.id}`, {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        status: formData.status,
        model: formData.model
      });
      setEditModal({ open: false, equipment: null });
      fetchEquipment();
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
      await api.delete(`/equipment/deleteEquipment/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      fetchEquipment();
    } catch (error) {
      console.error('Erro ao eliminar equipamento:', error);
      alert('Erro ao eliminar equipamento');
    } finally {
      setFormLoading(false);
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
      label: 'Localidade',
      key: 'location'
    },
    {
      label: 'Status',
      key: 'status',
      render: (value) => {
        const statusMap = { available: 'Disponível', in_use: 'Em Uso', maintenance: 'Manutenção', retired: 'Reformado' };
        const colors = { available: '#4caf50', in_use: '#3d6aff', maintenance: '#ff9800', retired: '#999' };
        return (
          <span style={{ background: colors[value], color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
            {statusMap[value] || value}
          </span>
        );
      }
    }
  ];

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1>Equipamento</h1>
          <p style={{ color: '#999', margin: '0.5rem 0 0 0' }}>
            Total: {total} {total === 1 ? 'item' : 'itens'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Novo Equipamento
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Procurar por nome..."
        filters={[
          {
            name: 'status',
            label: 'Status',
            options: [
              { value: '', label: 'Todos' },
              { value: 'available', label: 'Disponível' },
              { value: 'in_use', label: 'Em Uso' },
              { value: 'maintenance', label: 'Manutenção' },
              { value: 'retired', label: 'Reformado' }
            ]
          }
        ]}
        onSearch={handleSearchChange}
        onFiltersChange={handleFilterChange}
        loading={loading}
      />

      <Table
        columns={columns}
        rows={equipment}
        loading={loading}
        onRowClick={(item) => navigate(`/equipment/${item.id}`)}
        actions={[
          {
            id: 'edit',
            label: 'Editar equipamento',
            icon: <EditIcon sx={{ fontSize: '1.1rem' }} />,
            onClick: (item) => setEditModal({ open: true, equipment: item })
          },
          {
            id: 'delete',
            label: 'Eliminar equipamento',
            icon: <DeleteIcon sx={{ fontSize: '1.1rem' }} />,
            onClick: (item) => setDeleteModal({ open: true, id: item.id })
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
        title="Novo Equipamento"
        fields={[
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Laptop Dell'
          },
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            required: true,
            options: [
              { value: 'laptop', label: 'Laptop' },
              { value: 'desktop', label: 'Computador' },
              { value: 'printer', label: 'Impressora' },
              { value: 'monitor', label: 'Monitor' },
              { value: 'phone', label: 'Telefone' },
              { value: 'other', label: 'Outro' }
            ]
          },
          {
            name: 'model',
            label: 'Modelo',
            type: 'text',
            placeholder: 'Ex: XPS 15'
          },
          {
            name: 'location',
            label: 'Localidade',
            type: 'text',
            required: true,
            placeholder: 'Ex: Sala 101'
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'available', label: 'Disponível' },
              { value: 'in_use', label: 'Em Uso' },
              { value: 'maintenance', label: 'Manutenção' },
              { value: 'retired', label: 'Reformado' }
            ]
          }
        ]}
        onSubmit={handleCreateEquipment}
        onClose={() => setShowCreateModal(false)}
        loading={formLoading}
      />

      <FormModal
        isOpen={editModal.open}
        title="Editar Equipamento"
        fields={[
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Ex: Laptop Dell'
          },
          {
            name: 'type',
            label: 'Tipo',
            type: 'select',
            required: true,
            options: [
              { value: 'laptop', label: 'Laptop' },
              { value: 'desktop', label: 'Computador' },
              { value: 'printer', label: 'Impressora' },
              { value: 'monitor', label: 'Monitor' },
              { value: 'phone', label: 'Telefone' },
              { value: 'other', label: 'Outro' }
            ]
          },
          {
            name: 'model',
            label: 'Modelo',
            type: 'text',
            placeholder: 'Ex: XPS 15'
          },
          {
            name: 'location',
            label: 'Localidade',
            type: 'text',
            required: true,
            placeholder: 'Ex: Sala 101'
          },
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            options: [
              { value: 'available', label: 'Disponível' },
              { value: 'in_use', label: 'Em Uso' },
              { value: 'maintenance', label: 'Manutenção' },
              { value: 'retired', label: 'Reformado' }
            ]
          }
        ]}
        initialData={editModal.equipment}
        onSubmit={handleEditEquipment}
        onClose={() => setEditModal({ open: false, equipment: null })}
        loading={formLoading}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Equipamento"
        message="Tens a certeza que queres eliminar este equipamento? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteEquipment}
        onCancel={() => setDeleteModal({ open: false, id: null })}
        isDangerous
      />
    </div>
  );
}
