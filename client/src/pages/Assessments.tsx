import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import { mockApi } from '../services/mockApi';

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

const Assessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAssessments();
  }, [page, searchTerm, typeFilter]);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const response = await mockApi.getAssessments({
        page,
        limit: 10,
        search: searchTerm,
        assessmentType: typeFilter,
      });
      setAssessments(response.assessments);
      setTotalPages(response.pagination.pages);
    } catch (err: any) {
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          OASIS Assessments
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Assessment
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
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

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Assessment Type</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Episode</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Clinician</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Signed Date</TableCell>
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
                    <TableCell>{assessment.episode.episodeNumber}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
    </Box>
  );
};

export default Assessments;
