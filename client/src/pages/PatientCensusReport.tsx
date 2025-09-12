import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { reportsApi } from '../services/api';
import { exportToCSV, exportToExcel, exportToPDF, printReport, ExportOptions } from '../utils/exportUtils';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  episodes: Array<{
    id: string;
    status: string;
    startDate: string;
    endDate: string;
  }>;
}

const PatientCensusReport: React.FC = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    gender: '',
    hasActiveEpisodes: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadPatientCensus = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getPatientCensus();
      setPatients(response.data.patients);
    } catch (err: any) {
      setError(err.message || 'Failed to load patient census');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...patients];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower) ||
        patient.email.toLowerCase().includes(searchLower) ||
        patient.phone.includes(searchLower)
      );
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    // Active episodes filter
    if (filters.hasActiveEpisodes === 'yes') {
      filtered = filtered.filter(patient => 
        patient.episodes.some(ep => ep.status === 'ACTIVE')
      );
    } else if (filters.hasActiveEpisodes === 'no') {
      filtered = filtered.filter(patient => 
        !patient.episodes.some(ep => ep.status === 'ACTIVE')
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(patient => 
        new Date(patient.createdAt) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(patient => 
        new Date(patient.createdAt) <= endDate
      );
    }

    setFilteredPatients(filtered);
  }, [patients, filters]);

  useEffect(() => {
    loadPatientCensus();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, filters, applyFilters]);

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateRangeChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      gender: '',
      hasActiveEpisodes: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredPatients.map(patient => {
      const activeEpisodes = patient.episodes.filter(ep => ep.status === 'ACTIVE').length;
      const totalEpisodes = patient.episodes.length;
      
      return {
        patientName: `${patient.firstName} ${patient.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        gender: formatGender(patient.gender),
        phone: patient.phone,
        email: patient.email,
        activeEpisodes,
        totalEpisodes,
        admissionDate: formatDate(patient.createdAt)
      };
    });

    const columns = [
      { key: 'patientName', label: 'Patient Name' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'activeEpisodes', label: 'Active Episodes' },
      { key: 'totalEpisodes', label: 'Total Episodes' },
      { key: 'admissionDate', label: 'Admission Date' }
    ];

    const exportOptions: ExportOptions = {
      filename: `patient-census-${new Date().toISOString().split('T')[0]}`,
      title: 'Patient Census Report',
      data: exportData,
      columns
    };

    switch (format) {
      case 'csv':
        exportToCSV(exportOptions);
        break;
      case 'excel':
        exportToExcel(exportOptions);
        break;
      case 'pdf':
        exportToPDF(exportOptions);
        break;
    }
  };

  const handlePrint = () => {
    const exportData = filteredPatients.map(patient => {
      const activeEpisodes = patient.episodes.filter(ep => ep.status === 'ACTIVE').length;
      const totalEpisodes = patient.episodes.length;
      
      return {
        patientName: `${patient.firstName} ${patient.lastName}`,
        age: calculateAge(patient.dateOfBirth),
        gender: formatGender(patient.gender),
        phone: patient.phone,
        email: patient.email,
        activeEpisodes,
        totalEpisodes,
        admissionDate: formatDate(patient.createdAt)
      };
    });

    const columns = [
      { key: 'patientName', label: 'Patient Name' },
      { key: 'age', label: 'Age' },
      { key: 'gender', label: 'Gender' },
      { key: 'phone', label: 'Phone' },
      { key: 'email', label: 'Email' },
      { key: 'activeEpisodes', label: 'Active Episodes' },
      { key: 'totalEpisodes', label: 'Total Episodes' },
      { key: 'admissionDate', label: 'Admission Date' }
    ];

    const exportOptions: ExportOptions = {
      filename: `patient-census-${new Date().toISOString().split('T')[0]}`,
      title: 'Patient Census Report',
      data: exportData,
      columns
    };

    printReport(exportOptions);
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatGender = (gender: string) => {
    switch (gender) {
      case 'M': return 'Male';
      case 'F': return 'Female';
      case 'O': return 'Other';
      default: return gender;
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
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/reports')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Patient Census Report
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <FilterListIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Filters
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Patients"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Name, email, or phone"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender"
                  onChange={(e) => handleFilterChange('gender', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="M">Male</MenuItem>
                  <MenuItem value="F">Female</MenuItem>
                  <MenuItem value="O">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Active Episodes</InputLabel>
                <Select
                  value={filters.hasActiveEpisodes}
                  label="Active Episodes"
                  onChange={(e) => handleFilterChange('hasActiveEpisodes', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="yes">Has Active</MenuItem>
                  <MenuItem value="no">No Active</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                fullWidth
                sx={{ height: '56px' }}
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Patient Census ({filteredPatients.length} of {patients.length} patients)
            </Typography>
            <Box>
              <Tooltip title="Download CSV">
                <IconButton onClick={() => handleExport('csv')}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download Excel">
                <IconButton onClick={() => handleExport('excel')}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Download PDF">
                <IconButton onClick={() => handleExport('pdf')}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Print Report">
                <IconButton onClick={handlePrint}>
                  <PrintIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient Name</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Active Episodes</TableCell>
                  <TableCell>Total Episodes</TableCell>
                  <TableCell>Admission Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.map((patient) => {
                  const activeEpisodes = patient.episodes.filter(ep => ep.status === 'ACTIVE').length;
                  const totalEpisodes = patient.episodes.length;
                  
                  return (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {patient.firstName} {patient.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>{calculateAge(patient.dateOfBirth)}</TableCell>
                      <TableCell>{formatGender(patient.gender)}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{patient.email}</TableCell>
                      <TableCell>
                        <Chip 
                          label={activeEpisodes} 
                          color={activeEpisodes > 0 ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{totalEpisodes}</TableCell>
                      <TableCell>{formatDate(patient.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientCensusReport;
