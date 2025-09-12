import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { billingApi, patientsApi, episodesApi } from '../services/api';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

interface Episode {
  id: string;
  episodeNumber: string;
  status: string;
}

interface Payer {
  id: string;
  payerName: string;
  payerType: string;
}


const EditClaim: React.FC = () => {
  const navigate = useNavigate();
  const { claimId } = useParams<{ claimId: string }>();
  
  const [formData, setFormData] = useState({
    patientId: '',
    episodeId: '',
    payerId: '',
    claimType: 'CLAIM_837I',
    claimAmount: '',
    status: 'PENDING',
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [payers, setPayers] = useState<Payer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadClaimData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await billingApi.getClaim(claimId!);
      const claim = response.data.claim;
      setFormData({
        patientId: claim.patientId,
        episodeId: claim.episodeId || '',
        payerId: claim.payerId,
        claimType: claim.claimType,
        claimAmount: claim.claimAmount.toString(),
        status: claim.status
      });
    } catch (err: any) {
      console.error('Error loading claim:', err);
      setError('Failed to load claim data');
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    if (claimId) {
      loadClaimData();
    }
  }, [claimId, loadClaimData]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.patientId) {
      loadEpisodes(formData.patientId);
    }
  }, [formData.patientId]);


  const loadData = async () => {
    try {
      const [patientsResponse, payersResponse] = await Promise.all([
        patientsApi.getPatients(),
        billingApi.getPayers()
      ]);
      
      setPatients(patientsResponse.data.patients);
      setPayers(payersResponse.data.payers);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError('Failed to load data');
    }
  };

  const loadEpisodes = async (patientId: string) => {
    try {
      const response = await episodesApi.getEpisodes({ patientId });
      setEpisodes(response.data.episodes);
    } catch (err: any) {
      console.error('Error loading episodes:', err);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.patientId) errors.patientId = 'Patient is required';
    if (!formData.payerId) errors.payerId = 'Payer is required';
    if (!formData.claimType) errors.claimType = 'Claim type is required';
    if (!formData.claimAmount || parseFloat(formData.claimAmount) <= 0) {
      errors.claimAmount = 'Valid claim amount is required';
    }
    if (!formData.status) errors.status = 'Status is required';
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors below');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const claimData = {
        ...formData,
        claimAmount: parseFloat(formData.claimAmount),
        episodeId: formData.episodeId || null,
      };
      
      await billingApi.updateClaim(claimId!, claimData);
      
      setSuccessMessage('Claim updated successfully!');
      setShowSuccessToast(true);
      
      // Navigate back to billing page after a short delay
      setTimeout(() => {
        navigate('/billing');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error updating claim:', err);
      setError(err.response?.data?.message || 'Failed to update claim');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.patientId) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/billing')}
          sx={{ mr: 2 }}
        >
          Back to Billing
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Edit Claim
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.patientId}>
                  <InputLabel>Patient *</InputLabel>
                  <Select
                    value={formData.patientId}
                    label="Patient *"
                    onChange={(e) => handleInputChange('patientId', e.target.value)}
                  >
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.patientId})
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.patientId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.patientId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Episode</InputLabel>
                  <Select
                    value={formData.episodeId}
                    label="Episode"
                    onChange={(e) => handleInputChange('episodeId', e.target.value)}
                  >
                    <MenuItem value="">No Episode</MenuItem>
                    {episodes.map((episode) => (
                      <MenuItem key={episode.id} value={episode.id}>
                        {episode.episodeNumber} ({episode.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.payerId}>
                  <InputLabel>Payer *</InputLabel>
                  <Select
                    value={formData.payerId}
                    label="Payer *"
                    onChange={(e) => handleInputChange('payerId', e.target.value)}
                  >
                    {payers.map((payer) => (
                      <MenuItem key={payer.id} value={payer.id}>
                        {payer.payerName} ({payer.payerType})
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.payerId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.payerId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.claimType}>
                  <InputLabel>Claim Type *</InputLabel>
                  <Select
                    value={formData.claimType}
                    label="Claim Type *"
                    onChange={(e) => handleInputChange('claimType', e.target.value)}
                  >
                    <MenuItem value="CLAIM_837I">837I (Institutional)</MenuItem>
                    <MenuItem value="CLAIM_837P">837P (Professional)</MenuItem>
                  </Select>
                  {fieldErrors.claimType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.claimType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Claim Amount *"
                  type="number"
                  value={formData.claimAmount}
                  onChange={(e) => handleInputChange('claimAmount', e.target.value)}
                  error={!!fieldErrors.claimAmount}
                  helperText={fieldErrors.claimAmount || 'Enter amount in USD'}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.status}>
                  <InputLabel>Status *</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status *"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="SUBMITTED">Submitted</MenuItem>
                    <MenuItem value="ACCEPTED">Accepted</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="PAID">Paid</MenuItem>
                    <MenuItem value="DENIED">Denied</MenuItem>
                  </Select>
                  {fieldErrors.status && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/billing')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? 'Updating...' : 'Update Claim'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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

export default EditClaim;

