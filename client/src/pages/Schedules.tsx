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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Person as PersonIcon } from '@mui/icons-material';
import { schedulesApi, patientsApi } from '../services/api';

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

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

const Schedules: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await schedulesApi.getSchedules({
        page,
        limit: 10,
        search: searchTerm,
      });
      setSchedules(response.data.schedules);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load schedules');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

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

  const handleScheduleVisitClick = async () => {
    try {
      setPatientsLoading(true);
      setShowPatientDialog(true);
      
      // Fetch patients for selection
      const response = await patientsApi.getPatients({ page: 1, limit: 100 });
      setPatients(response.data.patients);
    } catch (err: any) {
      setError('Failed to load patients for scheduling');
      console.error('Error loading patients:', err);
    } finally {
      setPatientsLoading(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setShowPatientDialog(false);
    navigate(`/schedules/new/${patient.id}`);
  };

  const handleClosePatientDialog = () => {
    setShowPatientDialog(false);
    setPatients([]);
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
          Scheduling
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleScheduleVisitClick}
        >
          Schedule Visit
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
                placeholder="Search schedules..."
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
                  minWidth: 900,
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
                minWidth: 900,
                tableLayout: 'auto',
                width: 'max-content'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Time</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Patient</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Staff</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Discipline</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Type</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatDate(schedule.visitDate)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {schedule.patient.firstName} {schedule.patient.lastName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {schedule.staff.firstName} {schedule.staff.lastName}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {schedule.discipline}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {schedule.visitType}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={schedule.status}
                          color={getStatusColor(schedule.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ 
                        whiteSpace: 'nowrap',
                        maxWidth: 200,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {schedule.notes || '-'}
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

      {/* Patient Selection Dialog */}
      <Dialog 
        open={showPatientDialog} 
        onClose={handleClosePatientDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1 }} />
            Select Patient for Scheduling
          </Box>
        </DialogTitle>
        <DialogContent>
          {patientsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {patients.map((patient, index) => (
                <React.Fragment key={patient.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handlePatientSelect(patient)}>
                      <ListItemText
                        primary={`${patient.firstName} ${patient.lastName}`}
                        secondary={`Patient ID: ${patient.patientId}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < patients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {patients.length === 0 && !patientsLoading && (
                <ListItem>
                  <ListItemText 
                    primary="No patients found" 
                    secondary="No patients available for scheduling"
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatientDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Schedules;
