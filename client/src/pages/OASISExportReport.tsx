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

interface OASISAssessment {
  id: string;
  assessmentType: string;
  assessmentDate: string;
  signedAt: string;
  isSigned: boolean;
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    ssn: string;
  };
  episode: {
    episodeNumber: string;
    startDate: string;
    endDate: string;
  };
}

const OASISExportReport: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<OASISAssessment[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<OASISAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    assessmentType: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadOASISData = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getOASISExport();
      setAssessments(response.data.assessments);
    } catch (err: any) {
      setError(err.message || 'Failed to load OASIS data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...assessments];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(assessment => 
        assessment.patient?.firstName?.toLowerCase().includes(searchLower) ||
        assessment.patient?.lastName?.toLowerCase().includes(searchLower) ||
        assessment.episode?.episodeNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Assessment type filter
    if (filters.assessmentType) {
      filtered = filtered.filter(assessment => assessment.assessmentType === filters.assessmentType);
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(assessment => 
        new Date(assessment.assessmentDate) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(assessment => 
        new Date(assessment.assessmentDate) <= endDate
      );
    }

    setFilteredAssessments(filtered);
  }, [assessments, filters]);

  useEffect(() => {
    loadOASISData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assessments, filters, applyFilters]);

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
      assessmentType: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatAssessmentType = (type: string) => {
    switch (type) {
      case 'START_OF_CARE': return 'Start of Care';
      case 'RESUMPTION_OF_CARE': return 'Resumption of Care';
      case 'RECERTIFICATION': return 'Recertification';
      case 'OTHER_FOLLOW_UP': return 'Other Follow-up';
      case 'DISCHARGE': return 'Discharge';
      default: return type;
    }
  };

  const getSummaryStats = () => {
    const totalAssessments = filteredAssessments.length;
    const signedAssessments = filteredAssessments.filter(a => a.isSigned).length;
    const pendingAssessments = totalAssessments - signedAssessments;
    const completionRate = totalAssessments > 0 ? Math.round((signedAssessments / totalAssessments) * 100) : 0;

    return {
      totalAssessments,
      signedAssessments,
      pendingAssessments,
      completionRate
    };
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredAssessments.map(assessment => ({
      assessmentId: assessment.id,
      patientName: `${assessment.patient?.firstName || ''} ${assessment.patient?.lastName || ''}`,
      patientDOB: assessment.patient?.dateOfBirth ? formatDate(assessment.patient.dateOfBirth) : 'N/A',
      patientSSN: assessment.patient?.ssn || 'N/A',
      episodeNumber: assessment.episode?.episodeNumber || 'N/A',
      assessmentType: formatAssessmentType(assessment.assessmentType),
      assessmentDate: formatDate(assessment.assessmentDate),
      signedDate: assessment.signedAt ? formatDate(assessment.signedAt) : 'Not Signed',
      isSigned: assessment.isSigned ? 'Yes' : 'No'
    }));

    const columns = [
      { key: 'assessmentId', label: 'Assessment ID' },
      { key: 'patientName', label: 'Patient Name' },
      { key: 'patientDOB', label: 'Patient DOB' },
      { key: 'patientSSN', label: 'Patient SSN' },
      { key: 'episodeNumber', label: 'Episode Number' },
      { key: 'assessmentType', label: 'Assessment Type' },
      { key: 'assessmentDate', label: 'Assessment Date' },
      { key: 'signedDate', label: 'Signed Date' },
      { key: 'isSigned', label: 'Is Signed' }
    ];

    const exportOptions: ExportOptions = {
      filename: `oasis-export-${new Date().toISOString().split('T')[0]}`,
      title: 'OASIS Export Report',
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
    const exportData = filteredAssessments.map(assessment => ({
      assessmentId: assessment.id,
      patientName: `${assessment.patient?.firstName || ''} ${assessment.patient?.lastName || ''}`,
      patientDOB: assessment.patient?.dateOfBirth ? formatDate(assessment.patient.dateOfBirth) : 'N/A',
      patientSSN: assessment.patient?.ssn || 'N/A',
      episodeNumber: assessment.episode?.episodeNumber || 'N/A',
      assessmentType: formatAssessmentType(assessment.assessmentType),
      assessmentDate: formatDate(assessment.assessmentDate),
      signedDate: assessment.signedAt ? formatDate(assessment.signedAt) : 'Not Signed',
      isSigned: assessment.isSigned ? 'Yes' : 'No'
    }));

    const columns = [
      { key: 'assessmentId', label: 'Assessment ID' },
      { key: 'patientName', label: 'Patient Name' },
      { key: 'patientDOB', label: 'Patient DOB' },
      { key: 'patientSSN', label: 'Patient SSN' },
      { key: 'episodeNumber', label: 'Episode Number' },
      { key: 'assessmentType', label: 'Assessment Type' },
      { key: 'assessmentDate', label: 'Assessment Date' },
      { key: 'signedDate', label: 'Signed Date' },
      { key: 'isSigned', label: 'Is Signed' }
    ];

    const exportOptions: ExportOptions = {
      filename: `oasis-export-${new Date().toISOString().split('T')[0]}`,
      title: 'OASIS Export Report',
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
          OASIS Export Report
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
                Total Assessments
              </Typography>
              <Typography variant="h4" color="primary">
                {summaryStats.totalAssessments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Signed
              </Typography>
              <Typography variant="h4" color="success.main">
                {summaryStats.signedAssessments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {summaryStats.pendingAssessments}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Completion Rate
              </Typography>
              <Typography variant="h4" color="info.main">
                {summaryStats.completionRate}%
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
                label="Search Assessments"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Patient name or episode number"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Assessment Type</InputLabel>
                <Select
                  value={filters.assessmentType}
                  label="Assessment Type"
                  onChange={(e) => handleFilterChange('assessmentType', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="START_OF_CARE">Start of Care</MenuItem>
                  <MenuItem value="RESUMPTION_OF_CARE">Resumption of Care</MenuItem>
                  <MenuItem value="RECERTIFICATION">Recertification</MenuItem>
                  <MenuItem value="OTHER_FOLLOW_UP">Other Follow-up</MenuItem>
                  <MenuItem value="DISCHARGE">Discharge</MenuItem>
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
              OASIS Assessments ({filteredAssessments.length} assessments)
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
                  <TableCell>Assessment ID</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Episode</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Assessment Date</TableCell>
                  <TableCell>Signed Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssessments.map((assessment) => (
                  <TableRow key={assessment.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {assessment.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {assessment.patient?.firstName} {assessment.patient?.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        DOB: {assessment.patient?.dateOfBirth ? formatDate(assessment.patient.dateOfBirth) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {assessment.episode?.episodeNumber || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={formatAssessmentType(assessment.assessmentType)}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(assessment.assessmentDate)}</TableCell>
                    <TableCell>
                      {assessment.signedAt ? formatDate(assessment.signedAt) : 'Not Signed'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={assessment.isSigned ? 'Signed' : 'Pending'} 
                        color={assessment.isSigned ? 'success' : 'warning'}
                        size="small"
                      />
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

export default OASISExportReport;
