import { useState, useEffect, useRef } from 'react';
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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import HistoryIcon from '@mui/icons-material/History';
import '../styles/detail-page.css';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];

function isImage(mimeType) {
  return IMAGE_TYPES.includes(mimeType);
}

function isPdf(mimeType) {
  return mimeType === 'application/pdf';
}

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(mimeType) {
  if (!mimeType) return <InsertDriveFileIcon style={{ color: '#999' }} />;
  if (isImage(mimeType)) return <ImageIcon style={{ color: '#3d6aff' }} />;
  if (isPdf(mimeType)) return <InsertDriveFileIcon style={{ color: '#ff5722' }} />;
  return <InsertDriveFileIcon style={{ color: '#999' }} />;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [ticketEquipment, setTicketEquipment] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [imageBlobUrls, setImageBlobUrls] = useState({}); // { [attachmentId]: blobUrl }
  const [allEquipment, setAllEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const blobUrlsRef = useRef({});

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchTicketDetails();
    return () => {
      // Limpar blob URLs quando o componente desmonta
      Object.values(blobUrlsRef.current).forEach((url) => window.URL.revokeObjectURL(url));
    };
  }, [id]);

  // Carregar blob URLs para imagens sempre que os attachments mudam
  useEffect(() => {
    const imageAttachments = attachments.filter((a) => isImage(a.file_type));
    imageAttachments.forEach(async (att) => {
      if (blobUrlsRef.current[att.id]) return; // já carregado
      try {
        const response = await api.get(`/tickets/attachments/${att.id}/download?inline=true`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: att.file_type }));
        blobUrlsRef.current[att.id] = url;
        setImageBlobUrls((prev) => ({ ...prev, [att.id]: url }));
      } catch (e) {
        console.error('Erro ao carregar thumbnail:', e);
      }
    });
  }, [attachments]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketRes = await api.get(`/tickets/${id}`);
      const ticketData = ticketRes.data.ticket || ticketRes.data;

      if (!isAdmin && ticketData.user_id !== currentUser.id) {
        navigate('/user-dashboard');
        return;
      }

      const [commentsRes, timeLogsRes, equipmentRes, attachmentsRes] = await Promise.all([
        api.get(`/tickets/${id}/comments`).catch(() => ({ data: { comments: [] } })),
        api.get(`/tickets/${id}/time-logs`).catch(() => ({ data: { timeLogs: [] } })),
        api.get(`/tickets/${id}/equipment`).catch(() => ({ data: { ticketEquipment: [] } })),
        api.get(`/tickets/${id}/attachments`).catch(() => ({ data: { attachments: [] } })),
      ]);

      setTicket(ticketData);
      setComments(commentsRes.data.comments || []);
      setTimeLogs(timeLogsRes.data.timeLogs || timeLogsRes.data.time_logs || []);
      setTicketEquipment(equipmentRes.data.ticketEquipment || []);
      setAttachments(attachmentsRes.data.attachments || []);
    } catch (error) {
      console.error('Erro ao buscar ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInline = async (att) => {
    try {
      const response = await api.get(`/tickets/attachments/${att.id}/download?inline=true`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: att.file_type }));
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
    } catch (error) {
      window.showNotification('error', 'Erro ao abrir ficheiro');
    }
  };

  const handleDownloadAttachment = async (att) => {
    try {
      const response = await api.get(`/tickets/attachments/${att.id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', att.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      window.showNotification('error', 'Erro ao descarregar ficheiro');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      window.showNotification('error', 'Ficheiro demasiado grande! Máximo 50MB.');
      e.target.value = '';
      return;
    }

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', file);
      await api.post(`/tickets/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      window.showNotification('success', 'Ficheiro anexado com sucesso!');
      fetchTicketDetails();
    } catch (error) {
      window.showNotification('error', error.response?.data?.error || 'Erro ao anexar ficheiro');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!confirm('Eliminar este anexo?')) return;
    try {
      await api.delete(`/tickets/${id}/attachments/${attachmentId}`);
      // Limpar blob URL se existir
      if (blobUrlsRef.current[attachmentId]) {
        window.URL.revokeObjectURL(blobUrlsRef.current[attachmentId]);
        delete blobUrlsRef.current[attachmentId];
        setImageBlobUrls((prev) => {
          const updated = { ...prev };
          delete updated[attachmentId];
          return updated;
        });
      }
      window.showNotification('success', 'Anexo eliminado com sucesso');
      fetchTicketDetails();
    } catch (error) {
      window.showNotification('error', 'Erro ao eliminar anexo');
    }
  };

  const handleAddComment = async (formData) => {
    try {
      setActionLoading(true);
      const commentType = formData.comment_type || 'comment';
      await api.post(`/tickets/${id}/comments`, {
        message: formData.message,
        comment_type: commentType,
      });
      if (commentType === 'solution') {
        await api.put(`/tickets/${id}/status`, { status: 'closed' });
      }
      setShowCommentModal(false);
      fetchTicketDetails();
      window.showNotification('success', 'Comentário adicionado com sucesso');
    } catch (error) {
      window.showNotification('error', 'Erro ao adicionar comentário');
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
        time_spent: formData.time_spent ? parseInt(formData.time_spent) : undefined,
      });
      setShowTaskModal(false);
      fetchTicketDetails();
      window.showNotification('success', 'Tarefa adicionada com sucesso');
    } catch (error) {
      window.showNotification('error', 'Erro ao adicionar tarefa');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (formData) => {
    try {
      setActionLoading(true);
      await api.put(`/tickets/${id}/status`, { status: formData.status });
      setShowStatusModal(false);
      fetchTicketDetails();
      window.showNotification('success', 'Status atualizado com sucesso');
    } catch (error) {
      window.showNotification('error', 'Erro ao atualizar status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      setActionLoading(true);
      await api.put(`/tickets/${id}/assign`, { assigned_to: currentUser.id });
      fetchTicketDetails();
      window.showNotification('success', 'Ticket atribuído com sucesso');
    } catch (error) {
      window.showNotification('error', 'Erro ao atribuir ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTicket = async (formData) => {
    try {
      setActionLoading(true);
      await api.put(`/tickets/${id}/assign`, { assigned_to: formData.admin_id });
      setShowAssignModal(false);
      fetchTicketDetails();
      window.showNotification('success', 'Ticket atribuído com sucesso');
    } catch (error) {
      window.showNotification('error', 'Erro ao atribuir ticket');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddEquipment = async (formData) => {
    try {
      setActionLoading(true);
      await api.post(`/tickets/${id}/equipment`, {
        equipment_id: parseInt(formData.equipment_id),
        notes: formData.notes || '',
      });
      setShowEquipmentModal(false);
      fetchTicketDetails();
      window.showNotification('success', 'Equipamento associado com sucesso');
    } catch (error) {
      window.showNotification('error', error.response?.data?.error || 'Erro ao associar equipamento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveEquipment = async (associationId) => {
    if (!confirm('Remover este equipamento do ticket?')) return;
    try {
      await api.delete(`/tickets/${id}/equipment/${associationId}`);
      fetchTicketDetails();
      window.showNotification('success', 'Equipamento removido com sucesso');
    } catch (error) {
      window.showNotification('error', 'Erro ao remover equipamento');
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
  const tasks = comments.filter((c) => c.comment_type === 'task');
  const regularComments = comments.filter((c) => c.comment_type !== 'task' && c.comment_type !== 'solution');
  const solutions = comments.filter((c) => c.comment_type === 'solution');
  const imageAttachments = attachments.filter((a) => isImage(a.file_type));
  const otherAttachments = attachments.filter((a) => !isImage(a.file_type));

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
                <button className="btn btn-secondary" onClick={() => navigate(`/tickets/${id}/history`)}>
                  <HistoryIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Histórico
                </button>
              </>
            )}
            {!isAdmin && (
              <button className="btn btn-secondary" onClick={() => navigate(`/tickets/${id}/history`)}>
                <HistoryIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Histórico
              </button>
            )}
          </div>
        </div>
        <div className="detail-title">
          <h1>#{ticket.id.toString().padStart(4, '0')} - {ticket.title}</h1>
          <p className="user-email">Criado em {new Date(ticket.created_at).toLocaleDateString('pt-PT')}</p>
        </div>
      </div>

      <div className="ticket-detail-grid">
        <div className="ticket-detail-main">

          {/* Descrição */}
          <div className="detail-card-box">
            <div className="detail-card-title">
              <DescriptionIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Descrição
            </div>
            <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>{ticket.description}</p>
          </div>

          {/* Mensagens */}
          <div className="detail-card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="detail-card-title" style={{ margin: 0 }}>
                <ChatIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Mensagens ({regularComments.length})
              </div>
              {ticket.status !== 'closed' && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileUpload} />
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFile}
                    title="Anexar ficheiro (máx. 50MB)"
                  >
                    <AttachFileIcon sx={{ fontSize: '1rem', mr: 0.3 }} />
                    {uploadingFile ? 'A enviar...' : 'Anexar'}
                  </button>
                  <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowCommentModal(true)}>
                    <AddIcon sx={{ fontSize: '1rem', mr: 0.3 }} /> Adicionar
                  </button>
                </div>
              )}
            </div>
            <div className="comments-list">
              {regularComments.length > 0 ? (
                regularComments.map((comment) => {
                  const isMyMessage = comment.user_id === currentUser.id;
                  return (
                    <div key={comment.id} className={`comment-item ${isMyMessage ? 'comment-mine' : 'comment-other'}`}>
                      <div className="comment-header">
                        <div className="comment-author-info">
                          <strong style={{ color: isMyMessage ? '#3d6aff' : '#fff' }}>
                            {isMyMessage ? 'Eu' : comment.username || 'Anónimo'}
                          </strong>
                          <span className="comment-date">{new Date(comment.created_at).toLocaleString('pt-PT')}</span>
                        </div>
                        {(comment.user_id === currentUser.id || isAdmin) && (
                          <button className="btn-icon-small" onClick={() => handleDeleteComment(comment.id)} title="Eliminar">
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </button>
                        )}
                      </div>
                      <p className="comment-text">{comment.message}</p>
                    </div>
                  );
                })
              ) : (
                <p style={{ color: '#666', margin: 0, textAlign: 'center', padding: '1rem' }}>Sem mensagens</p>
              )}
            </div>
          </div>

          {/* Anexos */}
          <div className="detail-card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="detail-card-title" style={{ margin: 0 }}>
                <AttachFileIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Anexos ({attachments.length})
              </div>
              {ticket.status !== 'closed' && (
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFile}
                >
                  <AddIcon sx={{ fontSize: '1rem', mr: 0.3 }} /> {uploadingFile ? 'A enviar...' : 'Adicionar'}
                </button>
              )}
            </div>

            {/* Grid de imagens */}
            {imageAttachments.length > 0 && (
              <div className="attachments-images-grid">
                {imageAttachments.map((att) => (
                  <div key={att.id} className="attachment-image-wrapper">
                    {imageBlobUrls[att.id] ? (
                      <img
                        src={imageBlobUrls[att.id]}
                        alt={att.filename}
                        className="attachment-image-preview"
                        onClick={() => handleOpenInline(att)}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1c1e1e' }}>
                        <div className="spinner" style={{ width: 24, height: 24, borderWidth: 3 }}></div>
                      </div>
                    )}
                    <div className="attachment-image-overlay">
                      <span className="attachment-image-name">{att.filename}</span>

                      <span style={{ fontSize: '0.72rem', color: '#ccc', display: 'block', marginTop: '0.1rem' }}>
                        <PersonIcon sx={{ fontSize: '0.75rem', verticalAlign: 'middle', mr: 0.3 }} />
                        {att.user_id === currentUser.id ? 'Eu' : att.username || 'Desconhecido'} •{' '}
                        {new Date(att.created_at).toLocaleDateString('pt-PT')}
                      </span>

                      <div style={{ display: 'flex', gap: '0.3rem', marginTop: '0.3rem' }}>
                        <button className="btn-icon-small" title="Abrir" onClick={() => handleOpenInline(att)}>
                          <OpenInNewIcon sx={{ fontSize: '1rem', color: '#fff' }} />
                        </button>
                        <button className="btn-icon-small" title="Descarregar" onClick={() => handleDownloadAttachment(att)}>
                          <DownloadIcon sx={{ fontSize: '1rem', color: '#3d6aff' }} />
                        </button>
                        {(att.user_id === currentUser.id || isAdmin) && (
                          <button className="btn-icon-small" title="Eliminar" onClick={() => handleDeleteAttachment(att.id)}>
                            <DeleteIcon sx={{ fontSize: '1rem' }} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Lista de outros ficheiros (PDFs, docs, etc.) */}
            {otherAttachments.length > 0 && (
              <div className="attachments-list" style={{ marginTop: imageAttachments.length > 0 ? '1rem' : '0' }}>
                {otherAttachments.map((att) => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-icon">{getFileIcon(att.file_type)}</div>
                    <div className="attachment-info">
                      <span className="attachment-name">{att.filename}</span>
                      <span className="attachment-meta">
                        {formatBytes(att.file_size)} &bull;{' '}
                        <PersonIcon sx={{ fontSize: '0.75rem', verticalAlign: 'middle', mr: 0.2 }} />
                        {att.user_id === currentUser.id ? 'Eu' : att.username || 'Desconhecido'} &bull;{' '}
                        {new Date(att.created_at).toLocaleDateString('pt-PT')}
                      </span>
                    </div>
                    <div className="attachment-actions">
                      {isPdf(att.file_type) && (
                        <button className="btn-icon-small" title="Abrir PDF" onClick={() => handleOpenInline(att)}>
                          <OpenInNewIcon sx={{ fontSize: '1.1rem', color: '#ff5722' }} />
                        </button>
                      )}
                      <button className="btn-icon-small" title="Descarregar" onClick={() => handleDownloadAttachment(att)}>
                        <DownloadIcon sx={{ fontSize: '1.1rem', color: '#3d6aff' }} />
                      </button>
                      {(att.user_id === currentUser.id || isAdmin) && (
                        <button className="btn-icon-small" title="Eliminar" onClick={() => handleDeleteAttachment(att.id)}>
                          <DeleteIcon sx={{ fontSize: '1rem' }} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {attachments.length === 0 && (
              <p style={{ color: '#666', margin: 0, textAlign: 'center', padding: '1rem' }}>Sem anexos</p>
            )}
            <p className="attachment-limit-hint">Máximo 50MB por ficheiro</p>
          </div>

          {/* Solução */}
          {solutions.length > 0 && (
            <div className="detail-card-box" style={{ borderLeft: '4px solid #4caf50' }}>
              <div className="detail-card-title">
                <CheckCircleIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle', color: '#4caf50' }} /> Solução
              </div>
              {solutions.map((sol) => (
                <div key={sol.id} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ color: '#4caf50' }}>{sol.username || 'IT'}</strong>
                    <span style={{ color: '#666', fontSize: '0.85rem' }}>{new Date(sol.created_at).toLocaleString('pt-PT')}</span>
                  </div>
                  <p style={{ color: '#ccc', lineHeight: '1.6', margin: 0 }}>{sol.message}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tarefas */}
          <div className="detail-card-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div className="detail-card-title" style={{ margin: 0 }}>
                <TaskAltIcon sx={{ fontSize: '1.2rem', mr: 0.5, verticalAlign: 'middle' }} /> Tarefas ({tasks.length})
              </div>
              {isAdmin && ticket.status !== 'closed' && (
                <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={() => setShowTaskModal(true)}>
                  <AddIcon sx={{ fontSize: '1rem', mr: 0.3 }} /> Adicionar
                </button>
              )}
            </div>
            <div className="tasks-list">
              {tasks.length > 0 ? (
                tasks.map((task) => (
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
                      <button className="btn-icon-small" onClick={() => handleDeleteComment(task.id)} title="Eliminar">
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

          <div className="sidebar-card">
            <div className="sidebar-card-title">Status</div>
            <StatusBadge status={ticket.status} />
            <div className="info-item" style={{ marginTop: '1rem' }}>
              <div className="sidebar-card-title">Prioridade</div>
              <PriorityBadge priority={ticket.priority} />
            </div>
          </div>

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
                <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>{ticket.creator_email}</div>
              )}
            </div>
          </div>

          <div className="sidebar-card">
            <div className="sidebar-card-title">IT Atribuído</div>
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
                {ticketEquipment.map((eq) => (
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
            ) : (
              !ticket.primary_equipment_id && (
                <p style={{ color: '#666', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>Sem equipamento</p>
              )
            )}
          </div>
        </div>
      </div>

      {/* Modais */}
      <FormModal
        isOpen={showCommentModal}
        title="Adicionar Mensagem"
        fields={[
          {
            name: 'comment_type',
            label: 'Tipo de Mensagem',
            type: 'select',
            required: true,
            options: [
              { value: 'comment', label: 'Mensagem' },
              { value: 'solution', label: 'Conclusão' },
            ],
            defaultValue: 'comment',
          },
          {
            name: 'message',
            label: 'Mensagem',
            type: 'textarea',
            required: true,
            placeholder: 'Escreve a tua mensagem...',
          },
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
            placeholder: 'Descreve a tarefa...',
          },
          {
            name: 'time_spent',
            label: 'Tempo gasto (minutos)',
            type: 'number',
            placeholder: 'Ex: 30 (opcional)',
          },
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
              { value: 'closed', label: 'Fechado' },
            ],
          },
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
            options: admins.map((a) => ({ value: a.id, label: a.name || a.username })),
          },
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
            options: allEquipment.map((e) => ({ value: e.id, label: `${e.name} (${e.type})` })),
          },
          {
            name: 'notes',
            label: 'Notas',
            type: 'text',
            placeholder: 'Notas sobre o equipamento (opcional)',
          },
        ]}
        onSubmit={handleAddEquipment}
        onClose={() => setShowEquipmentModal(false)}
        loading={actionLoading}
      />
    </div>
  );
}