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
  Autocomplete,
  Chip,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { qaApi, assessmentsApi } from '../services/api';

interface Document {
  id: string;
  type: string;
  title: string;
  patientName: string;
  episodeNumber?: string;
  createdAt: string;
}

interface Deficiency {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}


const EditQAReview: React.FC = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams<{ reviewId: string }>();
  
  const [formData, setFormData] = useState({
    documentId: '',
    documentType: 'OASIS',
    status: 'PENDING',
    comments: '',
  });
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>([]);
  const [selectedDeficiencies, setSelectedDeficiencies] = useState<Deficiency[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const loadReviewData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await qaApi.getReview(reviewId!);
      const review = response.data.review;
      setFormData({
        documentId: review.documentId || '',
        documentType: review.documentType,
        status: review.status,
        comments: review.comments || ''
      });
      
      if (review.deficiencies) {
        setSelectedDeficiencies(review.deficiencies);
      }
    } catch (err: any) {
      console.error('Error loading review:', err);
      setError('Failed to load review data');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (reviewId) {
      loadReviewData();
    }
  }, [reviewId, loadReviewData]);

  useEffect(() => {
    loadDocuments();
    loadDeficiencies();
  }, []);

  useEffect(() => {
    if (formData.documentType) {
      loadDocumentsByType(formData.documentType);
    }
  }, [formData.documentType]);


  const loadDocuments = async () => {
    try {
      // Load OASIS assessments as documents
      const response = await assessmentsApi.getAssessments();
      const assessments = response.data.assessments.map((assessment: any) => ({
        id: assessment.id,
        type: 'OASIS',
        title: `${assessment.assessmentType} Assessment`,
        patientName: `${assessment.patient.firstName} ${assessment.patient.lastName}`,
        episodeNumber: assessment.episode?.episodeNumber,
        createdAt: assessment.createdAt,
      }));
      setDocuments(assessments);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      setError('Failed to load documents');
    }
  };

  const loadDocumentsByType = async (documentType: string) => {
    try {
      setLoading(true);
      let docs: Document[] = [];
      
      switch (documentType) {
        case 'OASIS':
          const assessmentsResponse = await assessmentsApi.getAssessments();
          docs = assessmentsResponse.data.assessments.map((assessment: any) => ({
            id: assessment.id,
            type: 'OASIS',
            title: `${assessment.assessmentType} Assessment`,
            patientName: `${assessment.patient.firstName} ${assessment.patient.lastName}`,
            episodeNumber: assessment.episode?.episodeNumber,
            createdAt: assessment.createdAt,
          }));
          break;
        case 'VISIT_NOTE':
          // TODO: Load visit notes when available
          docs = [];
          break;
        case 'CARE_PLAN':
          // TODO: Load care plans when available
          docs = [];
          break;
        case 'ORDER':
          // TODO: Load orders when available
          docs = [];
          break;
      }
      
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error loading documents by type:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadDeficiencies = async () => {
    // Mock deficiencies for now - in real app, this would come from API
    const mockDeficiencies: Deficiency[] = [
      { id: '1', category: 'Documentation', description: 'Missing required fields', severity: 'MEDIUM' },
      { id: '2', category: 'Clinical', description: 'Incomplete assessment', severity: 'HIGH' },
      { id: '3', category: 'Compliance', description: 'Signature missing', severity: 'CRITICAL' },
      { id: '4', category: 'Documentation', description: 'Inconsistent data', severity: 'LOW' },
      { id: '5', category: 'Clinical', description: 'Outdated information', severity: 'MEDIUM' },
    ];
    setDeficiencies(mockDeficiencies);
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
    
    if (!formData.documentId) errors.documentId = 'Document is required';
    if (!formData.documentType) errors.documentType = 'Document type is required';
    
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
      
      const reviewData = {
        ...formData,
        deficiencies: selectedDeficiencies.length > 0 ? selectedDeficiencies : null,
      };
      
      await qaApi.updateReview(reviewId!, reviewData);
      
      setSuccessMessage('QA review updated successfully!');
      setShowSuccessToast(true);
      
      // Navigate back to QA page after a short delay
      setTimeout(() => {
        navigate('/qa');
      }, 1500);
      
    } catch (err: any) {
      console.error('Error updating QA review:', err);
      setError(err.response?.data?.message || 'Failed to update QA review');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.documentId) {
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
          onClick={() => navigate('/qa')}
          sx={{ mr: 2 }}
        >
          Back to QA
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Edit QA Review
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
                <FormControl fullWidth error={!!fieldErrors.documentType}>
                  <InputLabel>Document Type *</InputLabel>
                  <Select
                    value={formData.documentType}
                    label="Document Type *"
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                  >
                    <MenuItem value="OASIS">OASIS Assessment</MenuItem>
                    <MenuItem value="VISIT_NOTE">Visit Note</MenuItem>
                    <MenuItem value="CARE_PLAN">Care Plan</MenuItem>
                    <MenuItem value="ORDER">Order</MenuItem>
                  </Select>
                  {fieldErrors.documentType && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.documentType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!fieldErrors.documentId}>
                  <InputLabel>Document *</InputLabel>
                  <Select
                    value={formData.documentId}
                    label="Document *"
                    onChange={(e) => handleInputChange('documentId', e.target.value)}
                    disabled={loading || documents.length === 0}
                    displayEmpty
                  >
                    {loading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading documents...
                      </MenuItem>
                    ) : documents.length === 0 ? (
                      <MenuItem disabled>
                        No {formData.documentType} documents available
                      </MenuItem>
                    ) : (
                      documents.map((doc) => (
                        <MenuItem key={doc.id} value={doc.id}>
                          {doc.title} - {doc.patientName}
                          {doc.episodeNumber && ` (${doc.episodeNumber})`}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                  {fieldErrors.documentId && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {fieldErrors.documentId}
                    </Typography>
                  )}
                  {!loading && documents.length === 0 && formData.documentType && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                      No {formData.documentType} documents found. Try selecting a different document type.
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    label="Status"
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="DEFICIENT">Deficient</MenuItem>
                    <MenuItem value="LOCKED">Locked</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={deficiencies}
                  getOptionLabel={(option) => `${option.category}: ${option.description}`}
                  value={selectedDeficiencies}
                  onChange={(_, newValue) => setSelectedDeficiencies(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={`${option.category}: ${option.description}`}
                        color={option.severity === 'CRITICAL' ? 'error' : 
                               option.severity === 'HIGH' ? 'warning' : 'default'}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Deficiencies (Optional)"
                      placeholder="Select deficiencies found"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Comments"
                  multiline
                  rows={4}
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  placeholder="Enter review comments..."
                />
              </Grid>

              <Grid item xs={12}>
                <Box display="flex" gap={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/qa')}
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
                    {loading ? 'Updating...' : 'Update Review'}
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

export default EditQAReview;
