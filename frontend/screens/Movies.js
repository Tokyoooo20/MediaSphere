import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

// Using TMDB API for movies
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Configure axios defaults for TMDB
const tmdbAxios = axios.create({
  baseURL: TMDB_API_URL,
  params: {
    api_key: '1da08f1c929c2585d3287d42e130b354',
    language: 'en-US'
  }
});

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

// Popular movie searches to show on home screen
const POPULAR_SEARCHES = [
  'Avengers',
  'Batman',
  'Spider-Man',
  'Star Wars',
  'Harry Potter'
];

const Movies = ({ navigation, searchQuery }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      fetchMovies();
    }
  }, [searchQuery]);

  const loadFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem('favoriteMovies');
      if (favoritesData) {
        const favoriteMovies = JSON.parse(favoritesData);
        setFavorites(new Set(favoriteMovies.map(movie => movie.id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (movieId) => {
    try {
      const newFavorites = new Set(favorites);
      const movie = movies.find(m => m.id === movieId);
      
      if (newFavorites.has(movieId)) {
        newFavorites.delete(movieId);
      } else {
        newFavorites.add(movieId);
      }
      
      setFavorites(newFavorites);

      // Get current favorites from storage
      const favoritesData = await AsyncStorage.getItem('favoriteMovies');
      let favoriteMovies = favoritesData ? JSON.parse(favoritesData) : [];

      if (newFavorites.has(movieId)) {
        // Add to favorites if not already present
        if (!favoriteMovies.some(m => m.id === movieId)) {
          favoriteMovies.push(movie);
        }
      } else {
        // Remove from favorites
        favoriteMovies = favoriteMovies.filter(m => m.id !== movieId);
      }

      await AsyncStorage.setItem('favoriteMovies', JSON.stringify(favoriteMovies));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const getMovieTrailer = async (movieId) => {
    try {
      const response = await tmdbAxios.get(`/movie/${movieId}/videos`);

      if (response.data && response.data.results) {
        // Filter for official trailers
        const trailers = response.data.results.filter(
          video => video.type === 'Trailer' && video.site === 'YouTube'
        );
        return trailers.length > 0 ? trailers[0].key : null;
      }
      return null;
    } catch (err) {
      console.error('Error fetching trailer:', err.message);
      return null;
    }
  };

  const fetchMovies = async () => {
    try {
      setLoading(true);
      console.log('Fetching movies...');
      
      const response = await tmdbAxios.get('/movie/popular');

      console.log('Movies API response:', response.data);

      if (response.data && response.data.results) {
        const moviesWithDetails = await Promise.all(
          response.data.results.map(async (movie) => {
            // Fetch trailer info
            const videoResponse = await tmdbAxios.get(`/movie/${movie.id}/videos`);

            const trailer = videoResponse.data.results?.find(
              video => video.type === 'Trailer' && video.site === 'YouTube'
            );

            if (!trailer) return null; // Skip movies without trailers

            return {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Poster',
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              overview: movie.overview,
              genre_ids: movie.genre_ids,
              trailer_key: trailer.key
            };
          })
        );

        // Filter out null values (movies without trailers)
        const moviesWithTrailers = moviesWithDetails.filter(movie => movie !== null);

        console.log('Successfully processed movie details');
        setMovies(moviesWithTrailers);
        setError(moviesWithTrailers.length === 0 ? 'No movies with trailers found' : null);
      } else {
        setError('No movies found in the response');
        setMovies([]);
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.status_message || err.message;
      setError(`Failed to fetch movies: ${errorMessage}`);
      setLoading(false);
      console.error('Fetch error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMovies();
      return;
    }

    try {
      setLoading(true);
      console.log('Searching movies for:', searchQuery);

      const response = await tmdbAxios.get('/search/movie', {
        params: {
          query: searchQuery,
          include_adult: false
        }
      });

      console.log('Search response:', {
        query: searchQuery,
        results: response.data?.results?.length || 0
      });

      if (response.data && response.data.results) {
        const moviesWithDetails = await Promise.all(
          response.data.results.map(async (movie) => {
            // Fetch trailer info
            const videoResponse = await tmdbAxios.get(`/movie/${movie.id}/videos`);

            const trailer = videoResponse.data.results?.find(
              video => video.type === 'Trailer' && video.site === 'YouTube'
            );

            if (!trailer) return null; // Skip movies without trailers

            return {
              id: movie.id,
              title: movie.title,
              poster_path: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Poster',
              release_date: movie.release_date,
              vote_average: movie.vote_average,
              overview: movie.overview,
              genre_ids: movie.genre_ids,
              trailer_key: trailer.key
            };
          })
        );

        // Filter out null values (movies without trailers)
        const moviesWithTrailers = moviesWithDetails.filter(movie => movie !== null);

        setMovies(moviesWithTrailers);
        setError(moviesWithTrailers.length === 0 ? `No movies with trailers found for "${searchQuery}"` : null);
      } else {
        setError(`No movies found for "${searchQuery}"`);
        setMovies([]);
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.status_message || err.message;
      setError(`Search failed: ${errorMessage}`);
      setMovies([]);
      setLoading(false);
      console.error('Search error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
    }
  };

  const openTrailer = (trailerKey) => {
    if (trailerKey) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${trailerKey}`;
      Linking.openURL(youtubeUrl);
    }
  };

  const renderMovie = (movie, index) => {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const isFavorite = favorites.has(movie.id);
    
    return (
      <TouchableOpacity 
        key={movie.id}
        style={[styles.movieItem, index % 2 === 0 ? styles.leftItem : styles.rightItem]}
        onPress={() => navigation.navigate('MovieDetail', { movie })}
      >
        <Image
          source={{ uri: movie.poster_path }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {movie.title}
          </Text>
          <Text style={styles.movieYear}>{year}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={18} color="#FFD700" />
          <Text style={styles.ratingText}>
            {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(movie.id);
          }}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={19} 
            color={isFavorite ? "#FF4081" : "#ffffff"} 
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : movies.length === 0 ? (
          <Text style={styles.noResultsText}>No movies found</Text>
        ) : (
          <View style={styles.gridContainer}>
            {movies.map((movie, index) => renderMovie(movie, index))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242A32',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  movieItem: {
    width: ITEM_WIDTH,
    marginBottom: 24,
  },
  leftItem: {
    marginRight: 8,
  },
  rightItem: {
    marginLeft: 8,
  },
  poster: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderRadius: 16,
  },
  movieInfo: {
    marginTop: 8,
  },
  movieTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  movieYear: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    position: 'absolute',
    left: 8,
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  ratingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    bottom: 48,
    padding: 4,
  },
  loader: {
    marginTop: 40,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  noResultsText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  }
});

export default Movies; 