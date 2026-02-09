import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Table from '../components/Table';
import FilterBar from '../components/FilterBar';
import Pagination from '../components/Pagination';
import FormModal from '../components/FormModal';
import { ConfirmModal } from '../components/Modal';
import '../styles/list-page.css';

export default function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ role: '' });
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, user: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [formLoading, setFormLoading] = useState(false);

  const ITEMS_PER_PAGE = 20;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        name: search || undefined,
        role: filters.role || undefined
      };

      const response = await api.get('/users/getUsers', { params });
      setUsers(response.data.users || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Erro ao buscar utilizadores:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (formData) => {
    try {
      setFormLoading(true);
      await api.post('/users/createUser', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role || 'user'
      });
      setShowCreateModal(false);
      setPage(1);
      fetchUsers();
    } catch (error) {
      console.error('Erro ao criar utilizador:', error);
      alert('Erro ao criar utilizador');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async (formData) => {
    try {
      setFormLoading(true);
      await api.put(`/users/updateUser/${editModal.user.id}`, {
        name: formData.name,
        email: formData.email,
        role: formData.role
      });
      setEditModal({ open: false, user: null });
      fetchUsers();
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
      await api.delete(`/users/deleteUser/${deleteModal.id}`);
      setDeleteModal({ open: false, id: null });
      fetchUsers();
    } catch (error) {
      console.error('Erro ao eliminar utilizador:', error);
      alert('Erro ao eliminar utilizador');
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
      label: 'Email',
      key: 'email'
    },
    {
      label: 'Função',
      key: 'role',
      render: (value) => {
        const roleMap = { admin: 'Admin', user: 'Utilizador' };
        const colors = { admin: '#f44336', user: '#3d6aff' };
        return (
          <span style={{ background: colors[value], color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.85rem' }}>
            {roleMap[value] || value}
          </span>
        );
      }
    },
    {
      label: 'Tickets Criados',
      key: 'ticket_count',
      render: (value) => value || 0
    },
    {
      label: 'Data Registo',
      key: 'created_at',
      render: (value) => new Date(value).toLocaleDateString('pt-PT')
    }
  ];

  return (
    <div className="list-page">
      <div className="list-header">
        <div>
          <h1>Utilizadores</h1>
          <p style={{ color: '#999', margin: '0.5rem 0 0 0' }}>
            Total: {total} {total === 1 ? 'utilizador' : 'utilizadores'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          + Novo Utilizador
        </button>
      </div>

      <FilterBar
        searchPlaceholder="Procurar por nome ou email..."
        filters={[
          {
            name: 'role',
            label: 'Função',
            options: [
              { value: '', label: 'Todas' },
              { value: 'user', label: 'Utilizador' },
              { value: 'admin', label: 'Admin' }
            ]
          }
        ]}
        onSearch={handleSearchChange}
        onFiltersChange={handleFilterChange}
        loading={loading}
      />

      <Table
        columns={columns}
        rows={users}
        loading={loading}
        onRowClick={(user) => navigate(`/users/${user.id}`)}
        actions={[
          {
            id: 'edit',
            label: 'Editar utilizador',
            icon: '✏️',
            onClick: (user) => setEditModal({ open: true, user })
          },
          {
            id: 'delete',
            label: 'Eliminar utilizador',
            icon: '🗑️',
            onClick: (user) => setDeleteModal({ open: true, id: user.id })
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
        title="Novo Utilizador"
        fields={[
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Escreve o nome'
          },
          {
            name: 'email',
            label: 'Email',
            type: 'text',
            required: true,
            placeholder: 'exemplo@email.com'
          },
          {
            name: 'password',
            label: 'Palavra-passe',
            type: 'text',
            required: true,
            placeholder: 'Escreve uma palavra-passe'
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
        onSubmit={handleCreateUser}
        onClose={() => setShowCreateModal(false)}
        loading={formLoading}
      />

      <FormModal
        isOpen={editModal.open}
        title="Editar Utilizador"
        fields={[
          {
            name: 'name',
            label: 'Nome',
            type: 'text',
            required: true,
            placeholder: 'Escreve o nome'
          },
          {
            name: 'email',
            label: 'Email',
            type: 'text',
            required: true,
            placeholder: 'exemplo@email.com'
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
        initialData={editModal.user}
        onSubmit={handleEditUser}
        onClose={() => setEditModal({ open: false, user: null })}
        loading={formLoading}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Eliminar Utilizador"
        message="Tens a certeza que queres eliminar este utilizador? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteModal({ open: false, id: null })}
        isDangerous
      />
    </div>
  );
}
