import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Grid,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon2,
} from '@mui/icons-material';
import { patientsApi, referralsApi, documentsApi } from '../services/api';
import ReferralForm from '../components/Referral/ReferralForm';
import DocumentForm from '../components/Document/DocumentForm';
import DocumentDetails from '../components/Document/DocumentDetails';

interface Patient {
  id: string;
  patientId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone?: string;
  email?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  episodes: Array<{
    id: string;
    episodeNumber: string;
    status: string;
    startDate: string;
    endDate?: string;
    disciplines: string[];
  }>;
  referrals?: Array<{
    id: string;
    referralSource?: string;
    referralDate: string;
    referralReason?: string;
    physicianName?: string;
    physicianNpi?: string;
  }>;
  schedules?: Array<{
    id: string;
    visitDate: string;
    startTime: string;
    endTime: string;
    discipline: string;
    visitType: string;
    status: string;
    staff?: {
      firstName: string;
      lastName: string;
    };
  }>;
  oasisAssessments?: Array<{
    id: string;
    assessmentType: string;
    assessmentDate: string;
    isSigned: boolean;
    signedAt?: string;
    clinician?: {
      firstName: string;
      lastName: string;
    };
  }>;
  _count?: {
    episodes: number;
    schedules: number;
  };
}

interface PatientDocument {
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientDetail: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);
  const [referralFormOpen, setReferralFormOpen] = useState(false);
  const [editingReferral, setEditingReferral] = useState<any>(null);
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentFormOpen, setDocumentFormOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<PatientDocument | null>(null);
  const [documentDetailsOpen, setDocumentDetailsOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<PatientDocument | null>(null);

  const fetchPatient = useCallback(async () => {
    try {
      setLoading(true);
      const response = await patientsApi.getPatient(patientId!);
      console.log('Patient data received:', response.data.patient);
      console.log('Episodes count:', response.data.patient.episodes?.length || 0);
      console.log('Episodes data:', response.data.patient.episodes);
      console.log('Referrals count:', response.data.patient.referrals?.length || 0);
      console.log('Referrals data:', response.data.patient.referrals);
      setPatient(response.data.patient);
      
      // Initialize referrals from patient data if available
      if (response.data.patient.referrals) {
        setReferrals(response.data.patient.referrals);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId, fetchPatient]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    if (newValue === 2) { // Referrals tab
      fetchReferrals();
    } else if (newValue === 4) { // Documents tab
      fetchDocuments();
    }
  };

  const fetchReferrals = async () => {
    if (!patientId) return;
    
    try {
      setReferralLoading(true);
      console.log('Fetching referrals for patient:', patientId);
      const response = await referralsApi.getReferralsByPatient(patientId);
      console.log('Referrals API response:', response.data);
      console.log('Referrals data:', response.data.data);
      setReferrals(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching referrals:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setReferralLoading(false);
    }
  };

  const fetchDocuments = async () => {
    if (!patientId) return;
    
    try {
      setDocumentLoading(true);
      console.log('Fetching documents for patient:', patientId);
      const response = await documentsApi.getDocuments(patientId);
      console.log('Documents API response:', response.data);
      console.log('Documents data:', response.data.data);
      setDocuments(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching documents:', err);
      console.error('Error response:', err.response?.data);
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleAddReferral = () => {
    setEditingReferral(null);
    setReferralFormOpen(true);
  };

  const handleEditReferral = (referral: any) => {
    setEditingReferral(referral);
    setReferralFormOpen(true);
  };

  const handleDeleteReferral = async (referralId: string) => {
    if (window.confirm('Are you sure you want to delete this referral?')) {
      try {
        await referralsApi.deleteReferral(referralId);
        fetchReferrals();
      } catch (err: any) {
        console.error('Error deleting referral:', err);
        alert('Failed to delete referral');
      }
    }
  };

  const handleReferralSuccess = () => {
    fetchReferrals();
  };

  const handleAddDocument = () => {
    setEditingDocument(null);
    setDocumentFormOpen(true);
  };

  const handleEditDocument = (document: PatientDocument) => {
    setEditingDocument(document);
    setDocumentFormOpen(true);
  };

  const handleViewDocument = async (document: PatientDocument) => {
    try {
      // Fetch full document details with patient information
      const response = await documentsApi.getDocument(document.id);
      setViewingDocument(response.data.data);
      setDocumentDetailsOpen(true);
    } catch (error: any) {
      console.error('Error fetching document details:', error);
      // Fallback to using the document from the list if fetch fails
      setViewingDocument(document);
      setDocumentDetailsOpen(true);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentsApi.deleteDocument(documentId);
        fetchDocuments();
      } catch (err: any) {
        console.error('Error deleting document:', err);
        alert('Failed to delete document');
      }
    }
  };

  const handleDownloadDocument = async (doc: PatientDocument) => {
    try {
      const response = await documentsApi.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading document:', err);
      alert('Failed to download document');
    }
  };

  const handleDocumentSuccess = () => {
    fetchDocuments();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'DISCHARGED':
        return 'default';
      case 'SUSPENDED':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!patient) {
    return (
      <Alert severity="error">
        Patient not found
      </Alert>
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
          {patient.firstName} {patient.lastName}
        </Typography>
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
            onClick={() => navigate(`/patients/${patient.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              if (patient?.id) {
                navigate(`/episodes/new/${patient.id}`);
              } else {
                console.error('Patient ID is undefined');
              }
            }}
            sx={{ mr: 1 }}
          >
            New Episode
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              if (patient?.id) {
                navigate(`/schedules/new/${patient.id}`);
              } else {
                console.error('Patient ID is undefined');
              }
            }}
            sx={{ mr: 1 }}
          >
            Schedule Visit
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              if (patient?.id) {
                navigate(`/assessments/new/${patient.id}`);
              } else {
                console.error('Patient ID is undefined');
              }
            }}
            sx={{ mr: 1 }}
          >
            New Assessment
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              if (patient?.id) {
                navigate(`/billing/new/${patient.id}`);
              } else {
                console.error('Patient ID is undefined');
              }
            }}
          >
            New Claim
          </Button>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Patient ID:</strong> {patient.patientId}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Date of Birth:</strong> {formatDate(patient.dateOfBirth)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Gender:</strong> {patient.gender}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Phone:</strong> {patient.phone || 'Not provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {patient.email || 'Not provided'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Address
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.addressLine1 || 'Not provided'}
                {patient.city && `, ${patient.city}`}
                {patient.state && `, ${patient.state}`}
                {patient.zipCode && ` ${patient.zipCode}`}
              </Typography>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Emergency Contact
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.emergencyContactName || 'Not provided'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {patient.emergencyContactPhone || 'Not provided'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Episodes" />
            <Tab label="Assessments" />
            <Tab label="Referrals" />
            <Tab label="Visits" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
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
                  minWidth: 600,
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
                minWidth: 600,
                tableLayout: 'auto',
                width: 'max-content'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Episode Number</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Start Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>End Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Disciplines</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.episodes && patient.episodes.length > 0 ? (
                    patient.episodes.map((episode) => (
                      <TableRow key={episode.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {episode.episodeNumber}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(episode.startDate)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {episode.endDate ? formatDate(episode.endDate) : '-'}
                        </TableCell>
                        <TableCell>
                          {episode.disciplines.map((discipline) => (
                            <Chip
                              key={discipline}
                              label={discipline}
                              size="small"
                              sx={{ mr: 0.5 }}
                            />
                          ))}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={episode.status}
                            color={getStatusColor(episode.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No episodes found for this patient
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
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
                  minWidth: 600,
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
                minWidth: 600,
                tableLayout: 'auto',
                width: 'max-content'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Assessment Type</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Clinician</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Status</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Signed Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.oasisAssessments && patient.oasisAssessments.length > 0 ? (
                    patient.oasisAssessments.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={assessment.assessmentType}
                            color={getStatusColor(assessment.assessmentType) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(assessment.assessmentDate)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {assessment.clinician?.firstName} {assessment.clinician?.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={assessment.isSigned ? 'Signed' : 'Draft'}
                            color={assessment.isSigned ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {assessment.signedAt ? formatDate(assessment.signedAt) : '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No assessments found for this patient
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Patient Referrals
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddReferral}
            >
              Add Referral
            </Button>
          </Box>
          
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
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Referral Source</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Physician</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>NPI</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Reason</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {referralLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : referrals && referrals.length > 0 ? (
                    referrals.map((referral) => {
                      console.log('Rendering referral:', referral);
                      return (
                        <TableRow key={referral.id}>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {referral.referralSource || '-'}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {formatDate(referral.referralDate)}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {referral.physicianName || '-'}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            {referral.physicianNpi || '-'}
                          </TableCell>
                          <TableCell sx={{ 
                            whiteSpace: 'nowrap', 
                            maxWidth: 200, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {referral.referralReason || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              startIcon={<EditIcon2 />}
                              onClick={() => handleEditReferral(referral)}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDeleteReferral(referral.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No referrals found for this patient
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Referrals count: {referrals?.length || 0}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assessment Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Clinician</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Signed Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient.oasisAssessments && patient.oasisAssessments.length > 0 ? (
                  patient.oasisAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell>
                        <Chip
                          label={assessment.assessmentType}
                          color={getStatusColor(assessment.assessmentType) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(assessment.assessmentDate)}</TableCell>
                      <TableCell>
                        {assessment.clinician?.firstName} {assessment.clinician?.lastName}
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
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No assessments found for this patient
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
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
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Time</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Discipline</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Visit Type</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Staff</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.schedules && patient.schedules.length > 0 ? (
                    patient.schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(schedule.visitDate)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {new Date(schedule.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                          {new Date(schedule.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.discipline}
                            size="small"
                            sx={{ mr: 0.5 }}
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {schedule.visitType}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {schedule.staff?.firstName} {schedule.staff?.lastName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={schedule.status}
                            color={getStatusColor(schedule.status) as any}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No scheduled visits found for this patient
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddDocument}
            >
              Upload Document
            </Button>
          </Box>
          
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
                  minWidth: 600,
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
                minWidth: 600,
                tableLayout: 'auto',
                width: 'max-content'
              }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Document Name</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Type</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Upload Date</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Size</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Uploaded By</TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      whiteSpace: 'nowrap'
                    }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documentLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : documents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No documents found for this patient
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    documents.map((document) => (
                      <TableRow key={document.id} hover>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {document.originalName}
                          </Typography>
                          {document.description && (
                            <Typography variant="caption" color="text.secondary">
                              {document.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Chip
                            label={document.documentType.replace('_', ' ')}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatDate(document.createdAt)}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {(document.fileSize / 1024).toFixed(1)} KB
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {document.uploadedByUser.firstName} {document.uploadedByUser.lastName}
                        </TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          <Box display="flex" gap={1}>
                            <Button
                              size="small"
                              onClick={() => handleViewDocument(document)}
                            >
                              View
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleDownloadDocument(document)}
                            >
                              Download
                            </Button>
                            <Button
                              size="small"
                              onClick={() => handleEditDocument(document)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDocument(document.id)}
                            >
                              Delete
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Card>

      {/* Referral Form Dialog */}
      <ReferralForm
        open={referralFormOpen}
        onClose={() => setReferralFormOpen(false)}
        onSuccess={handleReferralSuccess}
        patientId={patientId!}
        referral={editingReferral}
        mode={editingReferral ? 'edit' : 'create'}
      />

      {/* Document Form Dialog */}
      <DocumentForm
        open={documentFormOpen}
        onClose={() => setDocumentFormOpen(false)}
        onSuccess={handleDocumentSuccess}
        patientId={patientId!}
        document={editingDocument}
        mode={editingDocument ? 'edit' : 'upload'}
      />

      {/* Document Details Dialog */}
      <DocumentDetails
        open={documentDetailsOpen}
        onClose={() => setDocumentDetailsOpen(false)}
        onEdit={() => {
          if (viewingDocument) {
            handleEditDocument(viewingDocument);
            setDocumentDetailsOpen(false);
          }
        }}
        onDownload={() => {
          if (viewingDocument) {
            handleDownloadDocument(viewingDocument);
          }
        }}
        document={viewingDocument}
        canEdit={true}
      />
    </Box>
  );
};

export default PatientDetail;
