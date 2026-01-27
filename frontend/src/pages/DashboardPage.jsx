import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  HourglassEmpty,
  Warning,
  People,
  Computer,
  AccessTime,
  TrendingUp,
  AssignmentLate
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token:', token ? 'Existe' : 'Não existe');
      
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📊 Resposta completa:', response);
      console.log('📊 Dados:', response.data);
      console.log('📊 Stats:', response.data.stats);
      
      setStats(response.data.stats);
      setError(null);
    } catch (error) {
      console.error('❌ Erro completo:', error);
      console.error('❌ Erro response:', error.response);
      console.error('❌ Erro message:', error.message);
      
      setError(error.message);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#1c1e1e' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: 'rgb(61, 106, 255)', mb: 2 }} />
          <Typography sx={{ color: '#999' }}>A carregar dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, bgcolor: '#1c1e1e', minHeight: '100vh' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Erro ao carregar dados: {error}
        </Alert>
        <Typography sx={{ color: '#999', mb: 2 }}>
          Certifica-te que o backend está a correr em http://localhost:5000
        </Typography>
        <button onClick={fetchDashboardStats} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Tentar novamente
        </button>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ p: 3, bgcolor: '#1c1e1e', minHeight: '100vh' }}>
        <Alert severity="warning">
          Nenhum dado disponível. A resposta da API está vazia.
        </Alert>
        <Typography sx={{ color: '#999', mt: 2 }}>
          Verifica a consola do browser (F12) para mais detalhes.
        </Typography>
      </Box>
    );
  }

  const mainStats = [
    { 
      title: 'Tickets Abertos', 
      value: stats.tickets?.open || 0, 
      icon: <Assignment sx={{ fontSize: 32 }} />, 
      color: '#ff9800',
      subtitle: 'Aguardando atenção'
    },
    { 
      title: 'Em Progresso', 
      value: stats.tickets?.in_progress || 0, 
      icon: <HourglassEmpty sx={{ fontSize: 32 }} />, 
      color: '#2196f3',
      subtitle: 'Sendo trabalhados'
    },
    { 
      title: 'Fechados', 
      value: stats.tickets?.closed || 0, 
      icon: <CheckCircle sx={{ fontSize: 32 }} />, 
      color: '#4caf50',
      subtitle: 'Total resolvidos'
    },
    { 
      title: 'Urgentes', 
      value: stats.tickets?.urgent || 0, 
      icon: <Warning sx={{ fontSize: 32 }} />, 
      color: '#f44336',
      subtitle: 'Requerem atenção'
    }
  ];

  const secondaryStats = [
    {
      title: 'Não Atribuídos',
      value: stats.tickets?.unassigned || 0,
      icon: <AssignmentLate sx={{ fontSize: 28 }} />,
      color: '#ff6b6b'
    },
    {
      title: 'Este Mês',
      value: stats.tickets?.this_month || 0,
      icon: <TrendingUp sx={{ fontSize: 28 }} />,
      color: '#9c27b0'
    },
    {
      title: 'Utilizadores',
      value: stats.system?.total_users || 0,
      icon: <People sx={{ fontSize: 28 }} />,
      color: '#00bcd4'
    },
    {
      title: 'Equipamentos',
      value: stats.system?.total_equipment || 0,
      icon: <Computer sx={{ fontSize: 28 }} />,
      color: '#ff5722'
    }
  ];

  return (
    <Box sx={{ p: 3, bgcolor: '#1c1e1e', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600, mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography sx={{ color: '#999', fontSize: '14px' }}>
          Visão geral do sistema - {new Date().toLocaleDateString('pt-PT', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {mainStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                bgcolor: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #3a3a3a',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${stat.color}20`,
                  borderColor: stat.color + '40',
                },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ color: '#999', fontSize: '13px', mb: 0.5, fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                    <Typography sx={{ color: '#fff', fontSize: '36px', fontWeight: 700, lineHeight: 1.2, mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: '#666', fontSize: '12px' }}>
                      {stat.subtitle}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: stat.color + '15',
                      color: stat.color,
                      p: 1.5,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {secondaryStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                bgcolor: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #3a3a3a',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  borderColor: stat.color + '40',
                },
              }}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography sx={{ color: '#999', fontSize: '12px', mb: 0.5 }}>
                      {stat.title}
                    </Typography>
                    <Typography sx={{ color: '#fff', fontSize: '24px', fontWeight: 600 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor: '#2a2a2a',
              borderRadius: '12px',
              border: '1px solid #3a3a3a',
              height: '100%',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTime sx={{ color: 'rgb(61, 106, 255)', mr: 1 }} />
                <Typography sx={{ color: '#fff', fontWeight: 600 }}>
                  Tempo Médio de Resolução
                </Typography>
              </Box>
              <Typography sx={{ color: '#fff', fontSize: '42px', fontWeight: 700 }}>
                {stats.metrics?.avg_resolution_hours || 0}h
              </Typography>
              <Typography sx={{ color: '#666', fontSize: '13px' }}>
                Últimos 30 dias
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card
            sx={{
              bgcolor: '#2a2a2a',
              borderRadius: '12px',
              border: '1px solid #3a3a3a',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                Tickets por Prioridade
              </Typography>
              <Box>
                {stats.tickets?.by_priority && stats.tickets.by_priority.length > 0 ? (
                  stats.tickets.by_priority.map((item, index) => {
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
                    const totalTickets = stats.tickets.open + stats.tickets.in_progress || 1;
                    return (
                      <Box key={index} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ color: '#999', fontSize: '13px' }}>
                            {labels[item.priority] || item.priority}
                          </Typography>
                          <Typography sx={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>
                            {item.count}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(item.count / totalTickets) * 100}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: '#1c1e1e',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: colors[item.priority],
                              borderRadius: 4,
                            },
                          }}
                        />
                      </Box>
                    );
                  })
                ) : (
                  <Typography sx={{ color: '#666', fontSize: '13px' }}>
                    Sem dados de prioridade disponíveis
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {stats.top_admins && stats.top_admins.length > 0 && (
          <Grid item xs={12}>
            <Card
              sx={{
                bgcolor: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #3a3a3a',
              }}
            >
              <CardContent>
                <Typography sx={{ color: '#fff', fontWeight: 600, mb: 2 }}>
                  Top 5 Admins Mais Ativos (Últimos 30 dias)
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#999', borderBottom: '1px solid #3a3a3a', fontSize: '13px' }}>
                          Posição
                        </TableCell>
                        <TableCell sx={{ color: '#999', borderBottom: '1px solid #3a3a3a', fontSize: '13px' }}>
                          Admin
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#999', borderBottom: '1px solid #3a3a3a', fontSize: '13px' }}>
                          Horas Trabalhadas
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.top_admins.map((admin, index) => (
                        <TableRow key={admin.id} sx={{ '&:hover': { bgcolor: '#1c1e1e' } }}>
                          <TableCell sx={{ color: '#fff', borderBottom: '1px solid #3a3a3a' }}>
                            <Box
                              sx={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                bgcolor: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgb(61, 106, 255)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '14px',
                                color: '#000',
                              }}
                            >
                              {index + 1}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#fff', borderBottom: '1px solid #3a3a3a', fontWeight: 500 }}>
                            {admin.username}
                          </TableCell>
                          <TableCell align="right" sx={{ color: 'rgb(61, 106, 255)', borderBottom: '1px solid #3a3a3a', fontWeight: 600 }}>
                            {admin.total_hours?.toFixed(1)}h
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
