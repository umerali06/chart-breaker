import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  CardHeader,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Payment as PaymentIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  AdminPanelSettings as AdminIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { reportsApi, authVerificationApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
  totalPatients: number;
  activeEpisodes: number;
  pendingVisits: number;
  pendingClaims: number;
  pendingQaReviews: number;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  staffProfile?: {
    discipline?: string;
    employeeId?: string;
  };
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState('');

  const roleOptions = [
    { value: 'INTAKE_STAFF', label: 'Intake Staff' },
    { value: 'CLINICIAN', label: 'Clinician' },
    { value: 'QA_REVIEWER', label: 'QA Reviewer' },
    { value: 'BILLER', label: 'Biller' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getAdminUsers();
      setUsers(response.data.users);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      setProcessingUser(userId);
      await usersApi.updateUserStatus(userId, !currentStatus);
      setSuccessMessage(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRoleChangeClick = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleDialogOpen(true);
  };

  const handleRoleChangeConfirm = async () => {
    if (!selectedUser || !newRole) return;
    
    try {
      setProcessingUser(selectedUser.id);
      await usersApi.updateUserRole(selectedUser.id, newRole);
      setSuccessMessage('User role updated successfully!');
      fetchUsers();
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setProcessingUser(null);
    }
  };

  const handleRoleDialogClose = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setNewRole('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'error';
      case 'CLINICIAN':
        return 'primary';
      case 'INTAKE_STAFF':
        return 'success';
      case 'QA_REVIEWER':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">
          User Management
        </Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchUsers}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{
          width: '100%',
          maxWidth: '100%', // Constrain to parent width
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          borderRadius: 1,
          boxSizing: 'border-box',
          minWidth: 0 // Ensure it can shrink below content size
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
              minWidth: 0, // Allow container to shrink
              '& .MuiTable-root': {
                minWidth: 900, // Set minimum width for content
                width: 'max-content' // Allow table to be wider than container for scrolling
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
                  }}>Name</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Email</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Role</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Status</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Discipline</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Created</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Last Login</TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    whiteSpace: 'nowrap'
                  }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {user.firstName} {user.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      whiteSpace: 'nowrap'
                    }}>
                      <Typography variant="body2">
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role.replace('_', ' ')}
                        size="small"
                        color={getRoleColor(user.role) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={user.isActive ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.staffProfile?.discipline || (user.role === 'ADMIN' ? 'Admin' : 'N/A')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(user.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box 
                        display="flex" 
                        gap={1}
                        flexDirection={{ xs: 'column', sm: 'row' }}
                        alignItems={{ xs: 'stretch', sm: 'center' }}
                        sx={{ flexWrap: 'nowrap' }}
                      >
                        <Button
                          size="small"
                          startIcon={processingUser === user.id ? <CircularProgress size={16} /> : null}
                          color={user.isActive ? 'error' : 'success'}
                          variant="outlined"
                          disabled={processingUser !== null}
                          onClick={() => handleStatusToggle(user.id, user.isActive)}
                          sx={{ 
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {processingUser === user.id ? 'Processing...' : (user.isActive ? 'Deactivate' : 'Activate')}
                        </Button>
                        <Button
                          size="small"
                          startIcon={processingUser === user.id ? <CircularProgress size={16} /> : null}
                          color="primary"
                          variant="outlined"
                          disabled={processingUser !== null || user.role === 'ADMIN'}
                          onClick={() => handleRoleChangeClick(user)}
                          sx={{ 
                            fontSize: '0.75rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {processingUser === user.id ? 'Processing...' : 'Change Role'}
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Role Selection Dialog */}
      <Dialog open={roleDialogOpen} onClose={handleRoleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Change User Role</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Change role for <strong>{selectedUser.firstName} {selectedUser.lastName}</strong>
              </Typography>
              <FormControl fullWidth>
                <InputLabel>Select New Role</InputLabel>
                <Select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  label="Select New Role"
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRoleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleRoleChangeConfirm} 
            variant="contained"
            disabled={!newRole || processingUser !== null}
          >
            {processingUser ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface RegistrationRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  requestedAt: string;
  adminNotes?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminTab, setAdminTab] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // System Settings State
  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Chart Breaker EHR',
    siteUrl: 'http://localhost:3000',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    sessionTimeout: 30,
    emailNotifications: true,
    smsNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: 10,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
    requireTwoFactor: false,
    passwordExpiry: 90,
    auditLogRetention: 365,
    maintenanceMode: false
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState('');

  useEffect(() => {
    fetchDashboardData();
    if (user?.role === 'ADMIN') {
      console.log('User is admin, fetching registration requests...');
      console.log('User data:', user);
      console.log('Token:', localStorage.getItem('token'));
      fetchRegistrationRequests();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, activityResponse] = await Promise.all([
        reportsApi.getDashboardStats(),
        reportsApi.getRecentActivity()
      ]);
      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationRequests = async () => {
    try {
      setAdminLoading(true);
      console.log('Fetching registration requests...');
      const response = await authVerificationApi.getRegistrationRequests({ status: 'PENDING' });
      console.log('Registration requests response:', response);
      // The API returns { requests: [...], pagination: {...} }
      const requests = response.data?.requests || [];
      console.log('Parsed requests:', requests);
      setRegistrationRequests(requests);
    } catch (err: any) {
      console.error('Failed to load registration requests:', err);
      setError(`Failed to load registration requests: ${err.response?.data?.error || err.message}`);
      setRegistrationRequests([]); // Set empty array on error
    } finally {
      setAdminLoading(false);
    }
  };

  // System Settings Functions
  const handleSettingChange = (key: string, value: any) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSettingsMessage('Settings saved successfully!');
      setTimeout(() => setSettingsMessage(''), 3000);
    } catch (error) {
      setSettingsMessage('Failed to save settings');
      setTimeout(() => setSettingsMessage(''), 3000);
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSystemSettings({
      siteName: 'Chart Breaker EHR',
      siteUrl: 'http://localhost:3000',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12',
      sessionTimeout: 30,
      emailNotifications: true,
      smsNotifications: false,
      autoBackup: true,
      backupFrequency: 'daily',
      maxFileSize: 10,
      allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
      requireTwoFactor: false,
      passwordExpiry: 90,
      auditLogRetention: 365,
      maintenanceMode: false
    });
    setSettingsMessage('Settings reset to defaults');
    setTimeout(() => setSettingsMessage(''), 3000);
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      setError('');
      setSuccessMessage('');
      console.log('Approving request:', requestId);
      const response = await authVerificationApi.approveRegistration(requestId, { adminNotes: 'Approved by admin' });
      console.log('Approve response:', response);
      setSuccessMessage('Registration request approved successfully!');
      await fetchRegistrationRequests();
      console.log('Registration requests refreshed');
    } catch (err: any) {
      console.error('Failed to approve request:', err);
      setError(`Failed to approve request: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      setProcessingRequest(requestId);
      setError('');
      setSuccessMessage('');
      console.log('Rejecting request:', requestId);
      const response = await authVerificationApi.rejectRegistration(requestId, { adminNotes: 'Rejected by admin' });
      console.log('Reject response:', response);
      setSuccessMessage('Registration request rejected successfully!');
      await fetchRegistrationRequests();
      console.log('Registration requests refreshed');
    } catch (err: any) {
      console.error('Failed to reject request:', err);
      setError(`Failed to reject request: ${err.response?.data?.error || err.message}`);
    } finally {
      setProcessingRequest(null);
    }
  };

  // Quick Action handlers
  const handleAddNewPatient = () => {
    navigate('/patients/new');
  };

  const handleScheduleVisit = () => {
    navigate('/schedules');
  };

  const handleCreateAssessment = () => {
    navigate('/assessments');
  };

  const handleGenerateReport = () => {
    navigate('/reports');
  };

  const handleManageUsers = () => {
    // For admin users, focus on the admin panel
    setAdminTab(0);
    // Scroll to admin panel
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
      adminPanel.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleViewPatients = () => {
    navigate('/patients');
  };

  const handleViewEpisodes = () => {
    navigate('/episodes');
  };

  const handleViewBilling = () => {
    navigate('/billing');
  };

  const handleViewQA = () => {
    navigate('/qa');
  };

  const statCards = [
    {
      title: 'Total Patients',
      value: stats?.totalPatients || 0,
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
    },
    {
      title: 'Active Episodes',
      value: stats?.activeEpisodes || 0,
      icon: <AssignmentIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
    },
    {
      title: 'Pending Visits',
      value: stats?.pendingVisits || 0,
      icon: <ScheduleIcon sx={{ fontSize: 40 }} />,
      color: 'warning.main',
    },
    {
      title: 'Pending Claims',
      value: stats?.pendingClaims || 0,
      icon: <PaymentIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
    },
    {
      title: 'QA Reviews',
      value: stats?.pendingQaReviews || 0,
      icon: <VerifiedUserIcon sx={{ fontSize: 40 }} />,
      color: 'error.main',
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
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
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        Dashboard
      </Typography>
        {user?.role === 'ADMIN' && (
          <Chip
            icon={<AdminIcon />}
            label="Administrator"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 'bold' }}
          />
        )}
      </Box>
      
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ 
        mb: 3,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0
      }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={6} lg={2.4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }
              }}
              onClick={() => {
                switch (card.title) {
                  case 'Total Patients':
                    navigate('/patients');
                    break;
                  case 'Active Episodes':
                    navigate('/episodes');
                    break;
                  case 'Pending Visits':
                    navigate('/schedules');
                    break;
                  case 'Pending Claims':
                    navigate('/billing');
                    break;
                  case 'QA Reviews':
                    navigate('/qa');
                    break;
                  default:
                    break;
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  flexDirection={{ xs: 'column', sm: 'row' }}
                  textAlign={{ xs: 'center', sm: 'left' }}
                >
                  <Box>
                    <Typography 
                      color="text.secondary" 
                      gutterBottom 
                      variant="body2"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      {card.title}
                    </Typography>
                    <Typography 
                      variant="h4" 
                      component="div" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
                      }}
                    >
                      {card.value}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    color: card.color,
                    mt: { xs: 1, sm: 0 },
                    '& svg': {
                      fontSize: { xs: 32, sm: 40 }
                    }
                  }}>
                    {card.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {user?.role === 'ADMIN' && (
        <Card id="admin-panel" sx={{ 
          mb: 3, 
          width: '100%', 
          maxWidth: '100%',
          overflow: 'hidden',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <CardContent sx={{ 
            width: '100%', 
            overflow: 'hidden',
            maxWidth: '100%',
            minWidth: 0
          }}>
            <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
              <AdminIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Admin Panel
              </Typography>
            </Box>
            <Tabs value={adminTab} onChange={(e, newValue) => setAdminTab(newValue)}>
              <Tab 
                label={
                  <Badge badgeContent={Array.isArray(registrationRequests) ? registrationRequests.length : 0} color="error">
                    Registration Requests
                  </Badge>
                } 
              />
              <Tab label="User Management" />
              <Tab label="System Settings" />
            </Tabs>
            
            {adminTab === 0 && (
              <Box sx={{ 
                mt: 2, 
                width: '100%', 
                overflow: 'hidden',
                maxWidth: '100%',
                minWidth: 0
              }}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                    {error}
                  </Alert>
                )}
                {successMessage && (
                  <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">
                    Pending Registration Requests
                  </Typography>
                  <Button
                    startIcon={<RefreshIcon />}
                    onClick={fetchRegistrationRequests}
                    disabled={adminLoading}
                  >
                    Refresh
                  </Button>
                </Box>
                
                {adminLoading ? (
                  <Box display="flex" justifyContent="center" p={3}>
                    <CircularProgress />
                  </Box>
                ) : !Array.isArray(registrationRequests) || registrationRequests.length === 0 ? (
                  <Alert severity="info">
                    No pending registration requests.
                  </Alert>
                ) : (
        <Box sx={{
          width: '100%',
          maxWidth: '100%', // Constrain to parent width
          overflow: 'hidden',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
                    <TableContainer 
                    component={Paper}
                    sx={{ 
                      width: '100%',
                      maxWidth: '100%',
                      overflowX: 'auto',
                      overflowY: 'visible',
                      minWidth: 0, // Allow container to shrink
                      '& .MuiTable-root': {
                        minWidth: 600,
                        width: 'max-content'
                      },
                      '&::-webkit-scrollbar': {
                        height: '8px',
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
                      tableLayout: 'auto',
                      width: 'max-content',
                      minWidth: 600
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            whiteSpace: 'nowrap'
                          }}>Name</TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            whiteSpace: 'nowrap'
                          }}>Email</TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            whiteSpace: 'nowrap'
                          }}>Role</TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            whiteSpace: 'nowrap'
                          }}>Requested</TableCell>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            whiteSpace: 'nowrap'
                          }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Array.isArray(registrationRequests) && registrationRequests.map((request) => (
                          <TableRow key={request.id} hover>
                            <TableCell sx={{ 
                              whiteSpace: 'nowrap'
                            }}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 'medium'
                              }}>
                                {request.firstName} {request.lastName}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ 
                              whiteSpace: 'nowrap'
                            }}>
                              <Typography variant="body2">
                                {request.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={request.role.replace('_', ' ')} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {new Date(request.requestedAt).toLocaleDateString()}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box 
                                display="flex" 
                                gap={{ xs: 0.5, sm: 1 }} 
                                flexDirection={{ xs: 'column', sm: 'row' }}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                sx={{ flexWrap: 'nowrap' }}
                              >
                                <Button
                                  size="small"
                                  startIcon={processingRequest === request.id ? <CircularProgress size={16} /> : <CheckCircleIcon />}
                                  color="success"
                                  variant="outlined"
                                  disabled={processingRequest !== null}
                                  onClick={() => handleApproveRequest(request.id)}
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {processingRequest === request.id ? 'Processing...' : 'Approve'}
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={processingRequest === request.id ? <CircularProgress size={16} /> : <CancelIcon />}
                                  color="error"
                                  variant="outlined"
                                  disabled={processingRequest !== null}
                                  onClick={() => handleRejectRequest(request.id)}
                                  sx={{ 
                                    fontSize: '0.75rem',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {processingRequest === request.id ? 'Processing...' : 'Reject'}
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  </Box>
                )}
              </Box>
            )}
            
            {adminTab === 1 && (
              <Box sx={{ 
                mt: 2, 
                width: '100%', 
                maxWidth: '100%',
                overflow: 'hidden',
                minWidth: 0,
                boxSizing: 'border-box'
              }}>
                <UserManagement />
              </Box>
            )}
            
            {adminTab === 2 && (
              <Box sx={{ 
                mt: 2, 
                width: '100%', 
                overflow: 'hidden',
                maxWidth: '100%',
                minWidth: 0
              }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h6">
                    System Settings
                  </Typography>
                  <Box>
                    <Button 
                      variant="outlined" 
                      onClick={handleResetSettings}
                      sx={{ mr: 2 }}
                    >
                      Reset to Defaults
                    </Button>
                    <Button 
                      variant="contained" 
                      onClick={handleSaveSettings}
                      disabled={settingsLoading}
                      startIcon={settingsLoading ? <CircularProgress size={16} /> : null}
                    >
                      {settingsLoading ? 'Saving...' : 'Save Settings'}
                    </Button>
                  </Box>
                </Box>

                {settingsMessage && (
                  <Alert severity={settingsMessage.includes('success') ? 'success' : 'error'} sx={{ mb: 2 }}>
                    {settingsMessage}
                  </Alert>
                )}

                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  {/* General Settings */}
                  <Grid item xs={12} lg={6}>
                    <Card>
                      <CardHeader title="General Settings" />
                      <CardContent>
                        <TextField
                          fullWidth
                          label="Site Name"
                          value={systemSettings.siteName}
                          onChange={(e) => handleSettingChange('siteName', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Site URL"
                          value={systemSettings.siteUrl}
                          onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Timezone</InputLabel>
                          <Select
                            value={systemSettings.timezone}
                            onChange={(e) => handleSettingChange('timezone', e.target.value)}
                            label="Timezone"
                          >
                            <MenuItem value="America/New_York">Eastern Time</MenuItem>
                            <MenuItem value="America/Chicago">Central Time</MenuItem>
                            <MenuItem value="America/Denver">Mountain Time</MenuItem>
                            <MenuItem value="America/Los_Angeles">Pacific Time</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl fullWidth>
                          <InputLabel>Date Format</InputLabel>
                          <Select
                            value={systemSettings.dateFormat}
                            onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                            label="Date Format"
                          >
                            <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                            <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                            <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Security Settings */}
                  <Grid item xs={12} lg={6}>
                    <Card>
                      <CardHeader title="Security Settings" />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.requireTwoFactor}
                              onChange={(e) => handleSettingChange('requireTwoFactor', e.target.checked)}
                            />
                          }
                          label="Require Two-Factor Authentication"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Password Expiry (days)"
                          type="number"
                          value={systemSettings.passwordExpiry}
                          onChange={(e) => handleSettingChange('passwordExpiry', parseInt(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Session Timeout (minutes)"
                          type="number"
                          value={systemSettings.sessionTimeout}
                          onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Audit Log Retention (days)"
                          type="number"
                          value={systemSettings.auditLogRetention}
                          onChange={(e) => handleSettingChange('auditLogRetention', parseInt(e.target.value))}
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Notification Settings */}
                  <Grid item xs={12} lg={6}>
                    <Card>
                      <CardHeader title="Notification Settings" />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.emailNotifications}
                              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            />
                          }
                          label="Email Notifications"
                          sx={{ mb: 2 }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.smsNotifications}
                              onChange={(e) => handleSettingChange('smsNotifications', e.target.checked)}
                            />
                          }
                          label="SMS Notifications"
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth>
                          <InputLabel>Time Format</InputLabel>
                          <Select
                            value={systemSettings.timeFormat}
                            onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                            label="Time Format"
                          >
                            <MenuItem value="12">12 Hour (AM/PM)</MenuItem>
                            <MenuItem value="24">24 Hour</MenuItem>
                          </Select>
                        </FormControl>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* File & Backup Settings */}
                  <Grid item xs={12} lg={6}>
                    <Card>
                      <CardHeader title="File & Backup Settings" />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.autoBackup}
                              onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                            />
                          }
                          label="Automatic Backup"
                          sx={{ mb: 2 }}
                        />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Backup Frequency</InputLabel>
                          <Select
                            value={systemSettings.backupFrequency}
                            onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                            label="Backup Frequency"
                          >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                          </Select>
                        </FormControl>
                        <TextField
                          fullWidth
                          label="Max File Size (MB)"
                          type="number"
                          value={systemSettings.maxFileSize}
                          onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          fullWidth
                          label="Allowed File Types"
                          value={systemSettings.allowedFileTypes.join(', ')}
                          onChange={(e) => handleSettingChange('allowedFileTypes', e.target.value.split(', '))}
                          helperText="Separate file types with commas"
                        />
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* System Status */}
                  <Grid item xs={12}>
                    <Card>
                      <CardHeader title="System Status" />
                      <CardContent>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={systemSettings.maintenanceMode}
                              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                              color="warning"
                            />
                          }
                          label="Maintenance Mode"
                          sx={{ mb: 2 }}
                        />
                        <Alert severity="info">
                          When maintenance mode is enabled, only administrators can access the system.
                        </Alert>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Grid container spacing={{ xs: 2, sm: 3 }}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Recent Activity
              </Typography>
              <List>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemIcon>
                      <TrendingUpIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={activity.description}
                      secondary={activity.timestamp}
                    />
                    <Chip
                      label={activity.type}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quick Actions
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'row', sm: 'column' }, 
                gap: { xs: 1, sm: 1 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' }
              }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleAddNewPatient}
                >
                  Add New Patient
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ScheduleIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleScheduleVisit}
                >
                  Schedule Visit
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleCreateAssessment}
                >
                  Create Assessment
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleGenerateReport}
                >
                  Generate Report
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleViewPatients}
                >
                  View Patients
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssignmentIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleViewEpisodes}
                >
                  View Episodes
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<PaymentIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleViewBilling}
                >
                  View Billing
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VerifiedUserIcon />}
                  fullWidth
                  sx={{ 
                    mb: { xs: 0, sm: 1 },
                    minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                  }}
                  onClick={handleViewQA}
                >
                  View QA/Compliance
                </Button>
                {user?.role === 'ADMIN' && (
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    fullWidth
                    sx={{ 
                      mb: { xs: 0, sm: 1 },
                      minWidth: { xs: 'calc(50% - 4px)', sm: '100%' }
                    }}
                    color="secondary"
                    onClick={handleManageUsers}
                  >
                    Manage Users
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
