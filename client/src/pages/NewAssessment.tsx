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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Save as SaveIcon, Person as PersonIcon } from '@mui/icons-material';
import { assessmentsApi, patientsApi, episodesApi } from '../services/api';

const ASSESSMENT_TYPES = [
  { value: 'SOC', label: 'Start of Care (SOC)' },
  { value: 'ROC', label: 'Resumption of Care (ROC)' },
  { value: 'RECERT', label: 'Recertification' },
  { value: 'TRANSFER', label: 'Transfer' },
  { value: 'DISCHARGE', label: 'Discharge' },
];

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
  startDate: string;
  endDate?: string;
}

const NewAssessment: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    episodeId: '',
    assessmentType: 'SOC',
    assessmentDate: new Date().toISOString().split('T')[0],
    formData: {
      // Basic OASIS form fields
      m0010: '', // Assessment reason
      m0020: '', // Patient ID
      m0030: '', // Assessment date
      m0040: '', // Patient name
      m0050: '', // Patient address
      m0060: '', // Patient phone
      m0063: '', // Patient email
      m0065: '', // Patient DOB
      m0066: '', // Patient gender
      m0069: '', // Patient race
      m0070: '', // Patient ethnicity
      m0080: '', // Patient language
      m0090: '', // Patient living situation
      m0100: '', // Patient marital status
      m0110: '', // Patient education
      m0120: '', // Patient employment
      m0130: '', // Patient insurance
      m0140: '', // Patient primary diagnosis
      m0150: '', // Patient secondary diagnosis
      m0160: '', // Patient medications
      m0170: '', // Patient allergies
      m0180: '', // Patient functional status
      m0190: '', // Patient cognitive status
      m0200: '', // Patient behavioral status
      m0210: '', // Patient sensory status
      m0220: '', // Patient integumentary status
      m0230: '', // Patient respiratory status
      m0240: '', // Patient cardiovascular status
      m0250: '', // Patient neurological status
      m0260: '', // Patient musculoskeletal status
      m0270: '', // Patient genitourinary status
      m0280: '', // Patient gastrointestinal status
      m0290: '', // Patient endocrine status
      m0300: '', // Patient hematologic status
      m0310: '', // Patient immunologic status
      m0320: '', // Patient psychiatric status
      m0330: '', // Patient substance abuse
      m0340: '', // Patient social status
      m0350: '', // Patient environmental status
      m0360: '', // Patient safety status
      m0370: '', // Patient care plan
      m0380: '', // Patient goals
      m0390: '', // Patient interventions
      m0400: '', // Patient outcomes
      m0410: '', // Patient discharge planning
      m0420: '', // Patient follow-up
      m0430: '', // Patient summary
      m0440: '', // Patient recommendations
      m0450: '', // Patient notes
    }
  });

  // Load patient data and related information on component mount
  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
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
        
        // Set default values and pre-populate patient info
        setFormData(prev => ({
          ...prev,
          patientId: patientData.id, // Use the database ID for the relationship
          episodeId: episodesResponse.data.episodes?.[0]?.id || '',
          formData: {
            ...prev.formData,
            m0040: `${patientData.firstName} ${patientData.lastName}`,
            m0065: patientData.dateOfBirth ? new Date(patientData.dateOfBirth).toISOString().split('T')[0] : '',
            m0066: patientData.gender === 'MALE' ? '1' : patientData.gender === 'FEMALE' ? '2' : '',
            m0060: patientData.phoneNumber || '',
            m0050: patientData.address || '',
          }
        }));
        
      } catch (err: any) {
        console.error('Error loading data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
      } finally {
        setInitialLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  // Update form data when patientId changes
  useEffect(() => {
    if (patientId) {
      setFormData(prev => ({
        ...prev,
        patientId: patientId
      }));
    }
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

  const handleFormDataChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: event.target.value
      }
    }));
  };

  const handlePatientSelect = (selectedPatient: Patient) => {
    setShowPatientDialog(false);
    navigate(`/assessments/new/${selectedPatient.id}`);
  };

  const handleClosePatientDialog = () => {
    setShowPatientDialog(false);
    setPatients([]);
  };

  const handleShowPatientDialog = async () => {
    try {
      setPatientsLoading(true);
      setShowPatientDialog(true);
      
      // Fetch patients for selection
      const response = await patientsApi.getPatients({ page: 1, limit: 100 });
      setPatients(response.data.patients);
    } catch (err: any) {
      setError('Failed to load patients for assessment');
      console.error('Error loading patients:', err);
    } finally {
      setPatientsLoading(false);
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
      
      if (!formData.patientId) newFieldErrors.patientId = 'Patient is required';
      if (!formData.assessmentType) newFieldErrors.assessmentType = 'Assessment type is required';
      if (!formData.assessmentDate) newFieldErrors.assessmentDate = 'Assessment date is required';

      // Check if formData has any content
      const hasFormData = Object.values(formData.formData).some(value => value && value.toString().trim() !== '');
      if (!hasFormData) {
        newFieldErrors.formData = 'Please fill in at least one assessment field';
        console.log('Form data validation failed - no content:', formData.formData);
      }

      // Ensure patient name is filled if patient is selected
      if (formData.patientId && !formData.formData.m0040) {
        newFieldErrors.patientName = 'Please enter patient name';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
        setLoading(false);
        return;
      }

      // Prepare assessment data
      const assessmentData = {
        patientId: formData.patientId,
        episodeId: formData.episodeId || null,
        assessmentType: formData.assessmentType,
        assessmentDate: new Date(formData.assessmentDate),
        formData: formData.formData,
      };

      console.log('Sending assessment data:', assessmentData);
      console.log('Assessment date:', formData.assessmentDate);
      console.log('Converted date:', new Date(formData.assessmentDate).toISOString());
      
      await assessmentsApi.createAssessment(assessmentData);
      
      // Show success message
      setSuccessMessage('Assessment created successfully!');
      setShowSuccessToast(true);
      
      // Navigate back to assessments list
      setTimeout(() => {
        navigate('/assessments');
      }, 1500);
      
    } catch (err: any) {
      console.error('Assessment creation error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle field-specific validation errors
      if (err.response?.status === 400 && err.response?.data?.error) {
        const errorData = err.response.data.error;
        const newFieldErrors: Record<string, string> = {};
        
        // Handle detailed validation errors
        if (errorData.details && Array.isArray(errorData.details)) {
          errorData.details.forEach((detail: any) => {
            const field = detail.field;
            const message = detail.message;
            
            // Map server field names to frontend field names
            if (field === 'patientId') newFieldErrors.patientId = message;
            else if (field === 'assessmentType') newFieldErrors.assessmentType = message;
            else if (field === 'assessmentDate') newFieldErrors.assessmentDate = message;
            else if (field === 'formData') newFieldErrors.formData = message;
            else if (field.startsWith('formData.')) {
              const formField = field.replace('formData.', '');
              if (formField === 'm0040') newFieldErrors.patientName = message;
            }
          });
        } else {
          // Fallback for simple error messages
          const details = errorData.details || errorData.message || '';
          if (details.includes('patientId')) newFieldErrors.patientId = 'Patient is required';
          if (details.includes('assessmentType')) newFieldErrors.assessmentType = 'Assessment type is required';
          if (details.includes('assessmentDate')) newFieldErrors.assessmentDate = 'Assessment date is required';
          if (details.includes('formData')) newFieldErrors.formData = 'Please fill in at least one assessment field';
        }
        
        setFieldErrors(newFieldErrors);
        setError(errorData.message || 'Please fix the highlighted fields');
      } else {
        // General error message
        let errorMessage = 'Failed to create assessment';
        
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
            onClick={() => navigate('/assessments')}
            sx={{ mr: 2 }}
          >
            Back to Assessments
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
          onClick={() => navigate('/assessments')}
          sx={{ mr: 2 }}
        >
          Back to Assessments
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          New OASIS Assessment
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
              {/* Patient Selection */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.patientId}>
                  <InputLabel>Patient</InputLabel>
                  <Select
                    value={formData.patientId}
                    label="Patient"
                    onChange={handleInputChange('patientId')}
                    disabled={!!patientId} // Disable if patient is pre-selected
                  >
                    {patient ? (
                      <MenuItem value={patient.id}>
                        {patient.firstName} {patient.lastName} ({patient.patientId})
                      </MenuItem>
                    ) : (
                      <MenuItem value="" onClick={handleShowPatientDialog}>
                        <em>Select Patient</em>
                      </MenuItem>
                    )}
                  </Select>
                  {fieldErrors.patientId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.patientId}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Episode Selection */}
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

              {/* Assessment Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required error={!!fieldErrors.assessmentType}>
                  <InputLabel>Assessment Type</InputLabel>
                  <Select
                    value={formData.assessmentType}
                    label="Assessment Type"
                    onChange={handleInputChange('assessmentType')}
                  >
                    {ASSESSMENT_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldErrors.assessmentType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                      {fieldErrors.assessmentType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Assessment Date */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assessment Date"
                  type="date"
                  value={formData.assessmentDate}
                  onChange={handleInputChange('assessmentDate')}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={!!fieldErrors.assessmentDate}
                  helperText={fieldErrors.assessmentDate}
                />
              </Grid>

              {/* OASIS Form Fields - Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Patient Information
                </Typography>
                {fieldErrors.formData && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {fieldErrors.formData}
                  </Alert>
                )}
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Patient Name"
                  value={formData.formData.m0040}
                  onChange={handleFormDataChange('m0040')}
                  placeholder="Enter patient's full name"
                  error={!!fieldErrors.patientName}
                  helperText={fieldErrors.patientName}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={formData.formData.m0065}
                  onChange={handleFormDataChange('m0065')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    value={formData.formData.m0066}
                    label="Gender"
                    onChange={handleFormDataChange('m0066')}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="1">Male</MenuItem>
                    <MenuItem value="2">Female</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.formData.m0060}
                  onChange={handleFormDataChange('m0060')}
                  placeholder="(555) 123-4567"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  value={formData.formData.m0050}
                  onChange={handleFormDataChange('m0050')}
                  placeholder="Enter patient's address"
                />
              </Grid>

              {/* Assessment Reason */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
                  Assessment Details
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Assessment Reason"
                  multiline
                  rows={3}
                  value={formData.formData.m0010}
                  onChange={handleFormDataChange('m0010')}
                  placeholder="Describe the reason for this assessment..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Primary Diagnosis"
                  value={formData.formData.m0140}
                  onChange={handleFormDataChange('m0140')}
                  placeholder="Enter primary diagnosis"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Secondary Diagnosis"
                  value={formData.formData.m0150}
                  onChange={handleFormDataChange('m0150')}
                  placeholder="Enter secondary diagnosis (if any)"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Current Medications"
                  multiline
                  rows={3}
                  value={formData.formData.m0160}
                  onChange={handleFormDataChange('m0160')}
                  placeholder="List current medications..."
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies"
                  multiline
                  rows={2}
                  value={formData.formData.m0170}
                  onChange={handleFormDataChange('m0170')}
                  placeholder="List known allergies..."
                />
              </Grid>

              {/* Action Buttons */}
              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/assessments')}
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
                    {loading ? 'Creating...' : 'Create Assessment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Patient Selection Dialog */}
      <Dialog 
        open={showPatientDialog} 
        onClose={handleClosePatientDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <PersonIcon sx={{ mr: 1 }} />
            Select Patient for Assessment
          </Box>
        </DialogTitle>
        <DialogContent>
          {patientsLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {patients.map((patient, index) => (
                <React.Fragment key={patient.id}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handlePatientSelect(patient)}>
                      <ListItemText
                        primary={`${patient.firstName} ${patient.lastName}`}
                        secondary={`Patient ID: ${patient.patientId}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < patients.length - 1 && <Divider />}
                </React.Fragment>
              ))}
              {patients.length === 0 && !patientsLoading && (
                <ListItem>
                  <ListItemText 
                    primary="No patients found" 
                    secondary="No patients available for assessment"
                  />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePatientDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

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

export default NewAssessment;
