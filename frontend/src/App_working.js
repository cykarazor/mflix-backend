import React, { useState, useEffect } from 'react';

const PAGE_SIZE = 10;

function App() {
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://mflix-backend-ysnw.onrender.com/api/movies?page=${page}&limit=${PAGE_SIZE}&search=${searchTerm}&sortBy=${sortBy}&sortOrder=${sortOrder}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setMovies(data.movies || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [page, searchTerm, sortBy, sortOrder]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: '0 auto' }}>
      <h1>Mflix Movies</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ padding: '6px 10px', width: '60%' }}
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ marginLeft: 10 }}>
          <option value="title">Title</option>
          <option value="year">Year</option>
        </select>

        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} style={{ marginLeft: 10 }}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      {loading && <p>Loading movies...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && movies.length === 0 && <p>No movies found.</p>}

      {!loading && !error && movies.length > 0 && (
        <ul>
          {movies.map((movie) => (
            <li key={movie._id} style={{ marginBottom: 6 }}>
              {movie.title} {movie.year ? `(${movie.year})` : ''}
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>Prev</button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>Next</button>
        <button onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
      </div>
    </div>
  );
}

export default App;
