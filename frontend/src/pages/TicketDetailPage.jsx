import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { Modal } from '../components/Modal';
import FormModal from '../components/FormModal';
import '../styles/list-page.css';

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);

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
      
      // Check if non-admin user is trying to access someone else's ticket
      if (!isAdmin && ticketData.user_id !== currentUser.id) {
        navigate('/user-dashboard');
        return;
      }

      const commentsRes = await api.get(`/tickets/${id}/comments`).catch(() => ({ data: { comments: [] } }));
      const timeLogsRes = await api.get(`/tickets/${id}/time-logs`).catch(() => ({ data: { time_logs: [] } }));
      const historyRes = await api.get(`/tickets/${id}/history`).catch(() => ({ data: { history: [] } }));

      setTicket(ticketData);
      setComments(commentsRes.data.comments || []);
      setTimeLogs(timeLogsRes.data.time_logs || []);
      setHistory(historyRes.data.history || []);
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (formData) => {
    try {
      setCommentLoading(true);
      await api.post(`/tickets/${id}/comments`, {
        text: formData.comment
      });
      setShowCommentModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      alert('Erro ao adicionar comentário');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleStatusChange = async (formData) => {
    try {
      setCommentLoading(true);
      await api.put(`/tickets/${id}/status`, {
        status: formData.status
      });
      setShowStatusModal(false);
      fetchTicketDetails();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    } finally {
      setCommentLoading(false);
    }
  };

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
        <div>
          <h1>#{ticket.id.toString().padStart(4, '0')} - {ticket.title}</h1>
          <p style={{ color: '#999', margin: '0.5rem 0 0 0' }}>
            Criado em {new Date(ticket.created_at).toLocaleDateString('pt-PT')}
          </p>
        </div>
        <div className="detail-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setShowStatusModal(true)}>
              Mudar Status
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(isAdmin ? '/tickets' : '/user-dashboard')}>
            Voltar
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-main">
          {/* Description */}
          <div className="detail-card">
            <div className="detail-card-title">📝 Descrição</div>
            <div className="detail-content">
              <p>{ticket.description}</p>
            </div>
          </div>

          {/* Comments */}
          <div className="detail-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="detail-card-title" style={{ margin: 0 }}>💬 Comentários ({comments.length})</div>
              <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowCommentModal(true)}>
                Adicionar
              </button>
            </div>
            <div className="comments-list">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <div className="comment-author">{comment.author_name || 'Anónimo'}</div>
                    <div className="comment-date">{new Date(comment.created_at).toLocaleString('pt-PT')}</div>
                    <p className="comment-text">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p style={{ color: '#666', margin: 0 }}>Sem comentários</p>
              )}
            </div>
          </div>

          {/* Time Logs */}
          {timeLogs.length > 0 && (
            <div className="detail-card">
              <div className="detail-card-title">⏱️ Registos de Tempo</div>
              <div style={{ color: '#999', fontSize: '0.9rem' }}>
                {timeLogs.map(log => (
                  <div key={log.id} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid #3a3a3a' }}>
                    <strong>{log.description}</strong><br />
                    <small>{log.duration}h - {log.admin_name}</small>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}

        </div>

        {/* Sidebar */}
        <div className="detail-sidebar">
          {/* Status and Priority */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">Status</div>
            <StatusBadge status={ticket.status} />
            
            <div className="info-item" style={{ marginTop: '1rem' }}>
              <div className="sidebar-card-title">Prioridade</div>
              <PriorityBadge priority={ticket.priority} />
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
          </div>
        </div>
      </div>

      {/* Modals */}
      <FormModal
        isOpen={showCommentModal}
        title="Adicionar Comentário"
        fields={[
          {
            name: 'comment',
            label: 'Comentário',
            type: 'textarea',
            required: true,
            placeholder: 'Escreve o teu comentário...'
          }
        ]}
        onSubmit={handleAddComment}
        onClose={() => setShowCommentModal(false)}
        loading={commentLoading}
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
              { value: 'closed', label: 'Fechado' }
            ]
          }
        ]}
        onSubmit={handleStatusChange}
        onClose={() => setShowStatusModal(false)}
        loading={commentLoading}
      />
    </div>
  );
}
