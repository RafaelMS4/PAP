import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import FormModal from '../components/FormModal';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import SyncIcon from '@mui/icons-material/Sync';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import BuildIcon from '@mui/icons-material/Build';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ComputerIcon from '@mui/icons-material/Computer';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import '../styles/detail-page.css';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [ticketEquipment, setTicketEquipment] = useState([]);
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [admins, setAdmins] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketRes = await api.get(`/tickets/${id}`);
      const ticketData = ticketRes.data.ticket || ticketRes.data;
      
      if (!isAdmin && ticketData.user_id !== currentUser.id) {
        navigate('/user-dashboard');
        return;
      }

      const [commentsRes, timeLogsRes, equipmentRes] = await Promise.all([
        api.get(`/tickets/${id}/comments`).catch(() => ({ data: { comments: [] } })),
        api.get(`/tickets/${id}/time-logs`).catch(() => ({ data: { timeLogs: [] } })),
        api.get(`/tickets/${id}/equipment`).catch(() => ({ data: { ticketEquipment: [] } })),
      ]);

      setTicket(ticketData);
      setComments(commentsRes.data.comments || []);
      setTimeLogs(timeLogsRes.data.timeLogs || timeLogsRes.data.time_logs || []);
      setTicketEquipment(equipmentRes.data.ticketEquipment || []);
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (formData) => {
    try {
      setActionLoading(true);
      await api.post(`/tickets/${id}/comments`, {
        message: formData.message,
        comment_type: 'comment'
      });
      setShowCommentModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTask = async (formData) => {
    try {
      setActionLoading(true);
      await api.post(`/tickets/${id}/comments`, {
        message: formData.message,
        comment_type: 'task',
        time_spent: formData.time_spent ? parseInt(formData.time_spent) : undefined
      });
      setShowTaskModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      alert('Erro ao adicionar tarefa');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (formData) => {
    try {
      setActionLoading(true);
      await api.put(`/tickets/${id}/status`, {
        status: formData.status
      });
      setShowStatusModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setActionLoading(true);
      await api.put(`/tickets/${id}/assign`, {
        assigned_to: currentUser.id
      });
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
      alert('Erro ao atribuir ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTicket = async (formData) => {
    try {
      setActionLoading(true);
      await api.put(`/tickets/${id}/assign`, {
        assigned_to: formData.admin_id
      });
      setShowAssignModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
      alert('Erro ao atribuir ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEquipment = async (formData) => {
    try {
      setActionLoading(true);
      await api.post(`/tickets/${id}/equipment`, {
        equipment_id: parseInt(formData.equipment_id),
        notes: formData.notes || ''
      });
      setShowEquipmentModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao associar equipamento:', error);
      alert(error.response?.data?.error || 'Erro ao associar equipamento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveEquipment = async (associationId) => {
    if (!confirm('Remover este equipamento do ticket?')) return;
    try {
      await api.delete(`/tickets/${id}/equipment/${associationId}`);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao remover equipamento:', error);
      alert('Erro ao remover equipamento');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Eliminar este comentário?')) return;
    try {
      await api.delete(`/tickets/${id}/comments/${commentId}`);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao eliminar comentário:', error);
    }
  };

  const openAssignModal = async () => {
    try {
      const res = await api.get('/users/list/admins');
      setAdmins(res.data.admins || []);
    } catch (error) {
      console.error('Erro ao buscar admins:', error);
    }
    setShowAssignModal(true);
  };

  const openEquipmentModal = async () => {
    try {
      const res = await api.get('/equipment/getEquipment', { params: { limit: 100 } });
      setAllEquipment(res.data.equipment || []);
    } catch (error) {
      console.error('Erro ao buscar equipamento:', error);
    }
    setShowEquipmentModal(true);
  };

  const formatMinutes = (minutes) => {
    if (!minutes) return '0min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
  };

  const totalTimeSpent = timeLogs.reduce((acc, log) => acc + (log.time_spent || 0), 0);

  const tasks = comments.filter(c => c.comment_type === 'task');
  const regularComments = comments.filter(c => c.comment_type !== 'task' && c.comment_type !== 'solution');
  const solutions = comments.filter(c => c.comment_type === 'solution');

  if (loading) {
    return (
      <div className="detail-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
          <p style={{ color: '#999' }}>Carregando ticket...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="detail-page">
        <p style={{ color: '#999' }}>Ticket não encontrado</p>
        <button className="btn btn-primary" onClick={() => navigate('/tickets')}>
          Voltar para Tickets
        </button>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="header-top">
          <button className="btn-back" onClick={() => navigate(isAdmin ? '/tickets' : '/user-dashboard')}>
            <ArrowBackIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Voltar
          </button>
          <div className="detail-actions">
            {isAdmin && !ticket.assigned_to && (
              <button className="btn btn-primary" onClick={handleAssignToMe} disabled={actionLoading}>
                <AssignmentIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Ficar com Ticket
              </button>
            )}
            {isAdmin && (
              <>
                <button className="btn btn-secondary" onClick={openAssignModal}>
                  <PersonIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Atribuir
                </button>
                <button className="btn btn-secondary" onClick={() => setShowStatusModal(true)}>
                  <SyncIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Mudar Status
                </button>
              </>
            )}
          </div>
        </div>
        <div className="detail-title">
          <h1>#{ticket.id.toString().padStart(4, '0')} - {ticket.title}</h1>
          <p className="user-email">
            Criado em {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
      </div>

      <div className="ticket-detail-grid">
        <div className="ticket-detail-main">
          {/* Description */}
          <div className="detail-card-box">
            <div className="detail-card-title"><DescriptionIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Descrição</div>
            <div className="detail-content">
              <p style={{ color: '#ccc', lineHeight: '1.6' }}>{ticket.description}</p>
            </div>
          </div>

          {/* Messages/Comments */}
          <div className="detail-card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="detail-card-title" style={{ margin: 0 }}><ChatIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Mensagens ({regularComments.length})</div>
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowCommentModal(true)}>
                <AddIcon sx={{ fontSize: '1rem', mr: 0.3 }} /> Adicionar
              </button>
            </div>
            <div className="comments-list">
              {regularComments.length > 0 ? (
                regularComments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-author-info">
                        <strong style={{ color: '#fff' }}>{comment.username || comment.name || 'Anónimo'}</strong>
                        <span className="comment-date">{new Date(comment.created_at).toLocaleString('pt-PT')}</span>
                      </div>
                      {(comment.user_id === currentUser.id || isAdmin) && (
                        <button 
                          className="btn-icon-small" 
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Eliminar"
                        >
                          <DeleteIcon sx={{ fontSize: '1rem' }} />
                        </button>
                      )}
                    </div>
                    <p className="comment-text">{comment.message}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', margin: 0, textAlign: 'center', padding: '1rem' }}>Sem mensagens</p>
              )}
            </div>
          </div>

          {/* Solutions */}
          {solutions.length > 0 && (
            <div className="detail-card-box" style={{ borderLeft: '4px solid #4caf50' }}>
              <div className="detail-card-title"><CheckCircleIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle', color: '#4caf50' }} /> Solução</div>
              {solutions.map(sol => (
                <div key={sol.id} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#4caf50' }}>{sol.username || 'Admin'}</strong>
                    <span style={{ color: '#666', fontSize: '0.85rem' }}>{new Date(sol.created_at).toLocaleString('pt-PT')}</span>
                  </div>
                  <p style={{ color: '#ccc', lineHeight: '1.6' }}>{sol.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tasks */}
          <div className="detail-card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="detail-card-title" style={{ margin: 0 }}><TaskAltIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Tarefas ({tasks.length})</div>
              {isAdmin && (
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowTaskModal(true)}>
                  <AddIcon sx={{ fontSize: '1rem', mr: 0.3 }} /> Adicionar
                </button>
              )}
            </div>
            <div className="tasks-list">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <div key={task.id} className="task-item">
                    <div className="task-content">
                      <TaskAltIcon sx={{ fontSize: '1.1rem', color: '#3d6aff', flexShrink: 0, mt: '2px' }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ color: '#ccc', margin: 0 }}>{task.message}</p>
                        <small style={{ color: '#666' }}>
                          {task.username} — {new Date(task.created_at).toLocaleString('pt-PT')}
                          {task.time_spent > 0 && (
                            <span style={{ color: '#3d6aff', marginLeft: '0.5rem' }}>
                              <AccessTimeIcon sx={{ fontSize: '0.8rem', verticalAlign: 'middle', mr: 0.3 }} />
                              {formatMinutes(task.time_spent)}
                            </span>
                          )}
                        </small>
                      </div>
                    </div>
                    {isAdmin && (
                      <button 
                        className="btn-icon-small" 
                        onClick={() => handleDeleteComment(task.id)}
                        title="Eliminar"
                      >
                        <DeleteIcon sx={{ fontSize: '1rem' }} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', margin: 0, textAlign: 'center', padding: '1rem' }}>Sem tarefas</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="ticket-detail-sidebar">
          {/* Status and Priority */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Status</div>
            <StatusBadge status={ticket.status} />
            
            <div className="info-item" style={{ marginTop: '1rem' }}>
              <div className="sidebar-card-title">Prioridade</div>
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

          {/* Creator Info */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Criado por</div>
            <div className="info-item">
              {isAdmin ? (
                <Link to={`/users/${ticket.user_id}`} className="clickable-link" style={{ fontSize: '1.1rem' }}>
                  <PersonIcon sx={{ fontSize: '1.1rem', mr: 0.5, verticalAlign: 'middle' }} />
                  {ticket.creator_display_name || ticket.creator_name || 'Desconhecido'}
                </Link>
              ) : (
                <span style={{ color: '#fff', fontSize: '1.1rem' }}>
                  <PersonIcon sx={{ fontSize: '1.1rem', mr: 0.5, verticalAlign: 'middle' }} />
                  {ticket.creator_display_name || ticket.creator_name || 'Desconhecido'}
                </span>
              )}
              {ticket.creator_email && (
                <div className="info-value" style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  {ticket.creator_email}
                </div>
              )}
            </div>
          </div>

          {/* Assigned Admin */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Admin Atribuído</div>
            <div className="info-item">
              {ticket.assigned_to ? (
                isAdmin ? (
                  <Link to={`/users/${ticket.assigned_to}`} className="clickable-link" style={{ fontSize: '1.1rem' }}>
                    <BuildIcon sx={{ fontSize: '1.1rem', mr: 0.5, verticalAlign: 'middle' }} />
                    {ticket.assigned_display_name || ticket.assigned_name || 'Admin'}
                  </Link>
                ) : (
                  <span style={{ color: '#fff', fontSize: '1.1rem' }}>
                    <BuildIcon sx={{ fontSize: '1.1rem', mr: 0.5, verticalAlign: 'middle' }} />
                    {ticket.assigned_display_name || ticket.assigned_name || 'Admin'}
                  </span>
                )
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ color: '#ff9800', fontSize: '1rem' }}>
                    <WarningAmberIcon sx={{ fontSize: '1rem', mr: 0.3, verticalAlign: 'middle' }} /> Não atribuído
                  </span>
                  {isAdmin && (
                    <button 
                      className="btn btn-primary" 
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem' }} 
                      onClick={handleAssignToMe}
                      disabled={actionLoading}
                    >
                      Ficar com ticket
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Informações</div>
            <div className="info-item">
              <div className="info-label">ID</div>
              <div className="info-value">#{ticket.id.toString().padStart(4, '0')}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Categoria</div>
              <div className="info-value">{ticket.category || '-'}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Criado em</div>
              <div className="info-value">{new Date(ticket.created_at).toLocaleDateString('pt-PT')}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Atualizado em</div>
              <div className="info-value">{new Date(ticket.updated_at).toLocaleDateString('pt-PT')}</div>
            </div>
            {ticket.resolved_at && (
              <div className="info-item">
                <div className="info-label">Resolvido em</div>
                <div className="info-value">{new Date(ticket.resolved_at).toLocaleDateString('pt-PT')}</div>
              </div>
            )}
            <div className="info-item">
              <div className="info-label">Tempo Total</div>
              <div className="info-value">{formatMinutes(totalTimeSpent)}</div>
            </div>
          </div>

          {/* Equipment in sidebar */}
          <div className="sidebar-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="sidebar-card-title" style={{ margin: 0 }}>Equipamento ({ticketEquipment.length})</div>
              {isAdmin && (
                <button className="btn-icon-small" onClick={openEquipmentModal} title="Associar equipamento">
                  <AddIcon sx={{ fontSize: '1rem' }} />
                </button>
              )}
            </div>
            {ticket.primary_equipment_id && (
              <div className="info-item" style={{ marginTop: '0.5rem' }}>
                <div className="info-label">Principal</div>
                {isAdmin ? (
                  <Link to={`/equipment/${ticket.primary_equipment_id}`} className="clickable-link" style={{ fontSize: '0.9rem' }}>
                    <ComputerIcon sx={{ fontSize: '0.9rem', mr: 0.3, verticalAlign: 'middle' }} />
                    {ticket.equipment_name || `#${ticket.primary_equipment_id}`}
                  </Link>
                ) : (
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>
                    <ComputerIcon sx={{ fontSize: '0.9rem', mr: 0.3, verticalAlign: 'middle' }} />
                    {ticket.equipment_name || `#${ticket.primary_equipment_id}`}
                  </span>
                )}
              </div>
            )}
            {ticketEquipment.length > 0 ? (
              <div style={{ marginTop: '0.5rem' }}>
                {ticketEquipment.map(eq => (
                  <div key={eq.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.35rem 0', borderBottom: '1px solid #333' }}>
                    <div>
                      <Link to={`/equipment/${eq.equipment_id}`} className="clickable-link" style={{ fontSize: '0.85rem' }}>
                        <ComputerIcon sx={{ fontSize: '0.85rem', mr: 0.3, verticalAlign: 'middle' }} />
                        {eq.equipment_name}
                      </Link>
                      <div style={{ color: '#666', fontSize: '0.75rem' }}>{eq.equipment_type}</div>
                    </div>
                    {isAdmin && (
                      <button className="btn-icon-small" onClick={() => handleRemoveEquipment(eq.id)} title="Remover">
                        <CloseIcon sx={{ fontSize: '0.85rem' }} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : !ticket.primary_equipment_id && (
              <p style={{ color: '#666', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Sem equipamento</p>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <FormModal
        isOpen={showCommentModal}
        title="Adicionar Mensagem"
        fields={[
          {
            name: 'message',
            label: 'Mensagem',
            type: 'textarea',
            required: true,
            placeholder: 'Escreve a tua mensagem...'
          }
        ]}
        onSubmit={handleAddComment}
        onClose={() => setShowCommentModal(false)}
        loading={actionLoading}
      />

      <FormModal
        isOpen={showTaskModal}
        title="Adicionar Tarefa"
        fields={[
          {
            name: 'message',
            label: 'Descrição da Tarefa',
            type: 'textarea',
            required: true,
            placeholder: 'Descreve a tarefa...'
          },
          {
            name: 'time_spent',
            label: 'Tempo gasto (minutos)',
            type: 'number',
            placeholder: 'Ex: 30 (opcional)'
          }
        ]}
        onSubmit={handleAddTask}
        onClose={() => setShowTaskModal(false)}
        loading={actionLoading}
      />

      <FormModal
        isOpen={showStatusModal}
        title="Mudar Status"
        fields={[
          {
            name: 'status',
            label: 'Novo Status',
            type: 'select',
            required: true,
            options: [
              { value: 'open', label: 'Aberto' },
              { value: 'in_progress', label: 'Em Progresso' },
              { value: 'waiting', label: 'Aguardando' },
              { value: 'resolved', label: 'Resolvido' },
              { value: 'closed', label: 'Fechado' }
            ]
          }
        ]}
        onSubmit={handleStatusChange}
        onClose={() => setShowStatusModal(false)}
        loading={actionLoading}
      />

      <FormModal
        isOpen={showAssignModal}
        title="Atribuir Ticket"
        fields={[
          {
            name: 'admin_id',
            label: 'Admin',
            type: 'select',
            required: true,
            options: admins.map(a => ({ value: a.id, label: a.name || a.username }))
          }
        ]}
        onSubmit={handleAssignTicket}
        onClose={() => setShowAssignModal(false)}
        loading={actionLoading}
      />

      <FormModal
        isOpen={showEquipmentModal}
        title="Associar Equipamento"
        fields={[
          {
            name: 'equipment_id',
            label: 'Equipamento',
            type: 'select',
            required: true,
            options: allEquipment.map(e => ({ value: e.id, label: `${e.name} (${e.type})` }))
          },
          {
            name: 'notes',
            label: 'Notas',
            type: 'text',
            placeholder: 'Notas sobre o equipamento (opcional)'
          }
        ]}
        onSubmit={handleAddEquipment}
        onClose={() => setShowEquipmentModal(false)}
        loading={actionLoading}
      />
    </div>
  );
}
