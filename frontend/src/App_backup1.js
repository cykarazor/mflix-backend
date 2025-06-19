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
} from '@mui/material';

const PAGE_SIZE = 10;

const sortOptions = [
  { label: 'Title', value: 'title' },
  { label: 'Year', value: 'year' },
];

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('title');

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Build query string
    const params = new URLSearchParams({
      page,
      limit: PAGE_SIZE,
      sort,
      search,
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
  }, [page, sort, search]);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Mflix Movies
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          fullWidth
        />

        <TextField
          select
          label="Sort By"
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          sx={{ minWidth: 120 }}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
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
        <Typography>No movies found.</Typography>
      )}

      {!loading && !error && movies.length > 0 && (
        <List>
          {movies.map((movie) => (
            <ListItem key={movie._id} divider>
              <ListItemText
                primary={movie.title}
                secondary={movie.year ? `Year: ${movie.year}` : null}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          First
        </Button>
        <Button
          variant="outlined"
          onClick={() => setPage(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </Button>

        <Typography variant="body1" sx={{ alignSelf: 'center', mx: 2 }}>
          Page {page} of {totalPages}
        </Typography>

        <Button
          variant="outlined"
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </Button>
        <Button
          variant="outlined"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          Last
        </Button>
      </Stack>
    </Container>
  );
}

export default App;
