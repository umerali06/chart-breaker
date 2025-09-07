import React, { useState, useEffect } from 'react';
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
import axios from 'axios';
import { mockApi } from '../services/mockApi';

interface Episode {
  id: string;
  episodeNumber: string;
  status: string;
  startDate: string;
  endDate?: string;
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
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchEpisodes();
  }, [page, searchTerm]);

  const fetchEpisodes = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getEpisodes({
        page,
        limit: 10,
        search: searchTerm,
      });
      setEpisodes(response.episodes);
      setTotalPages(response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load episodes');
    } finally {
      setLoading(false);
    }
  };

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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Episodes
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Episode
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
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

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Episode Number</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Disciplines</TableCell>
                  <TableCell>Visits</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {episodes.map((episode) => (
                  <TableRow key={episode.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {episode.episodeNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {episode.patient.firstName} {episode.patient.lastName}
                    </TableCell>
                    <TableCell>{formatDate(episode.startDate)}</TableCell>
                    <TableCell>{episode.endDate ? formatDate(episode.endDate) : '-'}</TableCell>
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
                    <TableCell>{episode._count.visitNotes}</TableCell>
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
