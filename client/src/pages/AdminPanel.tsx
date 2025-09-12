import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Refresh
} from '@mui/icons-material';
import { authVerificationApi } from '../services/api';

interface RegistrationRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  requestedAt: string;
  approvedAt?: string;
  adminNotes?: string;
  approvedByUser?: {
    firstName: string;
    lastName: string;
  };
}

const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RegistrationRequest | null>(null);
  const [actionDialog, setActionDialog] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authVerificationApi.getRegistrationRequests({
        status: statusFilter || undefined,
        page,
        limit: 10
      });
      setRequests(response.data.requests);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load registration requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      await authVerificationApi.approveRegistration(selectedRequest.id, {
        adminNotes
      });
      setSuccess('Registration request approved successfully');
      setActionDialog(null);
      setAdminNotes('');
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve registration');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason) return;

    try {
      await authVerificationApi.rejectRegistration(selectedRequest.id, {
        reason: rejectionReason,
        adminNotes
      });
      setSuccess('Registration request rejected successfully');
      setActionDialog(null);
      setRejectionReason('');
      setAdminNotes('');
      loadRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject registration');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'error';
      case 'EXPIRED': return 'default';
      default: return 'default';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'INTAKE_STAFF': return 'Intake Staff';
      case 'CLINICIAN': return 'Clinician';
      case 'QA_REVIEWER': return 'QA Reviewer';
      case 'BILLER': return 'Biller';
      default: return role;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Panel - User Registration
        </Typography>
        <Box>
          <Tooltip title="Refresh">
            <IconButton onClick={loadRequests} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Registration Requests
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Requested</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {request.firstName} {request.lastName}
                        </TableCell>
                        <TableCell>{request.email}</TableCell>
                        <TableCell>{getRoleDisplayName(request.role)}</TableCell>
                        <TableCell>
                          <Chip
                            label={request.status}
                            color={getStatusColor(request.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(request.requestedAt)}</TableCell>
                        <TableCell>
                          {request.status === 'PENDING' && (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setActionDialog('approve');
                                  }}
                                >
                                  <CheckCircle />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setActionDialog('reject');
                                  }}
                                >
                                  <Cancel />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog
        open={actionDialog !== null}
        onClose={() => setActionDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {actionDialog === 'approve' ? 'Approve Registration' : 'Reject Registration'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                User: {selectedRequest.firstName} {selectedRequest.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {selectedRequest.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {getRoleDisplayName(selectedRequest.role)}
              </Typography>
            </Box>
          )}

          {actionDialog === 'reject' && (
            <TextField
              fullWidth
              label="Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
          )}

          <TextField
            fullWidth
            label="Admin Notes (Optional)"
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog(null)}>
            Cancel
          </Button>
          <Button
            onClick={actionDialog === 'approve' ? handleApprove : handleReject}
            variant="contained"
            color={actionDialog === 'approve' ? 'success' : 'error'}
            disabled={actionDialog === 'reject' && !rejectionReason}
          >
            {actionDialog === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPanel;
