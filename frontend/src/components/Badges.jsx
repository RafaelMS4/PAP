import { memo } from 'react';
import '../styles/badges.css';

export const StatusBadge = memo(({ status }) => {
  const config = {
    open: { label: 'Aberto', color: '#ff9800' },
    in_progress: { label: 'Em Progresso', color: '#2196f3' },
    waiting: { label: 'Aguardando', color: '#9c27b0' },
    resolved: { label: 'Resolvido', color: '#4caf50' },
    closed: { label: 'Fechado', color: '#4caf50' }
  };

  const data = config[status] || { label: status, color: '#999' };

  return (
    <span className="badge badge-status" style={{ borderColor: data.color, color: data.color }}>
      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', backgroundColor: data.color, marginRight: 6, verticalAlign: 'middle' }} />
      {data.label}
    </span>
  );
});

export const PriorityBadge = memo(({ priority }) => {
  const config = {
    low: { label: 'Baixa', color: '#4caf50', bg: '#4caf5015' },
    medium: { label: 'Média', color: '#ff9800', bg: '#ff980015' },
    high: { label: 'Alta', color: '#ff5722', bg: '#ff572215' },
    urgent: { label: 'Urgente', color: '#f44336', bg: '#f4433615' }
  };

  const data = config[priority] || { label: priority, color: '#999', bg: '#99999915' };

  return (
    <span className="badge badge-priority" style={{ backgroundColor: data.bg, color: data.color }}>
      {data.label}
    </span>
  );
});

export const RoleBadge = memo(({ role }) => {
  const config = {
    admin: { label: 'Admin', color: '#f44336', bg: '#f4433615' },
    user: { label: 'Utilizador', color: '#2196f3', bg: '#2196f315' }
  };

  const data = config[role] || { label: role, color: '#999', bg: '#99999915' };

  return (
    <span className="badge badge-role" style={{ backgroundColor: data.bg, color: data.color }}>
      {data.label}
    </span>
  );
});

export default { StatusBadge, PriorityBadge, RoleBadge };
