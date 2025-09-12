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
  Chip,
  OutlinedInput,
  Checkbox,
  ListItemText,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon } from '@mui/icons-material';
import { episodesApi, patientsApi } from '../services/api';

const DISCIPLINES = [
  { value: 'SN', label: 'Skilled Nursing' },
  { value: 'PT', label: 'Physical Therapy' },
  { value: 'OT', label: 'Occupational Therapy' },
  { value: 'ST', label: 'Speech Therapy' },
  { value: 'MSW', label: 'Medical Social Work' },
  { value: 'HHA', label: 'Home Health Aide' },
];

const EPISODE_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DISCHARGED', label: 'Discharged' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const NewEpisode: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    episodeNumber: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    disciplines: [] as string[],
    frequencyPerWeek: '',
    visitDurationMinutes: '',
    careGoals: '',
  });

  // Load patient data on component mount
  useEffect(() => {
    const loadPatient = async () => {
      if (!patientId) {
        setError('No patient ID provided');
        setInitialLoading(false);
        return;
      }
      
      try {
        setInitialLoading(true);
        const response = await patientsApi.getPatient(patientId);
        const patientData = response.data.patient;
        setPatient(patientData);
        
        // Generate episode number
        const episodeNumber = `E${Date.now().toString().slice(-6)}`;
        setFormData(prev => ({
          ...prev,
          patientId: patientId,
          episodeNumber: episodeNumber,
        }));
      } catch (err: any) {
        console.error('Error loading patient:', err);
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

  const handleDisciplinesChange = (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      disciplines: typeof value === 'string' ? value.split(',') : value,
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors.disciplines) {
      setFieldErrors(prev => ({
        ...prev,
        disciplines: ''
      }));
    }
  };

  const generateEpisodeNumber = () => {
    const episodeNumber = `E${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({
      ...prev,
      episodeNumber: episodeNumber
    }));
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
      if (!formData.episodeNumber) newFieldErrors.episodeNumber = 'Episode number is required';
      if (!formData.startDate) newFieldErrors.startDate = 'Start date is required';
      if (!formData.status) newFieldErrors.status = 'Status is required';
      if (!formData.disciplines || formData.disciplines.length === 0) {
        newFieldErrors.disciplines = 'At least one discipline is required';
      }

      // Validate frequency per week if provided
      if (formData.frequencyPerWeek && (isNaN(Number(formData.frequencyPerWeek)) || Number(formData.frequencyPerWeek) < 1 || Number(formData.frequencyPerWeek) > 7)) {
        newFieldErrors.frequencyPerWeek = 'Frequency must be between 1 and 7';
      }

      // Validate visit duration if provided
      if (formData.visitDurationMinutes && (isNaN(Number(formData.visitDurationMinutes)) || Number(formData.visitDurationMinutes) < 15 || Number(formData.visitDurationMinutes) > 480)) {
        newFieldErrors.visitDurationMinutes = 'Visit duration must be between 15 and 480 minutes';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }

      // Prepare episode data
      const episodeData = {
        patientId: formData.patientId,
        episodeNumber: formData.episodeNumber,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        status: formData.status,
        disciplines: formData.disciplines,
        frequencyPerWeek: formData.frequencyPerWeek ? Number(formData.frequencyPerWeek) : null,
        visitDurationMinutes: formData.visitDurationMinutes ? Number(formData.visitDurationMinutes) : null,
        careGoals: formData.careGoals || null,
      };

      await episodesApi.createEpisode(episodeData);
      
      // Show success message
      setSuccessMessage('Episode created successfully!');
      setShowSuccessToast(true);
      
      // Navigate back to patient detail to show the new episode
      setTimeout(() => {
        navigate(`/patients/${patientId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Episode creation error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle field-specific validation errors
      if (err.response?.status === 400 && err.response?.data?.error?.details) {
        const details = err.response.data.error.details;
        const newFieldErrors: Record<string, string> = {};
        
        // Map server validation errors to field names
        if (details.includes('patientId')) newFieldErrors.patientId = 'Patient ID is required';
        if (details.includes('episodeNumber')) newFieldErrors.episodeNumber = 'Episode number is required or already exists';
        if (details.includes('startDate')) newFieldErrors.startDate = 'Start date is required';
        if (details.includes('status')) newFieldErrors.status = 'Status is required';
        if (details.includes('disciplines')) newFieldErrors.disciplines = 'At least one discipline is required';
        if (details.includes('frequencyPerWeek')) newFieldErrors.frequencyPerWeek = 'Frequency must be between 1 and 7';
        if (details.includes('visitDurationMinutes')) newFieldErrors.visitDurationMinutes = 'Visit duration must be between 15 and 480 minutes';
        
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields');
      } else {
        // General error message
        let errorMessage = 'Failed to create episode';
        
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

  if (error && !patient) {
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
          onClick={() => navigate(`/patients/${patientId}`)}
          sx={{ mr: 2 }}
        >
          Back to Patient
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          New Episode
        </Typography>
        {patient && (
          <Typography variant="h6" sx={{ ml: 2, color: 'text.secondary' }}>
            for {patient.firstName} {patient.lastName}
          </Typography>
        )}
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
              {/* Episode Number */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Episode Number"
                  value={formData.episodeNumber}
                  onChange={handleInputChange('episodeNumber')}
                  required
                  error={!!fieldErrors.episodeNumber}
                  helperText={fieldErrors.episodeNumber || "Click Generate to create a unique episode number"}
                  InputProps={{
                    endAdornment: (
                      <Button
                        size="small"
                        onClick={generateEpisodeNumber}
                        disabled={loading}
                      >
                        Generate
                      </Button>
                    )
                  }}
                />
              </Grid>

              {/* Status */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.status}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={handleInputChange('status')}
                  >
                    {EPISODE_STATUSES.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.status && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.status}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Start Date and End Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange('startDate')}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!fieldErrors.startDate}
                  helperText={fieldErrors.startDate}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange('endDate')}
                  InputLabelProps={{ shrink: true }}
                  error={!!fieldErrors.endDate}
                  helperText={fieldErrors.endDate || "Optional - leave blank for ongoing episodes"}
                />
              </Grid>

              {/* Disciplines */}
              <Grid item xs={12}>
                <FormControl fullWidth required error={!!fieldErrors.disciplines}>
                  <InputLabel>Disciplines</InputLabel>
                  <Select
                    multiple
                    value={formData.disciplines}
                    onChange={handleDisciplinesChange}
                    input={<OutlinedInput label="Disciplines" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                          const discipline = DISCIPLINES.find(d => d.value === value);
                          return (
                            <Chip
                              key={value}
                              label={discipline?.label || value}
                              size="small"
                            />
                          );
                        })}
                      </Box>
                    )}
                  >
                    {DISCIPLINES.map((discipline) => (
                      <MenuItem key={discipline.value} value={discipline.value}>
                        <Checkbox checked={formData.disciplines.indexOf(discipline.value) > -1} />
                        <ListItemText primary={discipline.label} />
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.disciplines && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.disciplines}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Frequency and Duration */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Frequency Per Week"
                  type="number"
                  value={formData.frequencyPerWeek}
                  onChange={handleInputChange('frequencyPerWeek')}
                  error={!!fieldErrors.frequencyPerWeek}
                  helperText={fieldErrors.frequencyPerWeek || "Number of visits per week (1-7)"}
                  inputProps={{ min: 1, max: 7 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Visit Duration (Minutes)"
                  type="number"
                  value={formData.visitDurationMinutes}
                  onChange={handleInputChange('visitDurationMinutes')}
                  error={!!fieldErrors.visitDurationMinutes}
                  helperText={fieldErrors.visitDurationMinutes || "Duration of each visit in minutes (15-480)"}
                  inputProps={{ min: 15, max: 480 }}
                />
              </Grid>

              {/* Care Goals */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Care Goals"
                  multiline
                  rows={4}
                  value={formData.careGoals}
                  onChange={handleInputChange('careGoals')}
                  placeholder="Describe the care goals for this episode..."
                  error={!!fieldErrors.careGoals}
                  helperText={fieldErrors.careGoals || "Optional - describe the care goals and objectives"}
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate(`/patients/${patientId}`)}
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
                    {loading ? 'Creating...' : 'Create Episode'}
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

export default NewEpisode;
