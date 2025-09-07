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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { mockApi } from '../services/mockApi';

interface Schedule {
  id: string;
  visitDate: string;
  startTime: string;
  endTime: string;
  discipline: string;
  visitType: string;
  status: string;
  notes?: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  staff: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const Schedules: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSchedules();
  }, [page, searchTerm]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getSchedules({
        page,
        limit: 10,
        search: searchTerm,
      });
      setSchedules(response.schedules);
      setTotalPages(response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      case 'NO_SHOW':
        return 'warning';
      case 'RESCHEDULED':
        return 'info';
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
          Scheduling
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Schedule Visit
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
                placeholder="Search schedules..."
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
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Staff</TableCell>
                  <TableCell>Discipline</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id} hover>
                    <TableCell>{formatDate(schedule.visitDate)}</TableCell>
                    <TableCell>
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </TableCell>
                    <TableCell>
                      {schedule.patient.firstName} {schedule.patient.lastName}
                    </TableCell>
                    <TableCell>
                      {schedule.staff.firstName} {schedule.staff.lastName}
                    </TableCell>
                    <TableCell>{schedule.discipline}</TableCell>
                    <TableCell>{schedule.visitType}</TableCell>
                    <TableCell>
                      <Chip
                        label={schedule.status}
                        color={getStatusColor(schedule.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{schedule.notes || '-'}</TableCell>
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

export default Schedules;
