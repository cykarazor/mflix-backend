import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Stack,
  CircularProgress,
  TextField,
  MenuItem,
  Box,
  ListItemIcon,
} from '@mui/material';

import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import MovieIcon from '@mui/icons-material/Movie';

const PAGE_SIZE = 10;

const sortOptions = [
  { label: 'Title (A-Z)', value: 'title' },
  { label: 'Year (Newest)', value: 'year' },
];

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title');
  const [searchDebounce, setSearchDebounce] = useState('');

  useEffect(() => {
    const delay = setTimeout(() => {
      setSearchDebounce(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page,
      limit: PAGE_SIZE,
      sort,
      search: searchDebounce,
    });

    fetch(`https://mflix-backend-ysnw.onrender.com/api/movies?${params.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        setMovies(data.movies || []);
        setTotalPages(data.totalPages || 1);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies');
        setLoading(false);
      });
  }, [page, sort, searchDebounce]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Typography v
