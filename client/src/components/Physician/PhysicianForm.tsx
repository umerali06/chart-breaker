import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import { physiciansApi } from '../../services/api';

interface PhysicianFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  physician?: any;
  mode: 'create' | 'edit';
}

const PhysicianForm: React.FC<PhysicianFormProps> = ({
  open,
  onClose,
  onSuccess,
  physician,
  mode
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    npi: '',
    specialty: '',
    phone: '',
    email: '',
    address: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && physician) {
      setFormData({
        firstName: physician.firstName || '',
        lastName: physician.lastName || '',
        npi: physician.npi || '',
        specialty: physician.specialty || '',
        phone: physician.phone || '',
        email: physician.email || '',
        address: physician.address || '',
        isActive: physician.isActive !== undefined ? physician.isActive : true
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        npi: '',
        specialty: '',
        phone: '',
        email: '',
        address: '',
        isActive: true
      });
    }
    setError('');
    setErrors([]);
  }, [open, mode, physician]);

  const handleChange = (field: string) => (event: any) => {
    let value = event.target.value;
    
    // Format NPI to only allow digits and limit to 10 characters
    if (field === 'npi') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }
    
    // Format phone to allow digits, spaces, parentheses, dashes
    if (field === 'phone') {
      value = value.replace(/[^\d\s\(\)\-]/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setErrors([]);

    try {
      if (mode === 'create') {
        await physiciansApi.createPhysician(formData);
      } else if (physician) {
        await physiciansApi.updatePhysician(physician.id, formData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setErrors(errorData.errors);
        setError(errorData.message || 'Please fix the following errors:');
      } else {
        setError(errorData?.message || err.message || 'Failed to save physician');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {mode === 'create' ? 'Add New Physician' : 'Edit Physician'}
        </DialogTitle>
        
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
              {errors.length > 0 && (
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                  {errors.map((err, index) => (
                    <li key={index} style={{ marginBottom: '4px' }}>
                      {err}
                    </li>
                  ))}
                </ul>
              )}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={formData.firstName}
                onChange={handleChange('firstName')}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange('lastName')}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="NPI"
                value={formData.npi}
                onChange={handleChange('npi')}
                placeholder="10-digit NPI number"
                inputProps={{ maxLength: 10 }}
                helperText="Enter exactly 10 digits"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Specialty"
                value={formData.specialty}
                onChange={handleChange('specialty')}
                placeholder="e.g., Cardiology, Orthopedics"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                placeholder="(555) 123-4567"
                helperText="Enter phone number with area code"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                placeholder="physician@example.com"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
                multiline
                rows={2}
                placeholder="Street address, City, State, ZIP"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Saving...' : (mode === 'create' ? 'Add Physician' : 'Update Physician')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PhysicianForm;
