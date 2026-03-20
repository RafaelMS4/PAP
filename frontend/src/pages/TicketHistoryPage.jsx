import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HistoryIcon from '@mui/icons-material/History';
import DateRangeIcon from '@mui/icons-material/DateRange';
import '../styles/detail-page.css';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-PT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getActionLabel(action) {
  const labels = {
    status_changed: 'Status Alterado',
    priority_changed: 'Prioridade Alterada',
    assignment_changed: 'Atribuição Alterada',
    equipment_added: 'Equipamento Adicionado',
    equipment_removed: 'Equipamento Removido',
  };
  return labels[action] || action;
}

export default function TicketHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = currentUser.role === 'admin';

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, historyRes] = await Promise.all([
        api.get(`/tickets/${id}`),
        api.get(`/tickets/${id}/history`).catch(() => ({ data: { history: [] } })),
      ]);

      const ticketData = ticketRes.data.ticket || ticketRes.data;

      if (!isAdmin && ticketData.user_id !== currentUser.id) {
        navigate('/user-dashboard');
        return;
      }

      setTicket(ticketData);
      setHistory(historyRes.data.history || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-page">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="spinner"></div>
          <p style={{ color: '#999' }}>Carregando histórico...</p>
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
          <button className="btn-back" onClick={() => navigate(`/tickets/${id}`)}>
            <ArrowBackIcon sx={{ fontSize: '1rem', mr: 0.5 }} /> Voltar
          </button>
          <h2 style={{ margin: 0, flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HistoryIcon /> Histórico do Ticket #{ticket.id}
          </h2>
        </div>
      </div>

      <div style={{ padding: '2rem', maxWidth: '900px' }}>
        <h3 style={{ color: '#fff', marginBottom: '1.5rem' }}>Alterações</h3>

        {history.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>
            Nenhuma alteração registada
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((entry) => (
              <div
                key={entry.id}
                style={{
                  backgroundColor: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '8px',
                  borderLeft: '4px solid #3d6aff',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>
                    {getActionLabel(entry.action)}
                  </h4>
                  <span style={{ color: '#666', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <DateRangeIcon sx={{ fontSize: '0.85rem' }} />
                    {formatDate(entry.created_at)}
                  </span>
                </div>
                <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  Por: <strong style={{ color: '#ccc' }}>{entry.username || 'Sistema'}</strong>
                </div>
                {entry.old_value && (
                  <div style={{ color: '#999', fontSize: '0.85rem' }}>
                    Anterior: <span style={{ color: '#ff6b6b' }}>{entry.old_value}</span>
                  </div>
                )}
                {entry.new_value && (
                  <div style={{ color: '#999', fontSize: '0.85rem' }}>
                    Novo: <span style={{ color: '#4caf50' }}>{entry.new_value}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
