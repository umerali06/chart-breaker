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
  LinearProgress,
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

interface QAReview {
  id: string;
  status: string;
  comments: string;
  deficiencies: any[];
  createdAt: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
  document: {
    id: string;
    type: string;
  };
}

interface ComplianceStats {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  complianceRate: number;
}

const QAComplianceReport: React.FC = () => {
  const navigate = useNavigate();
  const [qaReviews, setQaReviews] = useState<QAReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<QAReview[]>([]);
  const [statistics, setStatistics] = useState<ComplianceStats | null>(null);
  const [deficiencyStats, setDeficiencyStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    documentType: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadQAComplianceData = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getQACompliance();
      setQaReviews(response.data.qaReviews);
      setStatistics(response.data.statistics);
      setDeficiencyStats(response.data.deficiencyStats);
    } catch (err: any) {
      setError(err.message || 'Failed to load QA compliance data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...qaReviews];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(review => 
        review.reviewer?.firstName?.toLowerCase().includes(searchLower) ||
        review.reviewer?.lastName?.toLowerCase().includes(searchLower) ||
        review.comments.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(review => review.status === filters.status);
    }

    // Document type filter
    if (filters.documentType) {
      filtered = filtered.filter(review => review.document?.type === filters.documentType);
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(review => 
        new Date(review.createdAt) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(review => 
        new Date(review.createdAt) <= endDate
      );
    }

    setFilteredReviews(filtered);
  }, [qaReviews, filters]);

  useEffect(() => {
    loadQAComplianceData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [qaReviews, filters, applyFilters]);

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
      documentType: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDocumentType = (type: string) => {
    switch (type) {
      case 'OASIS': return 'OASIS Assessment';
      case 'VISIT_NOTE': return 'Visit Note';
      case 'CARE_PLAN': return 'Care Plan';
      case 'ORDER': return 'Order';
      default: return type;
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredReviews.map(review => ({
      reviewId: review.id,
      reviewerName: review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Unknown',
      documentType: formatDocumentType(review.document?.type || 'Unknown'),
      status: review.status,
      deficiencies: review.deficiencies?.length || 0,
      comments: review.comments,
      createdAt: formatDate(review.createdAt)
    }));

    const columns = [
      { key: 'reviewId', label: 'Review ID' },
      { key: 'reviewerName', label: 'Reviewer' },
      { key: 'documentType', label: 'Document Type' },
      { key: 'status', label: 'Status' },
      { key: 'deficiencies', label: 'Deficiencies' },
      { key: 'comments', label: 'Comments' },
      { key: 'createdAt', label: 'Created Date' }
    ];

    const exportOptions: ExportOptions = {
      filename: `qa-compliance-${new Date().toISOString().split('T')[0]}`,
      title: 'QA Compliance Report',
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
    const exportData = filteredReviews.map(review => ({
      reviewId: review.id,
      reviewerName: review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Unknown',
      documentType: formatDocumentType(review.document?.type || 'Unknown'),
      status: review.status,
      deficiencies: review.deficiencies?.length || 0,
      comments: review.comments,
      createdAt: formatDate(review.createdAt)
    }));

    const columns = [
      { key: 'reviewId', label: 'Review ID' },
      { key: 'reviewerName', label: 'Reviewer' },
      { key: 'documentType', label: 'Document Type' },
      { key: 'status', label: 'Status' },
      { key: 'deficiencies', label: 'Deficiencies' },
      { key: 'comments', label: 'Comments' },
      { key: 'createdAt', label: 'Created Date' }
    ];

    const exportOptions: ExportOptions = {
      filename: `qa-compliance-${new Date().toISOString().split('T')[0]}`,
      title: 'QA Compliance Report',
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

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/reports')} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          QA Compliance Report
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {statistics && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total Reviews
                </Typography>
                <Typography variant="h4" color="primary">
                  {statistics.totalReviews}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.approvedReviews}
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
                  {statistics.pendingReviews}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Compliance Rate
                </Typography>
                <Typography variant="h4" color="info.main">
                  {statistics.complianceRate}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={statistics.complianceRate} 
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Deficiency Statistics */}
      {Object.keys(deficiencyStats).length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Deficiency Statistics
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(deficiencyStats).map(([category, count]) => (
                <Grid item xs={12} sm={6} md={3} key={category}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">{category}</Typography>
                    <Chip label={count} color="error" size="small" />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
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
                label="Search Reviews"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Reviewer name or comments"
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
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={filters.documentType}
                  label="Document Type"
                  onChange={(e) => handleFilterChange('documentType', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="OASIS">OASIS Assessment</MenuItem>
                  <MenuItem value="VISIT_NOTE">Visit Note</MenuItem>
                  <MenuItem value="CARE_PLAN">Care Plan</MenuItem>
                  <MenuItem value="ORDER">Order</MenuItem>
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
              QA Reviews ({filteredReviews.length} reviews)
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
                  <TableCell>Review ID</TableCell>
                  <TableCell>Reviewer</TableCell>
                  <TableCell>Document Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deficiencies</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {review.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {review.reviewer ? `${review.reviewer.firstName} ${review.reviewer.lastName}` : 'Unknown'}
                    </TableCell>
                    <TableCell>{formatDocumentType(review.document?.type || 'Unknown')}</TableCell>
                    <TableCell>
                      <Chip 
                        label={review.status} 
                        color={getStatusColor(review.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={review.deficiencies?.length || 0} 
                        color={review.deficiencies?.length > 0 ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {review.comments || 'No comments'}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDate(review.createdAt)}</TableCell>
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

export default QAComplianceReport;

