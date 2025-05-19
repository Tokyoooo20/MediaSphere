import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { TMDB_API_KEY } from '@env';
import YoutubePlayer from 'react-native-youtube-iframe';

const { width, height } = Dimensions.get('window');

// TMDB API configuration
const TMDB_API_URL = 'https://api.themoviedb.org/3';

// Configure axios defaults for TMDB
const tmdbAxios = axios.create({
  baseURL: TMDB_API_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US'
  }
});

const MovieDetail = ({ route, navigation }) => {
  const { movie } = route.params;
  const [loading, setLoading] = useState(false);
  const [movieDetails, setMovieDetails] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchMovieDetails();
  }, []);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      const response = await tmdbAxios.get(`/movie/${movie.id}`, {
        params: {
          append_to_response: 'credits,videos'
        }
      });

      setMovieDetails(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setLoading(false);
    }
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getYear = (dateString) => {
    return dateString ? new Date(dateString).getFullYear() : 'N/A';
  };

  const onStateChange = useCallback((state) => {
    if (state === "ended") {
      setPlaying(false);
      setModalVisible(false);
    }
  }, []);

  const togglePlaying = useCallback(() => {
    setPlaying((prev) => !prev);
  }, []);

  const openTrailer = () => {
    if (movie.trailer_key) {
      setModalVisible(true);
      setPlaying(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Movie Details</Text>
      </View>

      {/* Trailer Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setPlaying(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setPlaying(false);
              }}
            >
              <Ionicons name="close" size={24} color="#ffffff" />
            </TouchableOpacity>
            <YoutubePlayer
              height={300}
              play={playing}
              videoId={movie.trailer_key}
              onChangeState={onStateChange}
            />
          </View>
        </View>
      </Modal>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" style={styles.loader} />
      ) : (
        <ScrollView style={styles.content}>
          {/* Movie Poster */}
          <View style={styles.posterContainer}>
            <Image
              source={{ uri: movie.poster_path }}
              style={styles.poster}
              resizeMode="cover"
            />
            {movie.trailer_key && (
              <TouchableOpacity 
                style={styles.playOverlay}
                onPress={openTrailer}
              >
                <View style={styles.playButton}>
                  <Ionicons name="play" size={40} color="#ffffff" />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Movie Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{movie.title}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.statText}>
                  {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
                </Text>
              </View>
              {movieDetails?.runtime && (
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color="#ffffff" />
                  <Text style={styles.statText}>
                    {formatRuntime(movieDetails.runtime)}
                  </Text>
                </View>
              )}
              <View style={styles.statItem}>
                <Ionicons name="calendar-outline" size={16} color="#ffffff" />
                <Text style={styles.statText}>
                  {getYear(movie.release_date)}
                </Text>
              </View>
            </View>

            {movieDetails?.genres && (
              <View style={styles.genreContainer}>
                {movieDetails.genres.map(genre => (
                  <View key={genre.id} style={styles.genreTag}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <Text style={styles.overview}>{movie.overview}</Text>
            </View>

            {movieDetails?.credits?.crew && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Director</Text>
                <Text style={styles.crewText}>
                  {movieDetails.credits.crew
                    .filter(person => person.job === 'Director')
                    .map(director => director.name)
                    .join(', ') || 'N/A'}
                </Text>
              </View>
            )}

            {movie.trailer_key && (
              <TouchableOpacity 
                style={styles.watchButton}
                onPress={openTrailer}
              >
                <Ionicons name="play" size={20} color="#ffffff" />
                <Text style={styles.watchButtonText}>Watch Trailer</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242A32',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3F47',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  posterContainer: {
    position: 'relative',
    width: width,
    height: width * 1.5,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 4,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: '#3A3F47',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  genreText: {
    color: '#ffffff',
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  overview: {
    color: '#cccccc',
    fontSize: 14,
    lineHeight: 22,
  },
  crewText: {
    color: '#cccccc',
    fontSize: 14,
  },
  watchButton: {
    flexDirection: 'row',
    backgroundColor: '#3B68D9',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  watchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    padding: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    marginBottom: 10,
  },
});

export default MovieDetail; 