import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import axios from 'axios';

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
  referrals: Array<{
    id: string;
    referralSource?: string;
    referralDate: string;
    physicianName?: string;
  }>;
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

  useEffect(() => {
    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/patients/${patientId}`);
      setPatient(response.data.patient);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load patient');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            New Episode
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
            <Tab label="Referrals" />
            <Tab label="Visits" />
            <Tab label="Documents" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Episode Number</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Disciplines</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient.episodes.map((episode) => (
                  <TableRow key={episode.id}>
                    <TableCell>{episode.episodeNumber}</TableCell>
                    <TableCell>{formatDate(episode.startDate)}</TableCell>
                    <TableCell>{episode.endDate ? formatDate(episode.endDate) : '-'}</TableCell>
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Referral Source</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Physician</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {patient.referrals.map((referral) => (
                  <TableRow key={referral.id}>
                    <TableCell>{referral.referralSource || '-'}</TableCell>
                    <TableCell>{formatDate(referral.referralDate)}</TableCell>
                    <TableCell>{referral.physicianName || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="body2" color="text.secondary">
            Visit history will be displayed here.
          </Typography>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="body2" color="text.secondary">
            Patient documents will be displayed here.
          </Typography>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default PatientDetail;
