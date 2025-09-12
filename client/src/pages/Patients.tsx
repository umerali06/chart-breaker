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
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { patientsApi } from '../services/api';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  episodes: Array<{
    id: string;
    episodeNumber: string;
    status: string;
    startDate: string;
  }>;
  _count: {
    episodes: number;
    schedules: number;
  };
}

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getPatients({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });
      setPatients(response.data.patients);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, patient: Patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleViewPatient = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}`);
    }
    handleMenuClose();
  };

  const handleEditPatient = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}/edit`);
    }
    handleMenuClose();
  };

  const handleCreateEpisode = () => {
    if (selectedPatient) {
      navigate(`/episodes/new/${selectedPatient.id}`);
    }
    handleMenuClose();
  };

  const handleScheduleVisit = () => {
    if (selectedPatient) {
      navigate(`/schedules/new/${selectedPatient.id}`);
    }
    handleMenuClose();
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
      case 'No Episodes':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPatientStatus = (patient: Patient) => {
    if (patient._count.episodes === 0) {
      return 'No Episodes';
    }
    
    // Find the most recent active episode
    const activeEpisode = patient.episodes.find(ep => ep.status === 'ACTIVE');
    if (activeEpisode) {
      return activeEpisode.status;
    }
    
    // If no active episode, return the most recent episode status
    return patient.episodes[0]?.status || 'No Episodes';
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
          Patients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/patients/new')}
        >
          Add Patient
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
                placeholder="Search patients..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={handleStatusFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="DISCHARGED">Discharged</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
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
                    }}>Patient ID</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Name</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>DOB</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Gender</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Phone</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Episodes</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Scheduled Visits</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {patient.patientId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Typography variant="body2">
                          {patient.firstName} {patient.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(patient.dateOfBirth)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {patient.gender}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {patient.phone || '-'}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {patient._count.episodes}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {patient._count.schedules}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getPatientStatus(patient)}
                          color={getStatusColor(getPatientStatus(patient)) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, patient)}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
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

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewPatient}>View Details</MenuItem>
        <MenuItem onClick={handleEditPatient}>Edit</MenuItem>
        <MenuItem onClick={handleScheduleVisit}>Schedule Visit</MenuItem>
        <MenuItem onClick={handleCreateEpisode}>Create Episode</MenuItem>
      </Menu>
    </Box>
  );
};

export default Patients;
