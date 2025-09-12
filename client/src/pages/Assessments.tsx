import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  IconButton,
  Tooltip,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Person as PersonIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { assessmentsApi, patientsApi } from '../services/api';

interface Assessment {
  id: string;
  assessmentType: string;
  assessmentDate: string;
  isSigned: boolean;
  signedAt?: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  episode: {
    id: string;
    episodeNumber: string;
  };
  clinician: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
}

const Assessments: React.FC = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showPatientDialog, setShowPatientDialog] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [signingAssessment, setSigningAssessment] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const fetchAssessments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await assessmentsApi.getAssessments({
        page,
        limit: 10,
        search: searchTerm,
        assessmentType: typeFilter,
      });
      setAssessments(response.data.assessments);
      setTotalPages(response.data.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, typeFilter]);

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'SOC':
        return 'primary';
      case 'ROC':
        return 'secondary';
      case 'RECERT':
        return 'success';
      case 'TRANSFER':
        return 'warning';
      case 'DISCHARGE':
        return 'error';
      default:
        return 'default';
    }
  };

  const handleNewAssessmentClick = async () => {
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

  const handlePatientSelect = (patient: Patient) => {
    setShowPatientDialog(false);
    navigate(`/assessments/new/${patient.id}`);
  };

  const handleClosePatientDialog = () => {
    setShowPatientDialog(false);
    setPatients([]);
  };

  const handleSignAssessment = async (assessmentId: string) => {
    try {
      setSigningAssessment(assessmentId);
      await assessmentsApi.signAssessment(assessmentId);
      
      setSuccessMessage('Assessment signed successfully!');
      setShowSuccessToast(true);
      
      // Refresh the assessments list
      fetchAssessments();
    } catch (err: any) {
      console.error('Error signing assessment:', err);
      setError(err.response?.data?.message || 'Failed to sign assessment');
    } finally {
      setSigningAssessment(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%',
      overflow: 'hidden',
      minWidth: 0,
      boxSizing: 'border-box'
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          OASIS Assessments
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleNewAssessmentClick}
        >
          New Assessment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ 
        width: '100%', 
        maxWidth: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        <CardContent sx={{ 
          width: '100%', 
          overflow: 'hidden',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box'
        }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search assessments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="SOC">SOC</MenuItem>
                  <MenuItem value="ROC">ROC</MenuItem>
                  <MenuItem value="RECERT">Recertification</MenuItem>
                  <MenuItem value="TRANSFER">Transfer</MenuItem>
                  <MenuItem value="DISCHARGE">Discharge</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            boxSizing: 'border-box',
            minWidth: 0
          }}>
            <TableContainer 
              component={Paper} 
              sx={{ 
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto',
                overflowY: 'visible',
                display: 'block',
                maxHeight: 'none',
                minWidth: 0,
                '& .MuiTable-root': {
                  minWidth: 800,
                  width: 'max-content'
                },
                '&::-webkit-scrollbar': {
                  height: '8px',
                  width: '8px'
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#c1c1c1',
                  borderRadius: '4px',
                  '&:hover': {
                    backgroundColor: '#a8a8a8',
                  },
                },
              }}
            >
              <Table sx={{ 
                minWidth: 800,
                tableLayout: 'auto',
                width: 'max-content'
              }}>
              <TableHead>
                <TableRow>
                  <TableCell>Assessment Type</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Episode</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Clinician</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Signed Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assessments.map((assessment) => (
                  <TableRow key={assessment.id} hover>
                    <TableCell>
                      <Chip
                        label={assessment.assessmentType}
                        color={getTypeColor(assessment.assessmentType) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {assessment.patient.firstName} {assessment.patient.lastName}
                    </TableCell>
                    <TableCell>{assessment.episode?.episodeNumber || '-'}</TableCell>
                    <TableCell>{formatDate(assessment.assessmentDate)}</TableCell>
                    <TableCell>
                      {assessment.clinician.firstName} {assessment.clinician.lastName}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={assessment.isSigned ? 'Signed' : 'Draft'}
                        color={assessment.isSigned ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {assessment.signedAt ? formatDate(assessment.signedAt) : '-'}
                    </TableCell>
                    <TableCell>
                      {assessment.isSigned ? (
                        <Tooltip title="Assessment Signed">
                          <CheckCircleIcon 
                            color="success" 
                            sx={{ fontSize: 24 }}
                          />
                        </Tooltip>
                      ) : (
                        <Tooltip title="Sign Assessment">
                          <IconButton
                            size="small"
                            onClick={() => handleSignAssessment(assessment.id)}
                            disabled={signingAssessment === assessment.id}
                            color="primary"
                          >
                            {signingAssessment === assessment.id ? (
                              <CircularProgress size={20} />
                            ) : (
                              <EditIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
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

export default Assessments;
