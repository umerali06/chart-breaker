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
import { schedulesApi, patientsApi, episodesApi, usersApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const DISCIPLINES = [
  { value: 'SN', label: 'Skilled Nursing' },
  { value: 'PT', label: 'Physical Therapy' },
  { value: 'OT', label: 'Occupational Therapy' },
  { value: 'ST', label: 'Speech Therapy' },
  { value: 'MSW', label: 'Medical Social Work' },
  { value: 'HHA', label: 'Home Health Aide' },
];

const VISIT_TYPES = [
  { value: 'ROUTINE', label: 'Routine Visit' },
  { value: 'EVALUATION', label: 'Evaluation' },
  { value: 'RE_EVALUATION', label: 'Re-evaluation' },
  { value: 'DISCHARGE', label: 'Discharge Visit' },
];


const ScheduleVisit: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    episodeId: '',
    staffId: '',
    visitDate: '',
    startTime: '',
    endTime: '',
    discipline: '',
    visitType: 'ROUTINE',
    notes: '',
  });

  // Load patient data and related information on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setError('No patient ID provided');
        setInitialLoading(false);
        return;
      }
      
      try {
        setInitialLoading(true);
        
        // Load patient data
        const patientResponse = await patientsApi.getPatient(patientId);
        const patientData = patientResponse.data.patient;
        setPatient(patientData);
        
        // Load episodes for this patient
        const episodesResponse = await episodesApi.getEpisodes({ patientId });
        setEpisodes(episodesResponse.data.episodes || []);
        
        // Load staff members from API
        const staffResponse = await usersApi.getUsers();
        const staffData = staffResponse.data.users;
        setStaff(staffData);
        
        // Set default values
        setFormData(prev => ({
          ...prev,
          patientId: patientId,
          staffId: user?.id || staffData[0]?.id || '',
        }));
        
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [patientId, user?.id]);

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

  const handleDateTimeChange = (field: string) => (event: any) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
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
      if (!formData.staffId) newFieldErrors.staffId = 'Staff member is required';
      if (!formData.visitDate) newFieldErrors.visitDate = 'Visit date is required';
      if (!formData.startTime) newFieldErrors.startTime = 'Start time is required';
      if (!formData.endTime) newFieldErrors.endTime = 'End time is required';
      if (!formData.discipline) newFieldErrors.discipline = 'Discipline is required';
      if (!formData.visitType) newFieldErrors.visitType = 'Visit type is required';

      // Validate that end time is after start time
      if (formData.startTime && formData.endTime) {
        const startDateTime = new Date(`${formData.visitDate}T${formData.startTime}`);
        const endDateTime = new Date(`${formData.visitDate}T${formData.endTime}`);
        
        if (endDateTime <= startDateTime) {
          newFieldErrors.endTime = 'End time must be after start time';
        }
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }

      // Prepare schedule data
      const scheduleData = {
        patientId: formData.patientId,
        episodeId: formData.episodeId || null,
        staffId: formData.staffId,
        visitDate: new Date(formData.visitDate).toISOString(),
        startTime: new Date(`${formData.visitDate}T${formData.startTime}`).toISOString(),
        endTime: new Date(`${formData.visitDate}T${formData.endTime}`).toISOString(),
        discipline: formData.discipline,
        visitType: formData.visitType,
        notes: formData.notes || null,
      };

      await schedulesApi.createSchedule(scheduleData);
      
      // Show success message
      setSuccessMessage('Visit scheduled successfully!');
      setShowSuccessToast(true);
      
      // Navigate back to patient detail to show the new schedule
      setTimeout(() => {
        navigate(`/patients/${patientId}`);
      }, 1500);
      
    } catch (err: any) {
      console.error('Schedule creation error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle field-specific validation errors
      if (err.response?.status === 400 && err.response?.data?.error?.details) {
        const details = err.response.data.error.details;
        const newFieldErrors: Record<string, string> = {};
        
        // Map server validation errors to field names
        if (details.includes('patientId')) newFieldErrors.patientId = 'Patient ID is required';
        if (details.includes('staffId')) newFieldErrors.staffId = 'Staff member is required';
        if (details.includes('visitDate')) newFieldErrors.visitDate = 'Visit date is required';
        if (details.includes('startTime')) newFieldErrors.startTime = 'Start time is required';
        if (details.includes('endTime')) newFieldErrors.endTime = 'End time is required';
        if (details.includes('discipline')) newFieldErrors.discipline = 'Discipline is required';
        if (details.includes('visitType')) newFieldErrors.visitType = 'Visit type is required';
        
        setFieldErrors(newFieldErrors);
        setError('Please fix the highlighted fields');
      } else {
        // General error message
        let errorMessage = 'Failed to schedule visit';
        
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
          Schedule Visit
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
              {/* Staff Member */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.staffId}>
                  <InputLabel>Staff Member</InputLabel>
                  <Select
                    value={formData.staffId}
                    label="Staff Member"
                    onChange={handleInputChange('staffId')}
                  >
                    {staff.map((member) => (
                      <MenuItem key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} ({member.role})
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.staffId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.staffId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Episode (Optional) */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Episode (Optional)</InputLabel>
                  <Select
                    value={formData.episodeId}
                    label="Episode (Optional)"
                    onChange={handleInputChange('episodeId')}
                  >
                    <MenuItem value="">
                      <em>No Episode</em>
                    </MenuItem>
                    {episodes.map((episode) => (
                      <MenuItem key={episode.id} value={episode.id}>
                        {episode.episodeNumber} - {episode.status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Visit Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Visit Date"
                  type="date"
                  value={formData.visitDate}
                  onChange={handleDateTimeChange('visitDate')}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!fieldErrors.visitDate}
                  helperText={fieldErrors.visitDate}
                />
              </Grid>

              {/* Discipline */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.discipline}>
                  <InputLabel>Discipline</InputLabel>
                  <Select
                    value={formData.discipline}
                    label="Discipline"
                    onChange={handleInputChange('discipline')}
                  >
                    {DISCIPLINES.map((discipline) => (
                      <MenuItem key={discipline.value} value={discipline.value}>
                        {discipline.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.discipline && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.discipline}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Start Time and End Time */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  value={formData.startTime}
                  onChange={handleDateTimeChange('startTime')}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!fieldErrors.startTime}
                  helperText={fieldErrors.startTime}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  value={formData.endTime}
                  onChange={handleDateTimeChange('endTime')}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!fieldErrors.endTime}
                  helperText={fieldErrors.endTime}
                />
              </Grid>

              {/* Visit Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.visitType}>
                  <InputLabel>Visit Type</InputLabel>
                  <Select
                    value={formData.visitType}
                    label="Visit Type"
                    onChange={handleInputChange('visitType')}
                  >
                    {VISIT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.visitType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.visitType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange('notes')}
                  placeholder="Additional notes for this visit..."
                  error={!!fieldErrors.notes}
                  helperText={fieldErrors.notes || "Optional - any additional notes for this visit"}
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
                    {loading ? 'Scheduling...' : 'Schedule Visit'}
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

export default ScheduleVisit;
