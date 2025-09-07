import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { mockApi } from '../services/mockApi';

interface DashboardStats {
  totalPatients: number;
  activeEpisodes: number;
  pendingVisits: number;
  pendingClaims: number;
  pendingQaReviews: number;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getDashboardStats();
      setStats(response.stats);
      
      // Mock recent activity data - in real app, this would come from API
      setRecentActivity([
        {
          id: '1',
          type: 'patient',
          description: 'New patient John Doe admitted',
          timestamp: '2 hours ago',
        },
        {
          id: '2',
          type: 'visit',
          description: 'Visit completed for Jane Smith',
          timestamp: '3 hours ago',
        },
        {
          id: '3',
          type: 'assessment',
          description: 'OASIS assessment signed',
          timestamp: '4 hours ago',
        },
        {
          id: '4',
          type: 'claim',
          description: 'Claim submitted to Medicare',
          timestamp: '5 hours ago',
        },
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
    },
    {
      title: 'Active Episodes',
      value: stats?.activeEpisodes || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
    },
    {
      title: 'Pending Visits',
      value: stats?.pendingVisits || 0,
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: 'warning.main',
    },
    {
      title: 'Pending Claims',
      value: stats?.pendingClaims || 0,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
    },
    {
      title: 'QA Reviews',
      value: stats?.pendingQaReviews || 0,
      icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />,
      color: 'error.main',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: card.color }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.timestamp}
                    />
                    <Chip
                      label={activity.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Add New Patient
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Schedule Visit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                  sx={{ mb: 1 }}
                >
                  Create Assessment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  fullWidth
                >
                  Generate Report
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
