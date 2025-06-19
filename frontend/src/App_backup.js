import React, { useState, useEffect } from 'react';

const PAGE_SIZE = 20;

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`https://mflix-backend-ysnw.onrender.com/api/movies?page=${page}&limit=${PAGE_SIZE}`);
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        if (!data || !Array.isArray(data.movies)) {
          throw new Error('Unexpected API response format');
        }

        setMovies(data.movies);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page]);

  return (
    <div style={{ padding: 20 }}>
      <h1>Mflix Movies</h1>

      {loading && <p>Loading movies...</p>}

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && movies.length === 0 && <p>No movies found.</p>}

      {!loading && !error && movies.length > 0 && (
        <ul>
          {movies.map((movie) => (
            <li key={movie._id}>
              {movie.title} {movie.year ? `(${movie.year})` : ''}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 20 }}>
        <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span style={{ margin: '0 10px' }}>
          Page {page} of {totalPages}
        </span>
        <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
