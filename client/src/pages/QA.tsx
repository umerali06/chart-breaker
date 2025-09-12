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
  Search as SearchIcon, 
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { qaApi } from '../services/api';

interface QAReview {
  id: string;
  documentType: string;
  reviewDate: string;
  status: string;
  deficiencies?: any;
  comments?: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const QA: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<QAReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReview, setSelectedReview] = useState<QAReview | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await qaApi.getReviews({
        page,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
      });
      setReviews(response.data.reviews);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load QA reviews');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, statusFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'DEFICIENT':
        return 'error';
      case 'LOCKED':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleNewReviewClick = () => {
    navigate('/qa/new');
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, review: QAReview) => {
    setAnchorEl(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReview(null);
  };

  const handleViewReview = () => {
    if (selectedReview) {
      navigate(`/qa/reviews/${selectedReview.id}`);
    }
    handleMenuClose();
  };

  const handleEditReview = () => {
    if (selectedReview) {
      navigate(`/qa/reviews/${selectedReview.id}/edit`);
    }
    handleMenuClose();
  };

  const handleDeleteReview = async () => {
    if (selectedReview) {
      try {
        await qaApi.deleteReview(selectedReview.id);
        setSuccessMessage('QA review deleted successfully!');
        setShowSuccessToast(true);
        fetchReviews();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete QA review');
      }
    }
    handleMenuClose();
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (selectedReview) {
      try {
        await qaApi.updateReview(selectedReview.id, { status: newStatus });
        setSuccessMessage(`QA review status updated to ${newStatus}!`);
        setShowSuccessToast(true);
        fetchReviews();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to update QA review status');
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
          QA & Compliance
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewReviewClick}
        >
          New Review
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
                placeholder="Search reviews..."
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
                  onChange={(e: any) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="DEFICIENT">Deficient</MenuItem>
                  <MenuItem value="LOCKED">Locked</MenuItem>
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
                  <TableCell>Document Type</TableCell>
                  <TableCell>Review Date</TableCell>
                  <TableCell>Reviewer</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deficiencies</TableCell>
                  <TableCell>Comments</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} hover>
                    <TableCell>{review.documentType}</TableCell>
                    <TableCell>{formatDate(review.reviewDate)}</TableCell>
                    <TableCell>
                      {review.reviewer.firstName} {review.reviewer.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={review.status}
                        color={getStatusColor(review.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {review.deficiencies ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell>
                      {review.comments ? 'Yes' : 'No'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuClick(e, review)}
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
        <MenuItem onClick={handleViewReview}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleEditReview}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Review</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('APPROVED')}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Approved</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('DEFICIENT')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Deficient</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate('LOCKED')}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Lock Review</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteReview} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Review</ListItemText>
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

export default QA;
