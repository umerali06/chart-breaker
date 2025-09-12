import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { documentsApi } from '../../services/api';

interface PatientSelectorProps {
  selectedPatientId: string | null | undefined;
  onPatientSelect: (patient: { id: string; name: string } | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  allowClear?: boolean;
}

interface PatientOption {
  id: string;
  name: string;
}

const PatientSelector: React.FC<PatientSelectorProps> = ({
  selectedPatientId,
  onPatientSelect,
  label = 'Select Patient',
  error = false,
  helperText,
  allowClear = false,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<PatientOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    let active = true;

    if (!open) {
      return undefined;
    }

    (async () => {
      setLoading(true);
      try {
        const response = await documentsApi.getPatientsForSelector(inputValue);
        if (active) {
          setOptions(response.data.data.map((p: any) => ({ id: p.id, name: `${p.firstName} ${p.lastName} (${p.patientId})` })));
        }
      } catch (err) {
        console.error('Error fetching patients for selector:', err);
        setOptions([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [loading, inputValue, open]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  const selectedValue = selectedPatientId
    ? options.find((option) => option.id === selectedPatientId) || null
    : null;

  return (
    <Autocomplete
      id="patient-selector"
      open={open}
      onOpen={() => {
        setOpen(true);
      }}
      onClose={() => {
        setOpen(false);
      }}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={loading}
      value={selectedValue}
      onChange={(event, newValue) => {
        onPatientSelect(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          fullWidth
          required={!allowClear}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <React.Fragment>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </React.Fragment>
            ),
          }}
        />
      )}
      clearOnBlur={false}
      clearOnEscape={allowClear}
    />
  );
};

export default PatientSelector;
