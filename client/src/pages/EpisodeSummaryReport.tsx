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
  Grid,
  TextField,
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

interface Episode {
  id: string;
  episodeNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  discipline: string;
  patient: {
    firstName: string;
    lastName: string;
  };
}

const EpisodeSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    discipline: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadEpisodeSummary = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getEpisodeSummary();
      setEpisodes(response.data.episodes);
    } catch (err: any) {
      setError(err.message || 'Failed to load episode summary');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...episodes];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(episode => 
        episode.episodeNumber.toLowerCase().includes(searchLower) ||
        episode.patient?.firstName?.toLowerCase().includes(searchLower) ||
        episode.patient?.lastName?.toLowerCase().includes(searchLower) ||
        episode.discipline.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(episode => episode.status === filters.status);
    }

    // Discipline filter
    if (filters.discipline) {
      filtered = filtered.filter(episode => episode.discipline === filters.discipline);
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(episode => 
        new Date(episode.startDate) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(episode => 
        new Date(episode.startDate) <= endDate
      );
    }

    setFilteredEpisodes(filtered);
  }, [episodes, filters]);

  useEffect(() => {
    loadEpisodeSummary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [episodes, filters, applyFilters]);

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
      status: '',
      discipline: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredEpisodes.map(episode => {
      const startDate = new Date(episode.startDate);
      const endDate = episode.endDate ? new Date(episode.endDate) : new Date();
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        episodeNumber: episode.episodeNumber,
        patientName: episode.patient ? `${episode.patient.firstName} ${episode.patient.lastName}` : 'Unknown Patient',
        discipline: formatDiscipline(episode.discipline),
        status: episode.status,
        startDate: formatDate(episode.startDate),
        endDate: episode.endDate ? formatDate(episode.endDate) : 'Ongoing',
        duration: duration
      };
    });

    const columns = [
      { key: 'episodeNumber', label: 'Episode #' },
      { key: 'patientName', label: 'Patient' },
      { key: 'discipline', label: 'Discipline' },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'duration', label: 'Duration (Days)' }
    ];

    const exportOptions: ExportOptions = {
      filename: `episode-summary-${new Date().toISOString().split('T')[0]}`,
      title: 'Episode Summary Report',
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
    const exportData = filteredEpisodes.map(episode => {
      const startDate = new Date(episode.startDate);
      const endDate = episode.endDate ? new Date(episode.endDate) : new Date();
      const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        episodeNumber: episode.episodeNumber,
        patientName: episode.patient ? `${episode.patient.firstName} ${episode.patient.lastName}` : 'Unknown Patient',
        discipline: formatDiscipline(episode.discipline),
        status: episode.status,
        startDate: formatDate(episode.startDate),
        endDate: episode.endDate ? formatDate(episode.endDate) : 'Ongoing',
        duration: duration
      };
    });

    const columns = [
      { key: 'episodeNumber', label: 'Episode #' },
      { key: 'patientName', label: 'Patient' },
      { key: 'discipline', label: 'Discipline' },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start Date' },
      { key: 'endDate', label: 'End Date' },
      { key: 'duration', label: 'Duration (Days)' }
    ];

    const exportOptions: ExportOptions = {
      filename: `episode-summary-${new Date().toISOString().split('T')[0]}`,
      title: 'Episode Summary Report',
      data: exportData,
      columns
    };

    printReport(exportOptions);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'DISCHARGED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDiscipline = (discipline: string) => {
    switch (discipline) {
      case 'SN': return 'Nursing';
      case 'PT': return 'Physical Therapy';
      case 'OT': return 'Occupational Therapy';
      case 'ST': return 'Speech Therapy';
      case 'MSW': return 'Medical Social Services';
      case 'HHA': return 'Home Health Aide';
      default: return discipline;
    }
  };

  const getDisciplineStats = () => {
    const stats = filteredEpisodes.reduce((acc, episode) => {
      if (!acc[episode.discipline]) {
        acc[episode.discipline] = { total: 0, active: 0, discharged: 0, cancelled: 0 };
      }
      acc[episode.discipline].total++;
      acc[episode.discipline][episode.status.toLowerCase()]++;
      return acc;
    }, {} as Record<string, any>);
    return stats;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const disciplineStats = getDisciplineStats();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/reports')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Episode Summary Report
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
                label="Search Episodes"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Episode #, patient name, or discipline"
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="DISCHARGED">Discharged</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Discipline</InputLabel>
                <Select
                  value={filters.discipline}
                  label="Discipline"
                  onChange={(e) => handleFilterChange('discipline', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SN">Nursing</MenuItem>
                  <MenuItem value="PT">Physical Therapy</MenuItem>
                  <MenuItem value="OT">Occupational Therapy</MenuItem>
                  <MenuItem value="ST">Speech Therapy</MenuItem>
                  <MenuItem value="MSW">Medical Social Services</MenuItem>
                  <MenuItem value="HHA">Home Health Aide</MenuItem>
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

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {Object.entries(disciplineStats).map(([discipline, stats]) => (
          <Grid item xs={12} sm={6} md={3} key={discipline}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {formatDiscipline(discipline)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total: {stats.total}
                </Typography>
                <Box display="flex" gap={1} mt={1}>
                  <Chip label={`${stats.active} Active`} color="success" size="small" />
                  <Chip label={`${stats.discharged} Discharged`} color="default" size="small" />
                  <Chip label={`${stats.cancelled} Cancelled`} color="error" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Episode Details ({filteredEpisodes.length} of {episodes.length} episodes)
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
                  <TableCell>Episode #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Discipline</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Duration (Days)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEpisodes.map((episode) => {
                  const startDate = new Date(episode.startDate);
                  const endDate = episode.endDate ? new Date(episode.endDate) : new Date();
                  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <TableRow key={episode.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {episode.episodeNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {episode.patient ? `${episode.patient.firstName} ${episode.patient.lastName}` : 'Unknown Patient'}
                      </TableCell>
                      <TableCell>{formatDiscipline(episode.discipline)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={episode.status} 
                          color={getStatusColor(episode.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(episode.startDate)}</TableCell>
                      <TableCell>{episode.endDate ? formatDate(episode.endDate) : 'Ongoing'}</TableCell>
                      <TableCell>{duration}</TableCell>
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

export default EpisodeSummaryReport;
