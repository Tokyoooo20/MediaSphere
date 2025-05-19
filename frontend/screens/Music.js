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

// Using Deezer API for music
const DEEZER_API_URL = 'https://api.deezer.com';

const formatDuration = (duration) => {
  if (!duration) return '0:00';
  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const Music = ({ navigation, searchQuery }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      fetchMusic();
    }
  }, [searchQuery]);

  const loadFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem('favoriteTracks');
      if (favoritesData) {
        const favoriteTracks = JSON.parse(favoritesData);
        setFavorites(new Set(favoriteTracks.map(track => track.id)));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (trackId) => {
    try {
      const newFavorites = new Set(favorites);
      const track = tracks.find(t => t.id === trackId);
      
      if (newFavorites.has(trackId)) {
        newFavorites.delete(trackId);
      } else {
        newFavorites.add(trackId);
      }
      
      setFavorites(newFavorites);

      const favoritesData = await AsyncStorage.getItem('favoriteTracks');
      let favoriteTracks = favoritesData ? JSON.parse(favoritesData) : [];

      if (newFavorites.has(trackId)) {
        if (!favoriteTracks.some(t => t.id === trackId)) {
          favoriteTracks.push(track);
        }
      } else {
        favoriteTracks = favoriteTracks.filter(t => t.id !== trackId);
      }

      await AsyncStorage.setItem('favoriteTracks', JSON.stringify(favoriteTracks));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const fetchMusic = async () => {
    try {
      setLoading(true);
      console.log('Fetching music...');
      const response = await axios.get(
        `${DEEZER_API_URL}/chart/0/tracks`,
        {
          params: {
            limit: 20
          }
        }
      );
      
      console.log('Music API response:', {
        status: response.status,
        results: response.data?.data?.length || 0
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log('Successfully fetched tracks');
        setTracks(response.data.data);
        setError(null);
      } else {
        console.log('No tracks found in response:', response.data);
        setError('No music found. Please try again.');
        setTracks([]);
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      console.error('Music fetch error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Failed to fetch music: ${errorMessage}`);
      setTracks([]);
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMusic();
      return;
    }

    try {
      setLoading(true);
      console.log('Searching music for:', searchQuery);
      const response = await axios.get(
        `${DEEZER_API_URL}/search`,
        {
          params: {
            q: searchQuery,
            limit: 20
          }
        }
      );
      
      console.log('Search response:', {
        query: searchQuery,
        results: response.data?.data?.length || 0
      });
      
      if (response.data && response.data.data && response.data.data.length > 0) {
        console.log('Search found tracks');
        setTracks(response.data.data);
        setError(null);
      } else {
        console.log('No tracks found for search');
        setError(`No music found for "${searchQuery}"`);
        setTracks([]);
      }
      setLoading(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error?.message || err.message;
      console.error('Music search error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(`Search failed: ${errorMessage}`);
      setTracks([]);
      setLoading(false);
    }
  };

  const renderSong = (item, index) => {
    const thumbnailUrl = item.album?.cover_medium || 'https://via.placeholder.com/500';
    const playCount = item.rank ? `${Math.floor(item.rank / 1000)}K` : '0';
    const isFavorite = favorites.has(item.id);
    
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.songItem, index % 2 === 0 ? styles.leftItem : styles.rightItem]}
        onPress={() => navigation.navigate('MusicDetail', { 
          music: {
            ...item,
            preview: item.preview,
            album: {
              ...item.album,
              cover_xl: item.album?.cover_xl,
              cover_medium: item.album?.cover_medium
            }
          }
        })}
      >
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.albumArt}
          resizeMode="cover"
        />
        <View style={styles.songInfo}>
          <Text style={styles.songTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.artistName} numberOfLines={1}>
            {item.artist?.name}
          </Text>
        </View>
        <View style={styles.playCountContainer}>
          <Ionicons name="play" size={12} color="#ffffff" />
          <Text style={styles.playCountText}>{playCount}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item.id);
          }}
        >
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={18} 
            color={isFavorite ? "#FF4081" : "#ffffff"} 
          />
        </TouchableOpacity>
        {item.explicit_lyrics && (
          <View style={styles.streamableTag}>
            <Text style={styles.streamableTagText}>EXPLICIT</Text>
          </View>
        )}
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
        ) : tracks.length === 0 ? (
          <Text style={styles.noResultsText}>No music found</Text>
        ) : (
          <View style={styles.gridContainer}>
            {tracks.map((item, index) => renderSong(item, index))}
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
  songItem: {
    width: ITEM_WIDTH,
    marginBottom: 24,
  },
  leftItem: {
    marginRight: 8,
  },
  rightItem: {
    marginLeft: 8,
  },
  albumArt: {
    width: '100%',
    height: ITEM_WIDTH * 1.5,
    borderRadius: 16,
  },
  songInfo: {
    marginTop: 8,
  },
  songTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  artistName: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  playCountContainer: {
    position: 'absolute',
    left: 8,
    bottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  playCountText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    right: 8,
    bottom: 48,
    padding: 4,
  },
  streamableTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#3B68D9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  streamableTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
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

export default Music; 