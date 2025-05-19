import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 48) / 2;

const Favorites = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('movies');
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [favoriteTracks, setFavoriteTracks] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const [moviesData, tracksData] = await Promise.all([
        AsyncStorage.getItem('favoriteMovies'),
        AsyncStorage.getItem('favoriteTracks')
      ]);

      if (moviesData) {
        setFavoriteMovies(JSON.parse(moviesData));
      }
      if (tracksData) {
        setFavoriteTracks(JSON.parse(tracksData));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const removeFromMovieFavorites = async (movieId) => {
    try {
      const updatedFavorites = favoriteMovies.filter(movie => movie.id !== movieId);
      setFavoriteMovies(updatedFavorites);
      await AsyncStorage.setItem('favoriteMovies', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const removeFromMusicFavorites = async (trackId) => {
    try {
      const updatedFavorites = favoriteTracks.filter(track => track.id !== trackId);
      setFavoriteTracks(updatedFavorites);
      await AsyncStorage.setItem('favoriteTracks', JSON.stringify(updatedFavorites));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const renderMovie = (movie) => (
    <TouchableOpacity
      key={movie.id}
      style={styles.itemCard}
      onPress={() => navigation.navigate('MovieDetail', { movie })}
    >
      <Image
        source={{ uri: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{movie.vote_average?.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTrack = (track) => (
    <TouchableOpacity
      key={track.id}
      style={styles.itemCard}
      onPress={() => navigation.navigate('MusicDetail', { music: track })}
    >
      <Image
        source={{ uri: track.album?.cover_medium || 'https://via.placeholder.com/500' }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={styles.artistName} numberOfLines={1}>
          {track.artist?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'movies' && styles.activeTab]}
          onPress={() => setActiveTab('movies')}
        >
          <Text style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
            Movies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'music' && styles.activeTab]}
          onPress={() => setActiveTab('music')}
        >
          <Text style={[styles.tabText, activeTab === 'music' && styles.activeTabText]}>
            Music
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gridContainer}>
          {activeTab === 'movies' ? (
            favoriteMovies.length > 0 ? (
              favoriteMovies.map(renderMovie)
            ) : (
              <Text style={styles.noItemsText}>No favorite movies yet</Text>
            )
          ) : (
            favoriteTracks.length > 0 ? (
              favoriteTracks.map(renderTrack)
            ) : (
              <Text style={styles.noItemsText}>No favorite music yet</Text>
            )
          )}
        </View>
      </ScrollView>
    </View>
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
    paddingTop: 48,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#242A32',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#393E46',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B68D9',
  },
  tabText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  itemCard: {
    width: ITEM_WIDTH,
    marginBottom: 24,
    marginHorizontal: 8,
  },
  itemImage: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderRadius: 16,
  },
  itemInfo: {
    marginTop: 8,
  },
  itemTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  artistName: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    marginLeft: 4,
  },
  noItemsText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
    marginTop: 32,
  },
});

export default Favorites; 