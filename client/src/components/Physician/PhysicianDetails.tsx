import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

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

interface PhysicianDetailsProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  physician: Physician | null;
  canEdit: boolean;
}

const PhysicianDetails: React.FC<PhysicianDetailsProps> = ({
  open,
  onClose,
  onEdit,
  physician,
  canEdit
}) => {
  if (!physician) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Physician Details
          </Typography>
          <Button
            onClick={onClose}
            startIcon={<CloseIcon />}
            size="small"
          >
            Close
          </Button>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Full Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {physician.firstName} {physician.lastName}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              NPI Number
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
              {physician.npi}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Specialty
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {physician.specialty || 'Not specified'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip
              label={physician.isActive ? 'Active' : 'Inactive'}
              color={physician.isActive ? 'success' : 'default'}
              size="small"
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Phone
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {physician.phone || 'Not provided'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {physician.email || 'Not provided'}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Address
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {physician.address || 'Not provided'}
            </Typography>
          </Grid>

          {/* System Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Created
            </Typography>
            <Typography variant="body2">
              {formatDate(physician.createdAt)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Last Updated
            </Typography>
            <Typography variant="body2">
              {formatDate(physician.updatedAt)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {canEdit && (
          <Button
            onClick={onEdit}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit Physician
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default PhysicianDetails;
