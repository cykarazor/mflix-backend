// EditMovieForm.js
import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from '@mui/material';

function EditMovieForm({ movieId, onClose, onUpdated }) {
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch movie details when movieId changes
  useEffect(() => {
    if (!movieId) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    fetch(`https://mflix-backend-ysnw.onrender.com/api/movies/${movieId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch movie: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setTitle(data.title || '');
        setYear(data.year ? data.year.toString() : '');
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    // Validate inputs
    if (!title.trim()) {
      setError('Title is required');
      setSaving(false);
      return;
    }
    if (year && !/^\d{4}$/.test(year)) {
      setError('Year must be a 4-digit number');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`https://mflix-backend-ysnw.onrender.com/api/movies/${movieId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          year: year ? parseInt(year, 10) : null,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to update movie');
      }

      setSuccessMsg('Movie updated successfully!');
      onUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        {successMsg && <Alert severity="success">{successMsg}</Alert>}

        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          required
          autoFocus
        />

        <TextField
          label="Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          fullWidth
          inputProps={{ maxLength: 4 }}
          placeholder="e.g. 2022"
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

export default EditMovieForm;
