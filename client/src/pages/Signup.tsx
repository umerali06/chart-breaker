import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import { authVerificationApi } from '../services/api';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Registration Request
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: ''
  });

  // Step 2: Email Verification
  const [verificationCode, setVerificationCode] = useState('');

  const steps = [
    'Submit Request',
    'Verify Email',
    'Set Password'
  ];

  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleRequestRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authVerificationApi.requestRegistration(formData);
      setSuccess(response.data.message);
      setStep(1);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit registration request');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authVerificationApi.verifyEmail({
        email: formData.email,
        verificationCode
      });
      setSuccess(response.data.message);
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to verify email');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataObj = new FormData(e.currentTarget as HTMLFormElement);
      const password = formDataObj.get('password') as string;
      const confirmPassword = formDataObj.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        setLoading(false);
        return;
      }

      const response = await authVerificationApi.completeRegistration({
        email: formData.email,
        password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setSuccess('Registration completed successfully! Redirecting...');
      setTimeout(() => {
        // All users go to dashboard (admin features integrated there)
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      if (err.response?.data?.code === 'REQUEST_NOT_APPROVED') {
        setError('Your registration request is still pending admin approval. Please wait for approval before completing registration.');
      } else {
        setError(err.response?.data?.error || 'Failed to complete registration');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <form onSubmit={handleRequestRegistration}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    🚀 Request Access to Chart Breaker EHR
                  </Typography>
                  <Typography variant="body2">
                    Fill out the form below to request access. You'll need to verify your email and wait for admin approval.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  required
                  helperText="Enter your first name"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  required
                  helperText="Enter your last name"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                  helperText="We'll send a verification code to this email"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Select Your Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={handleInputChange('role')}
                    label="Select Your Role"
                  >
                    <MenuItem value="INTAKE_STAFF">📋 Intake Staff - Patient intake and data entry</MenuItem>
                    <MenuItem value="CLINICIAN">👩‍⚕️ Clinician - Patient care and documentation</MenuItem>
                    <MenuItem value="QA_REVIEWER">🔍 QA Reviewer - Quality assurance and compliance</MenuItem>
                    <MenuItem value="BILLER">💰 Biller - Billing and claims management</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !formData.firstName || !formData.lastName || !formData.email || !formData.role}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Submit Registration Request'}
                </Button>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    By submitting, you agree to our terms and understand that admin approval is required.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </form>
        );

      case 1:
        return (
          <form onSubmit={handleVerifyEmail}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    📧 Check Your Email
                  </Typography>
                  <Typography variant="body2">
                    We've sent a 6-digit verification code to <strong>{formData.email}</strong>
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Can't find the email?</strong> Check your spam folder or contact your administrator.
                   
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Verification Code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  helperText="Enter the 6-digit code from your email"
                  inputProps={{ maxLength: 6 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || verificationCode.length !== 6}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Verify Email & Continue'}
                </Button>
              </Grid>
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setStep(0)}
                  sx={{ mt: 1 }}
                >
                  ← Back to Registration
                </Button>
              </Grid>
            </Grid>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleCompleteRegistration}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    🎉 Email Verified Successfully!
                  </Typography>
                  <Typography variant="body2">
                    Your email has been verified. However, your registration request is still pending admin approval.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    ⏳ Awaiting Admin Approval
                  </Typography>
                  <Typography variant="body2">
                    <strong>What happens next:</strong>
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                    1. An administrator will review your registration request<br/>
                    2. You'll receive an email notification when approved<br/>
                    3. Once approved, you can complete your account setup<br/>
                    4. Then you'll be able to access the system
                  </Typography>
                </Alert>
              </Grid>

              {/* <Grid item xs={12}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    🔐 Set Your Password
                  </Typography>
                  <Typography variant="body2">
                    You can set your password now. It will be activated once your registration is approved by an administrator.
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  name="password"
                  required
                  helperText="Choose a strong password with at least 8 characters"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  required
                  helperText="Re-enter your password to confirm"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Set Password & Complete Registration'}
                </Button>
              </Grid> */}
              
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        const response = await authVerificationApi.getRegistrationStatus(formData.email);
                        const status = response.data.status;
                        if (status === 'APPROVED') {
                          setSuccess('Your registration has been approved! You can now complete the registration.');
                        } else if (status === 'REJECTED') {
                          setError('Your registration request has been rejected. Please contact your administrator.');
                        } else {
                          setError('Your registration is still pending approval. Please wait for admin approval.');
                        }
                      } catch (err) {
                        setError('Unable to check status. Please try again later.');
                      }
                    }}
                    sx={{ mr: 1 }}
                  >
                    Check Approval Status
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Need help? Contact your administrator or check your email for updates.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 600, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Chart Breaker EHR
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Professional Healthcare Management
            </Typography>
          </Box>

          <Paper sx={{ p: 2, mb: 3 }}>
            <Stepper activeStep={step} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {renderStepContent()}

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Signup;
