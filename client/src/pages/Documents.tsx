import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem as SelectMenuItem,
  Grid,
  Alert,
  CircularProgress,
  TablePagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Description as DocumentIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { documentsApi } from '../services/api';
import { formatDate } from '../utils/dateUtils';
import DocumentForm from '../components/Document/DocumentForm';
import DocumentDetails from '../components/Document/DocumentDetails';
import PatientSelector from '../components/Patient/PatientSelector';

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
    id: string;
    firstName: string;
    lastName: string;
    patientId: string;
  };
  uploadedByUser: {
    firstName: string;
    lastName: string;
  };
}

const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentTypeFilter, setDocumentTypeFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [documentTypes, setDocumentTypes] = useState<string[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        documentType: documentTypeFilter,
        patientId: patientFilter,
      };

      const response = await documentsApi.getDocuments('', params);
      
      
      setDocuments(response.data.data || []);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      setError('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, documentTypeFilter, patientFilter]);

  useEffect(() => {
    fetchDocuments();
    fetchDocumentTypes();
  }, [fetchDocuments]);

  const fetchDocumentTypes = async () => {
    try {
      const response = await documentsApi.getDocumentTypes();
      const types = response.data.data || [];
      // Handle both string arrays and object arrays with value/label
      if (Array.isArray(types)) {
        const stringTypes = types.map(type => {
          if (typeof type === 'string') {
            return type;
          } else if (type && typeof type === 'object' && type.value) {
            return type.value;
          }
          return String(type);
        }).filter(type => type);
        setDocumentTypes(stringTypes);
      } else {
        setDocumentTypes([]);
      }
    } catch (err) {
      console.error('Error fetching document types:', err);
      setDocumentTypes([]);
    }
  };


  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'documentType') {
      setDocumentTypeFilter(value);
    } else if (filterType === 'patient') {
      setPatientFilter(value);
    }
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, document: Document) => {
    setMenuAnchor(event.currentTarget);
    setSelectedDocument(document);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedDocument(null);
  };

  const handleUploadDocument = () => {
    setEditingDocument(null);
    setFormOpen(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setFormOpen(true);
    handleMenuClose();
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingDocument(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchDocuments(); // Refresh the documents list
  };

  const handleDetailsClose = () => {
    setDetailsOpen(false);
    setViewingDocument(null);
  };

  const handleViewDocument = async () => {
    if (selectedDocument) {
      try {
        // Fetch full document details with patient information
        const response = await documentsApi.getDocument(selectedDocument.id);
        setViewingDocument(response.data.data);
        setDetailsOpen(true);
      } catch (error: any) {
        console.error('Error fetching document details:', error);
        // Fallback to using the selected document if fetch fails
        setViewingDocument(selectedDocument);
        setDetailsOpen(true);
      }
    }
    handleMenuClose();
  };

  const handleDownloadDocument = async () => {
    if (selectedDocument) {
      try {
        const response = await documentsApi.downloadDocument(selectedDocument.id);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', selectedDocument.originalName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err: any) {
        console.error('Error downloading document:', err);
        alert('Failed to download document');
      }
    }
    handleMenuClose();
  };

  const handleDeleteDocument = async () => {
    if (selectedDocument && window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentsApi.deleteDocument(selectedDocument.id);
        fetchDocuments();
        alert('Document deleted successfully');
      } catch (err: any) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
    handleMenuClose();
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('excel')) return '📊';
    if (fileType.includes('powerpoint')) return '📊';
    return '📄';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DocumentIcon color="primary" />
          Documents
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleUploadDocument}
        >
          Upload Document
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search documents..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Document Type</InputLabel>
                <Select
                  value={documentTypeFilter}
                  onChange={(e) => handleFilterChange('documentType', e.target.value)}
                  label="Document Type"
                >
                  <SelectMenuItem value="">All Types</SelectMenuItem>
                  {documentTypes.map((type) => (
                    <SelectMenuItem key={type} value={type}>
                      {typeof type === 'string' ? type.replace('_', ' ') : String(type)}
                    </SelectMenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <PatientSelector
                selectedPatientId={patientFilter}
                onPatientSelect={(patient) => handleFilterChange('patient', patient?.id || '')}
                label="Filter by Patient"
                allowClear
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setDocumentTypeFilter('');
                  setPatientFilter('');
                  setPage(0);
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : documents.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <DocumentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No documents found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {searchTerm || documentTypeFilter || patientFilter
                  ? 'Try adjusting your search criteria'
                  : 'Upload documents to get started'
                }
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Document</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Uploaded By</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((document) => (
                      <TableRow key={document.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {getFileIcon(document.fileType)}
                            </Typography>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {document.originalName}
                              </Typography>
                              {document.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {document.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={typeof document.documentType === 'string' ? document.documentType.replace('_', ' ') : String(document.documentType)}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            <Box>
                              <Typography variant="body2">
                                {document.patient.firstName} {document.patient.lastName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {document.patient.patientId}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {document.uploadedByUser.firstName} {document.uploadedByUser.lastName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(document.createdAt)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StorageIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatFileSize(document.fileSize)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            onClick={(e) => handleMenuOpen(e, document)}
                            size="small"
                          >
                            <MoreIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={totalCount}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDocument}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedDocument && handleEditDocument(selectedDocument)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadDocument}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteDocument} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Document Form Dialog */}
      <DocumentForm
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        document={editingDocument}
        patientId={editingDocument?.patient?.id}
        mode={editingDocument ? 'edit' : 'upload'}
      />

      <DocumentDetails
        open={detailsOpen}
        onClose={handleDetailsClose}
        document={viewingDocument}
        onEdit={() => {
          if (viewingDocument) {
            handleEditDocument(viewingDocument);
            handleDetailsClose();
          }
        }}
        onDownload={() => {
          if (viewingDocument) {
            handleDownloadDocument();
          }
        }}
        canEdit={true}
      />
    </Box>
  );
};

export default Documents;
