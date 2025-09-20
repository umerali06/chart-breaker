import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteRegistration from './pages/CompleteRegistration';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import NewPatient from './pages/NewPatient';
import EditPatient from './pages/EditPatient';
import PatientDetail from './pages/PatientDetail';
import NewEpisode from './pages/NewEpisode';
import ScheduleVisit from './pages/ScheduleVisit';
import NewAssessment from './pages/NewAssessment';
import NewClaim from './pages/NewClaim';
import EditClaim from './pages/EditClaim';
import ClaimDetails from './pages/ClaimDetails';
import NewQAReview from './pages/NewQAReview';
import EditQAReview from './pages/EditQAReview';
import QAReviewDetails from './pages/QAReviewDetails';
import PatientCensusReport from './pages/PatientCensusReport';
import EpisodeSummaryReport from './pages/EpisodeSummaryReport';
import BillingSummaryReport from './pages/BillingSummaryReport';
import VisitProductivityReport from './pages/VisitProductivityReport';
import QAComplianceReport from './pages/QAComplianceReport';
import OASISExportReport from './pages/OASISExportReport';
import Episodes from './pages/Episodes';
import Schedules from './pages/Schedules';
import Assessments from './pages/Assessments';
import Billing from './pages/Billing';
import QA from './pages/QA';
import Reports from './pages/Reports';
import Physicians from './pages/Physicians';
import Documents from './pages/Documents';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 6,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/complete-registration" element={<CompleteRegistration />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="patients" element={<Patients />} />
              <Route path="patients/new" element={<NewPatient />} />
              <Route path="patients/:patientId" element={<PatientDetail />} />
              <Route path="patients/:patientId/edit" element={<EditPatient />} />
              <Route path="episodes/new/:patientId" element={<NewEpisode />} />
              <Route path="schedules/new/:patientId" element={<ScheduleVisit />} />
              <Route path="assessments/new/:patientId" element={<NewAssessment />} />
              <Route path="billing/new" element={<NewClaim />} />
              <Route path="billing/new/:patientId" element={<NewClaim />} />
              <Route path="billing/claims/:claimId" element={<ClaimDetails />} />
              <Route path="billing/claims/:claimId/edit" element={<EditClaim />} />
              <Route path="qa/new" element={<NewQAReview />} />
              <Route path="qa/reviews/:reviewId" element={<QAReviewDetails />} />
              <Route path="qa/reviews/:reviewId/edit" element={<EditQAReview />} />
              <Route path="reports/patient-census" element={<PatientCensusReport />} />
              <Route path="reports/episode-summary" element={<EpisodeSummaryReport />} />
              <Route path="reports/billing-summary" element={<BillingSummaryReport />} />
              <Route path="reports/visit-productivity" element={<VisitProductivityReport />} />
              <Route path="reports/qa-compliance" element={<QAComplianceReport />} />
              <Route path="reports/oasis-export" element={<OASISExportReport />} />
              <Route path="episodes" element={<Episodes />} />
              <Route path="schedules" element={<Schedules />} />
              <Route path="assessments" element={<Assessments />} />
              <Route path="billing" element={<Billing />} />
              <Route path="qa" element={<QA />} />
              <Route path="reports" element={<Reports />} />
              <Route path="physicians" element={<Physicians />} />
              <Route path="documents" element={<Documents />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;