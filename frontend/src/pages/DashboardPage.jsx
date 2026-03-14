import { useEffect, useState, useMemo, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { StatusPieChart, PriorityBarChart, TicketsTrendChart, AdminPerformanceChart } from '../components/Charts';
import '../styles/dashboard.css';
import { 
  Assignment, 
  Schedule, 
  CheckCircle, 
  WarningAmber, 
  NotificationsActive, 
  TrendingUp, 
  People, 
  Computer,
  AutoAwesome,
  RefreshOutlined,
  AccessTime,
  EmojiEvents
} from '@mui/icons-material';

// Componente otimizado para StatCard
const StatCard = memo(({ title, value, icon, color, subtitle }) => (
  <div className="stat-card" style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ backgroundColor: `${color}15` }}>
      <span style={{ color }}>{icon}</span>
    </div>
    <div className="stat-content">
      <p className="stat-label">{title}</p>
      <p className="stat-value">{value}</p>
      {subtitle && <p className="stat-subtitle">{subtitle}</p>}
    </div>
  </div>
));

// Componente otimizado para AdminTable
const AdminTable = memo(({ admins }) => (
  <div className="admin-table-wrapper">
    <table className="admin-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Admin</th>
          <th className="text-right">Horas</th>
        </tr>
      </thead>
      <tbody>
        {admins.map((admin, index) => (
          <tr key={admin.id}>
            <td><span className="rank-badge" style={{ 
              backgroundColor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#3d6aff' 
            }}>{index + 1}</span></td>
            <td className="admin-name">{admin.username}</td>
            <td className="text-right admin-hours">{(admin.total_hours / 60).toFixed(1)}h</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
));

// Componente otimizado para PriorityChart
const PriorityChart = memo(({ priorities, total }) => (
  <div className="priority-chart">
    {priorities && priorities.length > 0 ? (
      priorities.map((item) => {
        const colors = {
          low: '#4caf50',
          medium: '#ff9800',
          high: '#ff5722',
          urgent: '#f44336'
        };
        const labels = {
          low: 'Baixa',
          medium: 'Média',
          high: 'Alta',
          urgent: 'Urgente'
        };
        const percentage = total > 0 ? (item.count / total) * 100 : 0;
        
        return (
          <div key={item.priority} className="priority-item">
            <div className="priority-header">
              <span className="priority-label">{labels[item.priority] || item.priority}</span>
              <span className="priority-count">{item.count}</span>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: colors[item.priority]
                }}
              />
            </div>
          </div>
        );
      })
    ) : (
      <p className="no-data">Sem dados de prioridade</p>
    )}
  </div>
));

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
    fetchTrendData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.stats);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
      setError(error.response?.data?.error || error.message);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // NOVA FUNÇÃO
  const fetchTrendData = async () => {
    try {
      const response = await api.get('/dashboard/ticket-trend');
      setTrendData(response.data.trend);
    } catch (error) {
      console.error('Erro ao buscar trend:', error);
    }
  };

  // Memoized calculated values
  const totalActiveTickets = useMemo(() => {
    if (!stats?.tickets) return 0;
    return (stats.tickets.open || 0) + (stats.tickets.in_progress || 0);
  }, [stats]);

  // Memoized main stats array
  const mainStats = useMemo(() => [
    { 
      title: 'Abertos', 
      value: stats?.tickets?.open || 0, 
      icon: <Assignment sx={{ fontSize: '1.5rem' }} />,
      color: '#ff9800',
      subtitle: 'Aguardando'
    },
    { 
      title: 'Em Progresso', 
      value: stats?.tickets?.in_progress || 0, 
      icon: <Schedule sx={{ fontSize: '1.5rem' }} />,
      color: '#2196f3',
      subtitle: 'Trabalhando'
    },
    { 
      title: 'Fechados', 
      value: stats?.tickets?.closed || 0, 
      icon: <CheckCircle sx={{ fontSize: '1.5rem' }} />,
      color: '#4caf50',
      subtitle: 'Resolvidos'
    },
    { 
      title: 'Urgentes', 
      value: stats?.tickets?.urgent || 0, 
      icon: <WarningAmber sx={{ fontSize: '1.5rem' }} />,
      color: '#f44336',
      subtitle: 'Críticos'
    }
  ], [stats]);

  const secondaryStats = useMemo(() => [
    {
      title: 'Não Atribuídos',
      value: stats?.tickets?.unassigned || 0,
      icon: <NotificationsActive sx={{ fontSize: '1.5rem' }} />,
      color: '#ff6b6b'
    },
    {
      title: 'Este Mês',
      value: stats?.tickets?.this_month || 0,
      icon: <TrendingUp sx={{ fontSize: '1.5rem' }} />,
      color: '#9c27b0'
    },
    {
      title: 'Horas Admin',
      value: `${stats?.metrics?.total_admin_hours || 0}h`,
      icon: <AccessTime sx={{ fontSize: '1.5rem' }} />,
      color: '#3d6aff'
    },
    {
      title: 'Utilizadores',
      value: stats?.system?.total_users || 0,
      icon: <People sx={{ fontSize: '1.5rem' }} />,
      color: '#00bcd4'
    },
    {
      title: 'Equipamentos',
      value: stats?.system?.total_equipment || 0,
      icon: <Computer sx={{ fontSize: '1.5rem' }} />,
      color: '#ff5722'
    }
  ], [stats]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-content">
          <p className="error-title"><WarningAmber sx={{ fontSize: '1.5rem', mr: 1 }} /> Erro ao carregar dados</p>
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchDashboardStats}>
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="dashboard-error">
        <p>Nenhum dado disponível</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dashboard-date">
            {new Date().toLocaleDateString('pt-PT', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button className="refresh-btn" onClick={() => {
          fetchDashboardStats();
          fetchTrendData();
        }}>
          <RefreshOutlined sx={{ fontSize: '1rem', mr: 0.5 }} /> Atualizar
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="stats-grid main-stats">
        {mainStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Secondary Stats Grid */}
      <div className="stats-grid secondary-stats">
        {secondaryStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <StatusPieChart data={stats.tickets} />
        {stats.top_admins && stats.top_admins.length > 0 && (
          <AdminPerformanceChart admins={stats.top_admins} />
        )}
        <TicketsTrendChart data={trendData} />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        {/* Resolution Time Card */}
        <div className="chart-card resolution-time">
          <div className="card-header">
            <h3><AccessTime sx={{ fontSize: '1.5rem', mr: 1 }} />Tempo Médio de Resolução</h3>
          </div>
          <div className="chart-content">
            <p className="big-number">{stats.metrics?.avg_resolution_hours || 0}h</p>
            <p className="chart-subtitle">Últimos 30 dias</p>
          </div>
        </div>

        {/* Priority Distribution Card */}
        <div className="chart-card priority-distribution">
          <div className="card-header">
            <h3><AutoAwesome sx={{ fontSize: '1.5rem', mr: 1 }} />Tickets por Prioridade</h3>
          </div>
          <div className="chart-content">
            <PriorityChart 
              priorities={stats.tickets?.by_priority} 
              total={totalActiveTickets}
            />
          </div>
        </div>
      </div>

      {/* Top Admins Table */}
      {stats.top_admins && stats.top_admins.length > 0 && (
        <div className="top-admins-card">
          <div className="card-header">
            <h3><EmojiEvents sx={{ fontSize: '1.5rem', mr: 1 }} />Top 5 Admins Mais Ativos</h3>
            <p className="card-subtitle">Últimos 30 dias</p>
          </div>
          <AdminTable admins={stats.top_admins} />
        </div>
      )}
    </div>
  );
}