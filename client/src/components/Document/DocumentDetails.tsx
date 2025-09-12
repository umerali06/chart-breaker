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
  IconButton,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

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
  updatedAt: string;
  patient: {
    firstName: string;
    lastName: string;
    patientId: string;
  };
  uploadedByUser: {
    firstName: string;
    lastName: string;
  };
}

interface DocumentDetailsProps {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDownload: () => void;
  document: Document | null;
  canEdit: boolean;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({
  open,
  onClose,
  onEdit,
  onDownload,
  document,
  canEdit
}) => {
  if (!document) return null;


  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
    if (fileType.includes('text')) return '📄';
    return '📄';
  };

  const getDocumentTypeLabel = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'OASIS': 'OASIS Assessment',
      'VISIT_NOTE': 'Visit Note',
      'CARE_PLAN': 'Care Plan',
      'ORDER': 'Order',
      'MEDICAL_RECORD': 'Medical Record',
      'INSURANCE_CARD': 'Insurance Card',
      'IDENTIFICATION': 'Identification',
      'CONSENT_FORM': 'Consent Form',
      'ASSESSMENT': 'Assessment',
      'PHYSICIAN_ORDER': 'Physician Order',
      'LAB_RESULT': 'Lab Result',
      'IMAGING': 'Imaging',
      'OTHER': 'Other'
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            <DocumentIcon />
            <Typography variant="h6">
              Document Details
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3}>
          {/* File Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              File Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              File Name
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {getFileIcon(document.fileType)} {document.originalName}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Document Type
            </Typography>
            <Chip
              label={getDocumentTypeLabel(document.documentType)}
              color="primary"
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              File Size
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formatFileSize(document.fileSize)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              File Type
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {document.fileType}
            </Typography>
          </Grid>

          {/* Patient Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
              Patient Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Patient Name
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {document.patient ? `${document.patient.firstName} ${document.patient.lastName}` : 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Patient ID
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
              {document.patient ? document.patient.patientId : 'N/A'}
            </Typography>
          </Grid>

          {/* Description */}
          {document.description && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {document.description}
              </Typography>
            </Grid>
          )}

          {/* System Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 2 }}>
              System Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Uploaded By
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {document.uploadedByUser ? `${document.uploadedByUser.firstName} ${document.uploadedByUser.lastName}` : 'N/A'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Upload Date
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formatDate(document.createdAt)}
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Last Modified
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formatDate(document.updatedAt)}
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        <Button
          onClick={onDownload}
          variant="outlined"
          startIcon={<DownloadIcon />}
        >
          Download
        </Button>
        {canEdit && (
          <Button
            onClick={onEdit}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit Document
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDetails;
