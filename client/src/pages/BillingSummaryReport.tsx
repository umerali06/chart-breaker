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

interface Claim {
  id: string;
  claimNumber: string;
  status: string;
  amount: number;
  submissionDate: string;
  createdAt: string;
  patient: {
    firstName: string;
    lastName: string;
  };
  payer: {
    name: string;
    category: string;
  };
  episode: {
    episodeNumber: string;
  };
}

const BillingSummaryReport: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    payerCategory: '',
    searchTerm: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadBillingSummary = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getBillingSummary();
      setClaims(response.data.claims);
    } catch (err: any) {
      setError(err.message || 'Failed to load billing summary');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...claims];

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(claim => 
        claim.claimNumber.toLowerCase().includes(searchLower) ||
        claim.patient.firstName.toLowerCase().includes(searchLower) ||
        claim.patient.lastName.toLowerCase().includes(searchLower) ||
        claim.payer.name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(claim => claim.status === filters.status);
    }

    // Payer category filter
    if (filters.payerCategory) {
      filtered = filtered.filter(claim => claim.payer.category === filters.payerCategory);
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      filtered = filtered.filter(claim => 
        new Date(claim.createdAt) >= startDate
      );
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      filtered = filtered.filter(claim => 
        new Date(claim.createdAt) <= endDate
      );
    }

    setFilteredClaims(filtered);
  }, [claims, filters]);

  useEffect(() => {
    loadBillingSummary();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [claims, filters, applyFilters]);

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
      payerCategory: '',
      searchTerm: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'info';
      case 'ACCEPTED': return 'success';
      case 'PAID': return 'success';
      case 'DENIED': return 'error';
      case 'REJECTED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPayerCategory = (category: string) => {
    switch (category) {
      case 'MEDICARE': return 'Medicare';
      case 'MEDICAID': return 'Medicaid';
      case 'COMMERCIAL': return 'Commercial';
      case 'PRIVATE_PAY': return 'Private Pay';
      case 'UNKNOWN': return 'Unknown';
      default: return category;
    }
  };

  const getSummaryStats = () => {
    const totalAmount = filteredClaims.reduce((sum, claim) => sum + claim.amount, 0);
    const statusCounts = filteredClaims.reduce((acc, claim) => {
      acc[claim.status] = (acc[claim.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { totalAmount, statusCounts };
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = filteredClaims.map(claim => ({
      claimNumber: claim.claimNumber,
        patientName: claim.patient ? `${claim.patient.firstName} ${claim.patient.lastName}` : 'Unknown Patient',
        episodeNumber: claim.episode?.episodeNumber || 'N/A',
        payerName: claim.payer?.name || 'Unknown Payer',
        payerCategory: formatPayerCategory(claim.payer?.category || 'UNKNOWN'),
      status: claim.status,
      amount: formatCurrency(claim.amount),
      submissionDate: claim.submissionDate ? formatDate(claim.submissionDate) : 'Not submitted',
      createdAt: formatDate(claim.createdAt)
    }));

    const columns = [
      { key: 'claimNumber', label: 'Claim #' },
      { key: 'patientName', label: 'Patient' },
      { key: 'episodeNumber', label: 'Episode #' },
      { key: 'payerName', label: 'Payer' },
      { key: 'payerCategory', label: 'Payer Category' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount' },
      { key: 'submissionDate', label: 'Submission Date' },
      { key: 'createdAt', label: 'Created Date' }
    ];

    const exportOptions: ExportOptions = {
      filename: `billing-summary-${new Date().toISOString().split('T')[0]}`,
      title: 'Billing Summary Report',
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
    const exportData = filteredClaims.map(claim => ({
      claimNumber: claim.claimNumber,
        patientName: claim.patient ? `${claim.patient.firstName} ${claim.patient.lastName}` : 'Unknown Patient',
        episodeNumber: claim.episode?.episodeNumber || 'N/A',
        payerName: claim.payer?.name || 'Unknown Payer',
        payerCategory: formatPayerCategory(claim.payer?.category || 'UNKNOWN'),
      status: claim.status,
      amount: formatCurrency(claim.amount),
      submissionDate: claim.submissionDate ? formatDate(claim.submissionDate) : 'Not submitted',
      createdAt: formatDate(claim.createdAt)
    }));

    const columns = [
      { key: 'claimNumber', label: 'Claim #' },
      { key: 'patientName', label: 'Patient' },
      { key: 'episodeNumber', label: 'Episode #' },
      { key: 'payerName', label: 'Payer' },
      { key: 'payerCategory', label: 'Payer Category' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount' },
      { key: 'submissionDate', label: 'Submission Date' },
      { key: 'createdAt', label: 'Created Date' }
    ];

    const exportOptions: ExportOptions = {
      filename: `billing-summary-${new Date().toISOString().split('T')[0]}`,
      title: 'Billing Summary Report',
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
          Billing Summary Report
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
                Total Claims
              </Typography>
              <Typography variant="h4" color="primary">
                {filteredClaims.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Total Amount
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(summaryStats.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Submitted
              </Typography>
              <Typography variant="h4" color="info.main">
                {summaryStats.statusCounts.SUBMITTED || 0}
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
                {summaryStats.statusCounts.PENDING || 0}
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search Claims"
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                placeholder="Claim #, patient name, or payer"
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
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="SUBMITTED">Submitted</MenuItem>
                  <MenuItem value="ACCEPTED">Accepted</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="PAID">Paid</MenuItem>
                  <MenuItem value="DENIED">Denied</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Payer Category</InputLabel>
                <Select
                  value={filters.payerCategory}
                  label="Payer Category"
                  onChange={(e) => handleFilterChange('payerCategory', e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="MEDICARE">Medicare</MenuItem>
                  <MenuItem value="MEDICAID">Medicaid</MenuItem>
                  <MenuItem value="COMMERCIAL">Commercial</MenuItem>
                  <MenuItem value="PRIVATE_PAY">Private Pay</MenuItem>
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
              Claims Details ({filteredClaims.length} of {claims.length} claims)
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
                  <TableCell>Claim #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Episode #</TableCell>
                  <TableCell>Payer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Created Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClaims.map((claim) => (
                  <TableRow key={claim.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {claim.claimNumber || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {claim.patient ? `${claim.patient.firstName} ${claim.patient.lastName}` : 'Unknown Patient'}
                    </TableCell>
                    <TableCell>{claim.episode?.episodeNumber || 'N/A'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {claim.payer?.name || 'Unknown Payer'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatPayerCategory(claim.payer?.category || 'UNKNOWN')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={claim.status} 
                        color={getStatusColor(claim.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(claim.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {claim.submissionDate ? formatDate(claim.submissionDate) : 'Not submitted'}
                    </TableCell>
                    <TableCell>{formatDate(claim.createdAt)}</TableCell>
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

export default BillingSummaryReport;
