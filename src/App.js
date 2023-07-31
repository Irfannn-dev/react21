import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaExclamationTriangle } from 'react-icons/fa';
import './mov.css';
import YouTube from 'react-youtube';

function App() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showNotFoundNotification, setShowNotFoundNotification] = useState(false);
  const [showMissingPosterNotification, setShowMissingPosterNotification] = useState(false);
  const [trailerVideoId,
    setTrailerVideoId] = useState(null);
  // ...

  const getApi = async () => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: {
        api_key: '88b6e1948493a5e5d9cb3949a3dddd67',
      },
    });
    setMovies(response.data.results);

    // Check if any trailer is missing a poster
    const hasMissingPoster = response.data.results.some((movie) => !movie.poster_path);
    setShowMissingPosterNotification(hasMissingPoster);
  } catch (err) {
    console.log('Error fetching data:', err);
  }
};

  useEffect(() => {
    getApi();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get('https://api.themoviedb.org/3/search/movie', {
        params: {
          api_key: '88b6e1948493a5e5d9cb3949a3dddd67',
          query: searchQuery,
        },
      });
      if (response.data.results.length === 0) {
        setShowNotFoundNotification(true);
        setMovies([]);
      } else {
        setShowNotFoundNotification(false);
        setMovies(response.data.results);
      }
    } catch (err) {
      console.log('Error fetching data:', err);
    }
  };
  
  const getTrailerVideoId = async (movie) => {
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          key: 'AIzaSyCXWgNoCi5VhfizaajyVgPS2DMuyGqIXLo',
          q: `${movie.title} official trailer`,
          part: 'snippet',
          type: 'video',
          maxResults: 1,
        },
      });
      const videoId = response.data.items[0]?.id?.videoId || null;
      setTrailerVideoId(videoId);
    } catch (err) {
      console.log('Error fetching trailer data:', err);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
    getTrailerVideoId(movie);
  };

  return (
    <div className="App">
      <header className="header">
        <h1 className="title">21 trailer Movies</h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search movie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
        {showNotFoundNotification && <p className="not-found-notification">Movie not found.</p>}
        {showMissingPosterNotification && (
        <p className="missing-poster-notification">
          <FaExclamationTriangle className="notification-icon" />
          Some trailers are missing posters.
        </p>
      )}
      </header>
      <div className="container">
        <ul>
          {movies.map((movie) => (
            <li className="poster" key={movie.id} onClick={() => handleMovieClick(movie)}>
              <img src={`https://image.tmdb.org/t/p/w200/${movie.poster_path}`} alt="" className="poster-path" />
                <div className="vote-average">{movie.vote_average}</div>
              <div className="detail">
                <h2 className="movie-title">{movie.title}</h2>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {trailerVideoId && selectedMovie && (
        <div className="backdrop-container">
          <div
            className="backdrop"
            style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original/${selectedMovie.backdrop_path})` }}
          >
          <YouTube videoId={trailerVideoId} opts={{ width: '100%', height: '100%' }} className="youtube-video" />
            <div className="backdrop-details">
              <h2>{selectedMovie.title}</h2>
              <p>{selectedMovie.overview}</p>
              <button onClick={() =>setTrailerVideoId(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
