import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import { physiciansApi } from '../../services/api';

interface Physician {
  id: string;
  firstName: string;
  lastName: string;
  npi: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

interface PhysicianSelectorProps {
  value: Physician | null;
  onChange: (physician: Physician | null) => void;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  label?: string;
}

const PhysicianSelector: React.FC<PhysicianSelectorProps> = ({
  value,
  onChange,
  error = false,
  helperText,
  required = false,
  label = "Select Physician"
}) => {
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPhysicians = async (search: string = '') => {
    try {
      setLoading(true);
      const response = await physiciansApi.getPhysicians({
        search,
        limit: 50
      });
      setPhysicians(response.data.data || []);
    } catch (err) {
      console.error('Error fetching physicians:', err);
      setPhysicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhysicians(searchTerm);
  }, [searchTerm]);

  const handleInputChange = (event: any, newValue: string) => {
    setSearchTerm(newValue);
  };

  const handleChange = (event: any, newValue: Physician | null) => {
    onChange(newValue);
  };

  const getOptionLabel = (option: Physician) => {
    if (typeof option === 'string') return option;
    return `${option.firstName} ${option.lastName} (NPI: ${option.npi})`;
  };

  const renderOption = (props: any, option: Physician) => (
    <Box component="li" {...props}>
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
          {option.firstName} {option.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          NPI: {option.npi}
          {option.specialty && ` • ${option.specialty}`}
        </Typography>
        {option.phone && (
          <Typography variant="body2" color="text.secondary">
            Phone: {option.phone}
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Autocomplete
      value={value}
      onChange={handleChange}
      onInputChange={handleInputChange}
      options={physicians}
      getOptionLabel={getOptionLabel}
      renderOption={renderOption}
      loading={loading}
      loadingText="Loading physicians..."
      noOptionsText="No physicians found"
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          required={required}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            {...getTagProps({ index })}
            key={option.id}
            label={`${option.firstName} ${option.lastName}`}
            variant="outlined"
          />
        ))
      }
    />
  );
};

export default PhysicianSelector;
