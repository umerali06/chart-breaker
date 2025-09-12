import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Box,
  Typography,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { documentsApi } from '../../services/api';
import PatientSelector from '../Patient/PatientSelector';

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  documentType: string;
  description?: string;
  uploadedBy: string;
  createdAt: string;
  uploadedByUser: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patientId?: string;
  document?: Document | null;
  mode: 'upload' | 'edit';
}

const DocumentForm: React.FC<DocumentFormProps> = ({
  open,
  onClose,
  onSuccess,
  patientId,
  document,
  mode
}) => {
  const [formData, setFormData] = useState({
    documentType: '',
    description: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [documentTypes, setDocumentTypes] = useState<Array<{value: string, label: string}>>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(patientId);

  useEffect(() => {
    if (open) {
      fetchDocumentTypes();
      if (mode === 'edit' && document) {
        setFormData({
          documentType: document.documentType,
          description: document.description || ''
        });
        setSelectedPatientId(patientId);
      } else {
        setFormData({
          documentType: '',
          description: ''
        });
        setSelectedPatientId(patientId);
      }
      setFile(null);
      setError('');
      setErrors([]);
    }
  }, [open, mode, document, patientId]);

  const fetchDocumentTypes = async () => {
    try {
      const response = await documentsApi.getDocumentTypes();
      setDocumentTypes(response.data.data);
    } catch (err) {
      console.error('Error fetching document types:', err);
    }
  };

  const handleChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Check file size (10MB limit)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setErrors([]);

    try {
      if (mode === 'upload') {
        if (!file) {
          setError('Please select a file to upload');
          setLoading(false);
          return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('file', file);
        if (selectedPatientId) {
          formDataToSend.append('patientId', selectedPatientId);
        }
        formDataToSend.append('documentType', formData.documentType);
        if (formData.description) {
          formDataToSend.append('description', formData.description);
        }

        await documentsApi.uploadDocument(formDataToSend);
      } else if (mode === 'edit' && document) {
        await documentsApi.updateDocument(document.id, formData);
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        setErrors(errorData.errors);
        setError(errorData.message || 'Please fix the following errors:');
      } else {
        setError(errorData?.message || err.message || 'Failed to save document');
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            {mode === 'upload' ? <UploadIcon /> : <EditIcon />}
            {mode === 'upload' ? 'Upload Document' : 'Edit Document'}
          </Box>
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

          {mode === 'upload' && !patientId && (
            <Box sx={{ mb: 3 }}>
              <PatientSelector
                selectedPatientId={selectedPatientId}
                onPatientSelect={(patient) => setSelectedPatientId(patient?.id)}
                label="Select Patient *"
                error={!!error && error.includes('PatientId is required')}
                helperText={!!error && error.includes('PatientId is required') ? 'Patient is required' : ''}
              />
            </Box>
          )}

          {mode === 'upload' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select File *
              </Typography>
              <input
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif"
                style={{ display: 'none' }}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="file-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<UploadIcon />}
                  sx={{ mb: 1 }}
                >
                  Choose File
                </Button>
              </label>
              {file && (
                <Box sx={{ mt: 1 }}>
                  <Chip
                    label={`${file.name} (${formatFileSize(file.size)})`}
                    onDelete={() => setFile(null)}
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Supported formats: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG, PNG, GIF (Max 10MB)
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Document Type *</InputLabel>
            <Select
              value={formData.documentType}
              onChange={handleChange('documentType')}
              label="Document Type *"
              required
            >
              {documentTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Description"
            value={formData.description}
            onChange={handleChange('description')}
            multiline
            rows={3}
            placeholder="Optional description of the document"
            helperText="Maximum 500 characters"
            inputProps={{ maxLength: 500 }}
          />

          {loading && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (mode === 'upload' && !file)}
            startIcon={mode === 'upload' ? <UploadIcon /> : <EditIcon />}
          >
            {loading ? 'Saving...' : (mode === 'upload' ? 'Upload Document' : 'Update Document')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentForm;
