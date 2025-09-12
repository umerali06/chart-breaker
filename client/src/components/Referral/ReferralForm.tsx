import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { referralsApi } from '../../services/api';
import PhysicianSelector from '../Physician/PhysicianSelector';

interface ReferralFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId: string;
  referral?: any;
  mode: 'create' | 'edit';
}

const ReferralForm: React.FC<ReferralFormProps> = ({
  open,
  onClose,
  onSuccess,
  patientId,
  referral,
  mode
}) => {
  const [formData, setFormData] = useState({
    referralSource: '',
    referralDate: new Date().toISOString().split('T')[0],
    referralReason: '',
    physicianName: '',
    physicianNpi: ''
  });
  const [selectedPhysician, setSelectedPhysician] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const referralSources = [
    'Hospital',
    'Physician Office',
    'Skilled Nursing Facility',
    'Rehabilitation Center',
    'Home Health Agency',
    'Patient/Family',
    'Insurance Company',
    'Other'
  ];

  useEffect(() => {
    if (mode === 'edit' && referral) {
      setFormData({
        referralSource: referral.referralSource || '',
        referralDate: new Date(referral.referralDate).toISOString().split('T')[0],
        referralReason: referral.referralReason || '',
        physicianName: referral.physicianName || '',
        physicianNpi: referral.physicianNpi || ''
      });
      
      // Set selected physician if editing
      if (referral.physicianName && referral.physicianNpi) {
        setSelectedPhysician({
          id: 'existing',
          firstName: referral.physicianName.split(' ')[0] || '',
          lastName: referral.physicianName.split(' ').slice(1).join(' ') || '',
          npi: referral.physicianNpi
        });
      }
    } else {
      setFormData({
        referralSource: '',
        referralDate: new Date().toISOString().split('T')[0],
        referralReason: '',
        physicianName: '',
        physicianNpi: ''
      });
      setSelectedPhysician(null);
    }
    setError('');
  }, [open, mode, referral]);

  const handleChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      referralDate: event.target.value
    }));
  };

  const handlePhysicianChange = (physician: any) => {
    setSelectedPhysician(physician);
    if (physician) {
      setFormData(prev => ({
        ...prev,
        physicianName: `${physician.firstName} ${physician.lastName}`,
        physicianNpi: physician.npi
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        physicianName: '',
        physicianNpi: ''
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = {
        ...formData,
        patientId,
        referralDate: new Date(formData.referralDate).toISOString()
      };

      if (mode === 'create') {
        await referralsApi.createReferral(data);
      } else {
        await referralsApi.updateReferral(referral.id, data);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save referral');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Add New Referral' : 'Edit Referral'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Referral Source</InputLabel>
                <Select
                  value={formData.referralSource}
                  onChange={handleChange('referralSource')}
                  label="Referral Source"
                >
                  {referralSources.map((source) => (
                    <MenuItem key={source} value={source}>
                      {source}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Referral Date"
                type="date"
                value={formData.referralDate}
                onChange={handleDateChange}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <PhysicianSelector
                value={selectedPhysician}
                onChange={handlePhysicianChange}
                required
                label="Select Physician"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Or manually enter physician details:
                </Typography>
                <TextField
                  fullWidth
                  label="Physician Name"
                  value={formData.physicianName}
                  onChange={handleChange('physicianName')}
                  sx={{ mt: 1 }}
                />
                <TextField
                  fullWidth
                  label="Physician NPI"
                  value={formData.physicianNpi}
                  onChange={handleChange('physicianNpi')}
                  placeholder="10-digit NPI number"
                  inputProps={{ maxLength: 10 }}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Referral Reason"
                value={formData.referralReason}
                onChange={handleChange('referralReason')}
                multiline
                rows={3}
                placeholder="Describe the reason for referral..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : mode === 'create' ? 'Add Referral' : 'Update Referral'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReferralForm;