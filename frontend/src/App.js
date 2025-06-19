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
      <Typography variant="h4" gutterBottom align="center">
        🎬 Mflix Movies
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Sort By"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          sx={{ minWidth: 150 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {loading && (
        <Stack alignItems="center" sx={{ my: 4 }}>
          <CircularProgress />
        </Stack>
      )}

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {!loading && !error && movies.length === 0 && (
        <Typography align="center">No movies found.</Typography>
      )}

      {!loading && !error && movies.length > 0 && (
        <List>
          {movies.map((movie) => (
            <ListItem key={movie._id} divider>
              <ListItemIcon>
                <MovieIcon />
              </ListItemIcon>
              <ListItemText
                primary={movie.title}
                secondary={movie.year ? `Year: ${movie.year}` : 'Unknown Year'}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ mt: 3 }}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="outlined"
            onClick={() => setPage(1)}
            disabled={page === 1}
            startIcon={<FirstPageIcon />}
          >
            First
          </Button>
          <Button
            variant="outlined"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            startIcon={<NavigateBeforeIcon />}
          >
            Prev
          </Button>
          <Typography variant="body1" sx={{ alignSelf: 'center', mx: 2 }}>
            Page {page} of {totalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            endIcon={<NavigateNextIcon />}
          >
            Next
          </Button>
          <Button
            variant="outlined"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            endIcon={<LastPageIcon />}
          >
            Last
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

export default App;
