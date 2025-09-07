import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
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

const Reports: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getDashboardStats();
      setStats(response.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      title: 'Patient Census Report',
      description: 'Current patient count and demographics',
      icon: <BarChartIcon />,
      color: 'primary',
    },
    {
      title: 'Episode Summary',
      description: 'Active and completed episodes by discipline',
      icon: <TrendingUpIcon />,
      color: 'success',
    },
    {
      title: 'Visit Productivity',
      description: 'Clinician productivity and visit completion rates',
      icon: <BarChartIcon />,
      color: 'info',
    },
    {
      title: 'Billing Summary',
      description: 'Claims status and revenue by payer',
      icon: <TrendingUpIcon />,
      color: 'warning',
    },
    {
      title: 'QA Compliance',
      description: 'Quality assurance metrics and deficiency tracking',
      icon: <BarChartIcon />,
      color: 'error',
    },
    {
      title: 'OASIS Export',
      description: 'Export OASIS data for CMS submission',
      icon: <DownloadIcon />,
      color: 'secondary',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Available Reports
              </Typography>
              <Grid container spacing={2}>
                {reportTypes.map((report, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2,
                        height: '100%',
                        cursor: 'pointer',
                        '&:hover': {
                          elevation: 4,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" mb={1}>
                        <Box sx={{ color: `${report.color}.main`, mr: 1 }}>
                          {report.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {report.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {report.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        fullWidth
                      >
                        Generate
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Stats
              </Typography>
              {stats && (
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Total Patients"
                      secondary={stats.totalPatients}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Active Episodes"
                      secondary={stats.activeEpisodes}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Pending Visits"
                      secondary={stats.pendingVisits}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Pending Claims"
                      secondary={stats.pendingClaims}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="QA Reviews"
                      secondary={stats.pendingQaReviews}
                    />
                  </ListItem>
                </List>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Reports
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Patient Census - January 2024"
                    secondary="Generated 2 hours ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Billing Summary - Q4 2023"
                    secondary="Generated 1 day ago"
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <DownloadIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="OASIS Export - December 2023"
                    secondary="Generated 3 days ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
