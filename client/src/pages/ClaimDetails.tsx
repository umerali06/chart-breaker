import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';
import { billingApi } from '../services/api';

interface Claim {
  id: string;
  claimNumber?: string;
  claimType: string;
  submissionDate?: string;
  claimAmount: number;
  status: string;
  hippsCode?: string;
  createdAt: string;
  updatedAt: string;
  patient: {
    id: string;
    patientId: string;
    firstName: string;
    lastName: string;
  };
  payer: {
    id: string;
    payerName: string;
    payerType: string;
  };
  episode?: {
    id: string;
    episodeNumber: string;
    status: string;
  };
}

const ClaimDetails: React.FC = () => {
  const navigate = useNavigate();
  const { claimId } = useParams<{ claimId: string }>();
  
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadClaim = useCallback(async () => {
    try {
      setLoading(true);
      const response = await billingApi.getClaim(claimId!);
      setClaim(response.data.claim);
    } catch (err: any) {
      console.error('Error loading claim:', err);
      setError('Failed to load claim details');
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    if (claimId) {
      loadClaim();
    }
  }, [claimId, loadClaim]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SUBMITTED':
        return 'info';
      case 'ACCEPTED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PAID':
        return 'success';
      case 'DENIED':
        return 'error';
      default:
        return 'default';
    }
  };

  const getClaimTypeLabel = (claimType: string) => {
    switch (claimType) {
      case 'CLAIM_837I':
        return '837I (Institutional)';
      case 'CLAIM_837P':
        return '837P (Professional)';
      default:
        return claimType;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !claim) {
    return (
      <Box>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/billing')}
            sx={{ mr: 2 }}
          >
            Back to Billing
          </Button>
        </Box>
        <Alert severity="error">{error || 'Claim not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/billing')}
            sx={{ mr: 2 }}
          >
            Back to Billing
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Claim Details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/billing/claims/${claim.id}/edit`)}
        >
          Edit Claim
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Claim Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Claim Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Claim Number
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {claim.claimNumber || 'Not assigned'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={claim.status}
                    color={getStatusColor(claim.status) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Claim Type
                  </Typography>
                  <Typography variant="body1">
                    {getClaimTypeLabel(claim.claimType)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {formatCurrency(claim.claimAmount)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Submission Date
                  </Typography>
                  <Typography variant="body1">
                    {claim.submissionDate ? formatDate(claim.submissionDate) : 'Not submitted'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    HIPPS Code
                  </Typography>
                  <Typography variant="body1">
                    {claim.hippsCode || 'Not assigned'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Patient Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Patient Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Patient Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {claim.patient.firstName} {claim.patient.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Patient ID
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {claim.patient.patientId}
              </Typography>
              
              {claim.episode && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Episode
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {claim.episode.episodeNumber} ({claim.episode.status})
                  </Typography>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Payer Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Payer Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {claim.payer.payerName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Payer Type
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {claim.payer.payerType}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Timeline
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                  {formatDate(claim.createdAt)}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatDate(claim.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ClaimDetails;

