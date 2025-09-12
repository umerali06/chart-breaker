import React, { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { physiciansApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PhysicianForm from '../components/Physician/PhysicianForm';
import PhysicianDetails from '../components/Physician/PhysicianDetails';

interface Physician {
  id: string;
  firstName: string;
  lastName: string;
  npi: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Physicians: React.FC = () => {
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPhysician, setEditingPhysician] = useState<Physician | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingPhysician, setViewingPhysician] = useState<Physician | null>(null);
  const { user } = useAuth();

  const fetchPhysicians = useCallback(async () => {
    try {
      setLoading(true);
      const response = await physiciansApi.getPhysicians({
        page,
        limit: 10,
        search: searchTerm,
        specialty: specialtyFilter,
      });
      setPhysicians(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.message || 'Failed to load physicians');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, specialtyFilter]);

  const fetchSpecialties = useCallback(async () => {
    try {
      const response = await physiciansApi.getSpecialties();
      setSpecialties(response.data.data || []);
    } catch (err) {
      console.error('Error fetching specialties:', err);
    }
  }, []);

  useEffect(() => {
    fetchPhysicians();
  }, [fetchPhysicians]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  const handleSpecialtyFilterChange = (event: SelectChangeEvent) => {
    setSpecialtyFilter(event.target.value);
    setPage(1);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, physician: Physician) => {
    setAnchorEl(event.currentTarget);
    setSelectedPhysician(physician);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPhysician(null);
  };

  const handleViewPhysician = () => {
    setViewingPhysician(selectedPhysician);
    setDetailsOpen(true);
    handleMenuClose();
  };

  const handleEditPhysician = () => {
    setEditingPhysician(selectedPhysician);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPhysician) return;

    try {
      await physiciansApi.deletePhysician(selectedPhysician.id);
      setDeleteDialogOpen(false);
      setSelectedPhysician(null);
      fetchPhysicians();
    } catch (err: any) {
      setError(err.message || 'Failed to delete physician');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedPhysician(null);
  };

  const handleAddPhysician = () => {
    setEditingPhysician(null);
    setFormOpen(true);
  };

  const handleFormSuccess = () => {
    fetchPhysicians();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingPhysician(null);
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setViewingPhysician(null);
  };

  const handleEditFromDetails = () => {
    setEditingPhysician(viewingPhysician);
    setDetailsOpen(false);
    setFormOpen(true);
  };

  const canManagePhysicians = user?.role === 'ADMIN' || user?.role === 'INTAKE_STAFF';
  const canDeletePhysicians = user?.role === 'ADMIN';

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
          Physician Directory
        </Typography>
        {canManagePhysicians && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPhysician}
          >
            Add Physician
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search physicians..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Specialty</InputLabel>
                <Select
                  value={specialtyFilter}
                  onChange={handleSpecialtyFilterChange}
                  label="Specialty"
                >
                  <MenuItem value="">All Specialties</MenuItem>
                  {specialties.map((specialty) => (
                    <MenuItem key={specialty} value={specialty}>
                      {specialty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
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
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>NPI</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Specialty</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Phone</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {physicians.length > 0 ? (
                    physicians.map((physician) => (
                      <TableRow key={physician.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {physician.firstName} {physician.lastName}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {physician.npi}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {physician.specialty || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {physician.phone || '-'}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {physician.email || '-'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={physician.isActive ? 'Active' : 'Inactive'}
                            color={physician.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, physician)}
                            size="small"
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No physicians found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(event, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewPhysician}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {canManagePhysicians && (
          <MenuItem onClick={handleEditPhysician}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {canDeletePhysicians && (
          <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Physician
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete {selectedPhysician?.firstName} {selectedPhysician?.lastName}? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Physician Form Dialog */}
      <PhysicianForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        physician={editingPhysician}
        mode={editingPhysician ? 'edit' : 'create'}
      />

      {/* Physician Details Dialog */}
      <PhysicianDetails
        open={detailsOpen}
        onClose={handleDetailsClose}
        onEdit={handleEditFromDetails}
        physician={viewingPhysician}
        canEdit={canManagePhysicians}
      />
    </Box>
  );
};

export default Physicians;
