import { memo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

// Pie Chart for Status Distribution
export const StatusPieChart = memo(({ data }) => {
  const colors = {
    open: '#ff9800',
    in_progress: '#2196f3',
    closed: '#4caf50',
    urgent: '#f44336'
  };

  const chartData = [
    { name: 'Abertos', value: data?.open || 0, fill: colors.open },
    { name: 'Em Progresso', value: data?.in_progress || 0, fill: colors.in_progress },
    { name: 'Fechados', value: data?.closed || 0, fill: colors.closed },
  ];

  return (
    <div className="chart-container">
      <h3 className="chart-title">📊 Distribuição por Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

// Bar Chart for Priority Distribution
export const PriorityBarChart = memo(({ data }) => {
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

  const chartData = (data || []).map(item => ({
    name: labels[item.priority] || item.priority,
    count: item.count,
    fill: colors[item.priority]
  }));

  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 Tickets por Prioridade</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis dataKey="name" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="count" fill="#3d6aff" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

// Simulated Time Series Data (would come from backend in real app)
export const TicketsTrendChart = memo(({ stats }) => {
  // Generate last 7 days of simulated data
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const day = date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' });
    
    data.push({
      day,
      abertos: Math.max(0, (stats?.tickets?.open || 0) - Math.floor(Math.random() * 5)),
      fechados: (stats?.tickets?.closed || 0) + Math.floor(Math.random() * 3),
    });
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">📉 Tendência de Tickets (7 dias)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorAbertos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ff9800" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ff9800" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorFechados" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis dataKey="day" stroke="#999" />
          <YAxis stroke="#999" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Legend 
            wrapperStyle={{ color: '#999', paddingTop: '1rem' }}
            formatter={(value) => value === 'abertos' ? 'Abertos' : 'Fechados'}
          />
          <Area 
            type="monotone" 
            dataKey="abertos" 
            stroke="#ff9800" 
            fillOpacity={1} 
            fill="url(#colorAbertos)" 
          />
          <Area 
            type="monotone" 
            dataKey="fechados" 
            stroke="#4caf50" 
            fillOpacity={1} 
            fill="url(#colorFechados)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
});

// Admin Performance Chart
export const AdminPerformanceChart = memo(({ admins }) => {
  const chartData = (admins || []).slice(0, 5).map(admin => ({
    name: admin.username,
    horas: parseFloat(admin.total_hours?.toFixed(1)) || 0,
  }));

  return (
    <div className="chart-container">
      <h3 className="chart-title">🏆 Performance dos Admins (Horas)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
          <XAxis type="number" stroke="#999" />
          <YAxis dataKey="name" type="category" stroke="#999" width={100} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#2a2a2a',
              border: '1px solid #3a3a3a',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="horas" fill="#3d6aff" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
});

export default {
  StatusPieChart,
  PriorityBarChart,
  TicketsTrendChart,
  AdminPerformanceChart,
};
