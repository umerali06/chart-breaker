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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
  Snackbar,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { billingApi } from '../services/api';

interface Claim {
  id: string;
  claimNumber?: string;
  claimType: string;
  submissionDate?: string;
  claimAmount?: number;
  status: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  payer: {
    id: string;
    payerName: string;
  };
}

const Billing: React.FC = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const response = await billingApi.getClaims({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });
      setClaims(response.data.claims);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load claims');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SUBMITTED':
        return 'info';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PAID':
        return 'success';
      case 'DENIED':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleNewClaimClick = () => {
    navigate('/billing/new');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, claim: Claim) => {
    setAnchorEl(event.currentTarget);
    setSelectedClaim(claim);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClaim(null);
  };

  const handleViewClaim = () => {
    if (selectedClaim) {
      navigate(`/billing/claims/${selectedClaim.id}`);
    }
    handleMenuClose();
  };

  const handleEditClaim = () => {
    if (selectedClaim) {
      navigate(`/billing/claims/${selectedClaim.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteClaim = async () => {
    if (selectedClaim) {
      try {
        await billingApi.deleteClaim(selectedClaim.id);
        setSuccessMessage('Claim deleted successfully!');
        setShowSuccessToast(true);
        fetchClaims();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete claim');
      }
    }
    handleMenuClose();
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedClaim) {
      try {
        await billingApi.updateClaimStatus(selectedClaim.id, newStatus);
        setSuccessMessage(`Claim status updated to ${newStatus}!`);
        setShowSuccessToast(true);
        fetchClaims();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update claim status');
      }
    }
    handleMenuClose();
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
          Billing & Claims
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewClaimClick}
        >
          New Claim
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
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                  <TableCell>Claim Number</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Payer</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {claims.map((claim) => (
                  <TableRow key={claim.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {claim.claimNumber || 'Pending'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {claim.patient.firstName} {claim.patient.lastName}
                    </TableCell>
                    <TableCell>{claim.payer.payerName}</TableCell>
                    <TableCell>{claim.claimType}</TableCell>
                    <TableCell>
                      {claim.claimAmount ? formatCurrency(claim.claimAmount) : '-'}
                    </TableCell>
                    <TableCell>
                      {claim.submissionDate ? formatDate(claim.submissionDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={claim.status}
                        color={getStatusColor(claim.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, claim)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
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

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewClaim}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditClaim}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Claim</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('SUBMITTED')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Submitted</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('ACCEPTED')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Accepted</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('REJECTED')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Rejected</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClaim} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Claim</ListItemText>
        </MenuItem>
      </Menu>

      {/* Success Toast */}
      <Snackbar
        open={showSuccessToast}
        autoHideDuration={3000}
        onClose={() => setShowSuccessToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSuccessToast(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Billing;
