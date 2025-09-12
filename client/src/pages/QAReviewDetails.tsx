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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, Warning as WarningIcon } from '@mui/icons-material';
import { qaApi } from '../services/api';

interface Deficiency {
  id: string;
  category: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface QAReview {
  id: string;
  documentId: string;
  documentType: string;
  reviewDate: string;
  status: string;
  comments?: string;
  deficiencies?: Deficiency[];
  createdAt: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const QAReviewDetails: React.FC = () => {
  const navigate = useNavigate();
  const { reviewId } = useParams<{ reviewId: string }>();
  
  const [review, setReview] = useState<QAReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReview = useCallback(async () => {
    try {
      setLoading(true);
      const response = await qaApi.getReview(reviewId!);
      setReview(response.data.review);
    } catch (err: any) {
      console.error('Error loading review:', err);
      setError('Failed to load review details');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    if (reviewId) {
      loadReview();
    }
  }, [reviewId, loadReview]);


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'DEFICIENT':
        return 'error';
      case 'LOCKED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'info';
      case 'LOW':
        return 'default';
      default:
        return 'default';
    }
  };

  const getDocumentTypeLabel = (documentType: string) => {
    switch (documentType) {
      case 'OASIS':
        return 'OASIS Assessment';
      case 'VISIT_NOTE':
        return 'Visit Note';
      case 'CARE_PLAN':
        return 'Care Plan';
      case 'ORDER':
        return 'Order';
      default:
        return documentType;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !review) {
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
        </Box>
        <Alert severity="error">{error || 'Review not found'}</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/qa')}
            sx={{ mr: 2 }}
          >
            Back to QA
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            QA Review Details
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/qa/reviews/${review.id}/edit`)}
        >
          Edit Review
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Review Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Document Type
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {getDocumentTypeLabel(review.documentType)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={review.status}
                    color={getStatusColor(review.status) as any}
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Review Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(review.reviewDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Document ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {review.documentId}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Reviewer Information */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Reviewer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Typography variant="body2" color="text.secondary">
                Reviewer Name
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
                {review.reviewer.firstName} {review.reviewer.lastName}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                Review Created
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                {formatDate(review.createdAt)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Deficiencies */}
        {review.deficiencies && review.deficiencies.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Deficiencies Found
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  {review.deficiencies.map((deficiency, index) => (
                    <ListItem key={deficiency.id || index} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <WarningIcon 
                          color={deficiency.severity === 'CRITICAL' ? 'error' : 
                                 deficiency.severity === 'HIGH' ? 'warning' : 'info'} 
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography variant="body1">
                              {deficiency.description}
                            </Typography>
                            <Chip
                              label={deficiency.severity}
                              color={getSeverityColor(deficiency.severity) as any}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={`Category: ${deficiency.category}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Comments */}
        {review.comments && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Review Comments
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {review.comments}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Review Summary
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Total Deficiencies
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    {review.deficiencies?.length || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Critical Issues
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {review.deficiencies?.filter(d => d.severity === 'CRITICAL').length || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    High Priority
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                    {review.deficiencies?.filter(d => d.severity === 'HIGH').length || 0}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Typography variant="body2" color="text.secondary">
                    Review Status
                  </Typography>
                  <Chip
                    label={review.status}
                    color={getStatusColor(review.status) as any}
                    size="medium"
                    sx={{ mt: 1, fontSize: '1rem', height: '32px' }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default QAReviewDetails;
