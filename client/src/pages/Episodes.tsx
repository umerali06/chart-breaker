import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { episodesApi } from '../services/api';

interface Episode {
  id: string;
  episodeNumber: string;
  status: string;
  startDate: string;
  endDate: string | null;
  disciplines: string[];
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    visitNotes: number;
    schedules: number;
  };
}

const Episodes: React.FC = () => {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchEpisodes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await episodesApi.getEpisodes({
        page,
        limit: 10,
        search: searchTerm,
      });
      setEpisodes(response.data.episodes);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchEpisodes();
  }, [fetchEpisodes]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DISCHARGED':
        return 'default';
      case 'SUSPENDED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      overflow: 'hidden',
      minWidth: 0,
      boxSizing: 'border-box'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Episodes
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients')}
        >
          New Episode
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ 
        width: '100%', 
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <CardContent sx={{ 
          width: '100%', 
          overflow: 'hidden',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search episodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>

          <Box sx={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            boxSizing: 'border-box',
            minWidth: 0
          }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto',
                overflowY: 'visible',
                display: 'block',
                maxHeight: 'none',
                minWidth: 0,
                '& .MuiTable-root': {
                  minWidth: 800,
                  width: 'max-content'
                },
                '&::-webkit-scrollbar': {
                  height: '8px',
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              <Table sx={{ 
                minWidth: 800,
                tableLayout: 'auto',
                width: 'max-content'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Episode Number</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Patient</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Start Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>End Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Disciplines</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Scheduled Visits</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {episodes.map((episode) => (
                    <TableRow key={episode.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {episode.episodeNumber}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {episode.patient.firstName} {episode.patient.lastName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(episode.startDate)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {episode.endDate ? formatDate(episode.endDate) : '-'}
                      </TableCell>
                      <TableCell>
                        {episode.disciplines.map((discipline) => (
                          <Chip
                            key={discipline}
                            label={discipline}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {episode._count.schedules}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={episode.status}
                          color={getStatusColor(episode.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Episodes;
