import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { patientsApi } from '../services/api';

const EditPatient: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    ssn: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    primaryLanguage: 'English',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  });

  // Load patient data on component mount
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) return;
      
      try {
        setInitialLoading(true);
        const response = await patientsApi.getPatient(patientId);
        const patient = response.data.patient;
        
        // Format date for input field
        const dateOfBirth = patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '';
        
        setFormData({
          patientId: patient.patientId || '',
          firstName: patient.firstName || '',
          lastName: patient.lastName || '',
          dateOfBirth: dateOfBirth,
          gender: patient.gender || '',
          ssn: patient.ssn || '',
          addressLine1: patient.addressLine1 || '',
          addressLine2: patient.addressLine2 || '',
          city: patient.city || '',
          state: patient.state || '',
          zipCode: patient.zipCode || '',
          phone: patient.phone || '',
          email: patient.email || '',
          primaryLanguage: patient.primaryLanguage || 'English',
          emergencyContactName: patient.emergencyContactName || '',
          emergencyContactPhone: patient.emergencyContactPhone || '',
          emergencyContactRelationship: patient.emergencyContactRelationship || '',
        });
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to load patient data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      // Basic client-side validation
      const newFieldErrors: Record<string, string> = {};
      
      if (!formData.patientId) newFieldErrors.patientId = 'Patient ID is required';
      if (!formData.firstName) newFieldErrors.firstName = 'First name is required';
      if (!formData.lastName) newFieldErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) newFieldErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newFieldErrors.gender = 'Gender is required';

      // Validate SSN format if provided
      if (formData.ssn && !/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
        newFieldErrors.ssn = 'SSN must be in format 123-45-6789';
      }

      // Validate state format if provided
      if (formData.state && formData.state.length !== 2) {
        newFieldErrors.state = 'State must be a 2-letter code';
      }

      // Validate email format if provided
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newFieldErrors.email = 'Please enter a valid email address';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }

      // Prepare patient data with proper validation
      const patientData = {
        patientId: formData.patientId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        gender: formData.gender,
        // Only include optional fields if they have values
        ...(formData.ssn && { ssn: formData.ssn }),
        ...(formData.addressLine1 && { addressLine1: formData.addressLine1 }),
        ...(formData.addressLine2 && { addressLine2: formData.addressLine2 }),
        ...(formData.city && { city: formData.city }),
        ...(formData.state && { state: formData.state }),
        ...(formData.zipCode && { zipCode: formData.zipCode }),
        ...(formData.phone && { phone: formData.phone }),
        ...(formData.email && { email: formData.email }),
        ...(formData.primaryLanguage && { primaryLanguage: formData.primaryLanguage }),
        ...(formData.emergencyContactName && { emergencyContactName: formData.emergencyContactName }),
        ...(formData.emergencyContactPhone && { emergencyContactPhone: formData.emergencyContactPhone }),
        ...(formData.emergencyContactRelationship && { emergencyContactRelationship: formData.emergencyContactRelationship }),
      };

      console.log('Updating patient data:', patientData);
      const response = await patientsApi.updatePatient(patientId!, patientData);
      console.log('API response:', response);
      
      // Show success message
      setSuccessMessage('Patient updated successfully!');
      setShowSuccessToast(true);
      
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate('/patients');
      }, 1500);
      
    } catch (err: any) {
      console.error('Patient update error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle field-specific validation errors
      if (err.response?.status === 400 && err.response?.data?.error?.details) {
        const details = err.response.data.error.details;
        const newFieldErrors: Record<string, string> = {};
        
        // Map server validation errors to field names
        if (details.includes('patientId')) newFieldErrors.patientId = 'Patient ID is already taken or invalid';
        if (details.includes('firstName')) newFieldErrors.firstName = 'First name is required';
        if (details.includes('lastName')) newFieldErrors.lastName = 'Last name is required';
        if (details.includes('dateOfBirth')) newFieldErrors.dateOfBirth = 'Date of birth is required';
        if (details.includes('gender')) newFieldErrors.gender = 'Gender is required';
        if (details.includes('ssn')) newFieldErrors.ssn = 'SSN format is invalid';
        if (details.includes('state')) newFieldErrors.state = 'State must be 2 letters';
        if (details.includes('email')) newFieldErrors.email = 'Email format is invalid';
        
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields');
      } else {
        // General error message
        let errorMessage = 'Failed to update patient';
        
        if (err.response?.data?.error?.message) {
          errorMessage = err.response.data.error.message;
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error && !formData.patientId) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/patients')}
            sx={{ mr: 2 }}
          >
            Back to Patients
          </Button>
        </Box>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/patients')}
          sx={{ mr: 2 }}
        >
          Back to Patients
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Edit Patient
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Patient ID */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Patient ID"
                  value={formData.patientId}
                  onChange={handleInputChange('patientId')}
                  required
                  error={!!fieldErrors.patientId}
                  helperText={fieldErrors.patientId || "Patient ID cannot be changed"}
                  disabled
                />
              </Grid>

              {/* Name Fields */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  error={!!fieldErrors.firstName}
                  helperText={fieldErrors.firstName}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  error={!!fieldErrors.lastName}
                  helperText={fieldErrors.lastName}
                />
              </Grid>

              {/* Date of Birth and Gender */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!fieldErrors.dateOfBirth}
                  helperText={fieldErrors.dateOfBirth}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.gender}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.gender}
                    label="Gender"
                    onChange={handleInputChange('gender')}
                  >
                    <MenuItem value="M">Male</MenuItem>
                    <MenuItem value="F">Female</MenuItem>
                    <MenuItem value="O">Other</MenuItem>
                  </Select>
                  {fieldErrors.gender && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* SSN */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="SSN"
                  value={formData.ssn}
                  onChange={handleInputChange('ssn')}
                  placeholder="123-45-6789"
                  error={!!fieldErrors.ssn}
                  helperText={fieldErrors.ssn || "Format: 123-45-6789"}
                />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  error={!!fieldErrors.email}
                  helperText={fieldErrors.email}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Address Information
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address Line 1"
                  value={formData.addressLine1}
                  onChange={handleInputChange('addressLine1')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Address Line 2"
                  value={formData.addressLine2}
                  onChange={handleInputChange('addressLine2')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.city}
                  onChange={handleInputChange('city')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.state}
                  onChange={handleInputChange('state')}
                  placeholder="CO"
                  error={!!fieldErrors.state}
                  helperText={fieldErrors.state || "2-letter state code"}
                  inputProps={{ maxLength: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.zipCode}
                  onChange={handleInputChange('zipCode')}
                />
              </Grid>

              {/* Emergency Contact */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                  Emergency Contact
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Emergency Contact Name"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange('emergencyContactName')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Emergency Contact Phone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange('emergencyContactPhone')}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Relationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange('emergencyContactRelationship')}
                />
              </Grid>

              {/* Additional Information */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Primary Language"
                  value={formData.primaryLanguage}
                  onChange={handleInputChange('primaryLanguage')}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/patients')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Patient'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
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

export default EditPatient;

