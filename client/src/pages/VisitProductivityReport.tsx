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

interface VisitNote {
  id: string;
  visitDate: string;
  visitDurationMinutes: number;
  patient: {
    firstName: string;
    lastName: string;
  };
}

interface ProductivityData {
  clinician: {
    id: string;
    firstName: string;
    lastName: string;
    staffProfile: {
      discipline: string;
      employeeId: string;
    };
  };
  totalVisits: number;
  visits: VisitNote[];
  averageVisitDuration: number;
}

const VisitProductivityReport: React.FC = () => {
  const navigate = useNavigate();
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [filteredData, setFilteredData] = useState<ProductivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    discipline: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadProductivityData = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getProductivityReport();
      setProductivityData(response.data.productivity);
    } catch (err: any) {
      setError(err.message || 'Failed to load productivity data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...productivityData];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.clinician.firstName.toLowerCase().includes(searchLower) ||
        item.clinician.lastName.toLowerCase().includes(searchLower) ||
        item.clinician.staffProfile?.employeeId?.toLowerCase().includes(searchLower)
      );
    }

    // Discipline filter
    if (filters.discipline) {
      filtered = filtered.filter(item => 
        item.clinician.staffProfile?.discipline === filters.discipline
      );
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(item => 
        item.visits.some(visit => new Date(visit.visitDate) >= startDate)
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(item => 
        item.visits.some(visit => new Date(visit.visitDate) <= endDate)
      );
    }

    setFilteredData(filtered);
  }, [productivityData, filters]);

  useEffect(() => {
    loadProductivityData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [productivityData, filters, applyFilters]);

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
      discipline: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };


  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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

  const getSummaryStats = () => {
    const totalVisits = filteredData.reduce((sum, item) => sum + item.totalVisits, 0);
    const totalClinicians = filteredData.length;
    const averageVisitsPerClinician = totalClinicians > 0 ? Math.round(totalVisits / totalClinicians) : 0;
    const totalDuration = filteredData.reduce((sum, item) => 
      sum + item.visits.reduce((visitSum, visit) => visitSum + (visit.visitDurationMinutes || 0), 0), 0
    );
    const averageDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

    return {
      totalVisits,
      totalClinicians,
      averageVisitsPerClinician,
      averageDuration
    };
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredData.map(item => ({
      clinicianName: `${item.clinician.firstName} ${item.clinician.lastName}`,
      employeeId: item.clinician.staffProfile?.employeeId || 'N/A',
      discipline: formatDiscipline(item.clinician.staffProfile?.discipline || 'Unknown'),
      totalVisits: item.totalVisits,
      averageDuration: formatDuration(item.averageVisitDuration),
      totalDuration: formatDuration(item.visits.reduce((sum, visit) => sum + (visit.visitDurationMinutes || 0), 0))
    }));

    const columns = [
      { key: 'clinicianName', label: 'Clinician Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'discipline', label: 'Discipline' },
      { key: 'totalVisits', label: 'Total Visits' },
      { key: 'averageDuration', label: 'Avg Duration' },
      { key: 'totalDuration', label: 'Total Duration' }
    ];

    const exportOptions: ExportOptions = {
      filename: `visit-productivity-${new Date().toISOString().split('T')[0]}`,
      title: 'Visit Productivity Report',
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
    const exportData = filteredData.map(item => ({
      clinicianName: `${item.clinician.firstName} ${item.clinician.lastName}`,
      employeeId: item.clinician.staffProfile?.employeeId || 'N/A',
      discipline: formatDiscipline(item.clinician.staffProfile?.discipline || 'Unknown'),
      totalVisits: item.totalVisits,
      averageDuration: formatDuration(item.averageVisitDuration),
      totalDuration: formatDuration(item.visits.reduce((sum, visit) => sum + (visit.visitDurationMinutes || 0), 0))
    }));

    const columns = [
      { key: 'clinicianName', label: 'Clinician Name' },
      { key: 'employeeId', label: 'Employee ID' },
      { key: 'discipline', label: 'Discipline' },
      { key: 'totalVisits', label: 'Total Visits' },
      { key: 'averageDuration', label: 'Avg Duration' },
      { key: 'totalDuration', label: 'Total Duration' }
    ];

    const exportOptions: ExportOptions = {
      filename: `visit-productivity-${new Date().toISOString().split('T')[0]}`,
      title: 'Visit Productivity Report',
      data: exportData,
      columns
    };

    printReport(exportOptions);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const summaryStats = getSummaryStats();

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/reports')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Visit Productivity Report
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total Visits
              </Typography>
              <Typography variant="h4" color="primary">
                {summaryStats.totalVisits}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total Clinicians
              </Typography>
              <Typography variant="h4" color="info.main">
                {summaryStats.totalClinicians}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Avg Visits/Clinician
              </Typography>
              <Typography variant="h4" color="success.main">
                {summaryStats.averageVisitsPerClinician}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Avg Duration
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatDuration(summaryStats.averageDuration)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search Clinicians"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Name or employee ID"
              />
            </Grid>
            <Grid item xs={12} md={3}>
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

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Clinician Productivity ({filteredData.length} clinicians)
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
                  <TableCell>Clinician</TableCell>
                  <TableCell>Employee ID</TableCell>
                  <TableCell>Discipline</TableCell>
                  <TableCell>Total Visits</TableCell>
                  <TableCell>Avg Duration</TableCell>
                  <TableCell>Total Duration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.clinician.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.clinician.firstName} {item.clinician.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.clinician.staffProfile?.employeeId || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={formatDiscipline(item.clinician.staffProfile?.discipline || 'Unknown')}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {item.totalVisits}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDuration(item.averageVisitDuration)}</TableCell>
                    <TableCell>
                      {formatDuration(item.visits.reduce((sum, visit) => sum + (visit.visitDurationMinutes || 0), 0))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VisitProductivityReport;

