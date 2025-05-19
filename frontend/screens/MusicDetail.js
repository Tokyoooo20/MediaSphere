import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const MusicDetail = ({ route, navigation }) => {
  const { music } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);

  // Clean up the sound when component unmounts
  useEffect(() => {
    return sound
      ? () => {
          console.log('Unloading Sound');
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const formatDuration = (duration) => {
    if (!duration) return '0:00';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const loadAndPlayPreview = async () => {
    try {
      if (sound) {
        // If we already have a sound loaded
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        // Load the sound for the first time
        console.log('Loading Sound');
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: music.preview },
          { shouldPlay: true },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    setPlaybackStatus(status);
    if (status.didJustFinish) {
      setIsPlaying(false);
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
        <Text style={styles.headerTitle}>Music Details</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Album Art */}
        <View style={styles.albumContainer}>
          <Image
            source={{ uri: music.album?.cover_xl || music.album?.cover_medium }}
            style={styles.albumArt}
            resizeMode="cover"
          />
          {music.preview && (
            <TouchableOpacity 
              style={styles.playOverlay}
              onPress={loadAndPlayPreview}
            >
              <View style={styles.playButton}>
                <Ionicons 
                  name={isPlaying ? "pause" : "play"} 
                  size={40} 
                  color="#ffffff" 
                />
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Music Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{music.title}</Text>
          <Text style={styles.artist}>{music.artist?.name}</Text>
          <Text style={styles.album}>{music.album?.title}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="play" size={16} color="#FFD700" />
              <Text style={styles.statText}>
                {Math.floor(music.rank / 1000)}K plays
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#ffffff" />
              <Text style={styles.statText}>
                {formatDuration(music.duration)}
              </Text>
            </View>
            {playbackStatus && (
              <View style={styles.statItem}>
                <Ionicons name="musical-notes" size={16} color="#ffffff" />
                <Text style={styles.statText}>
                  {formatDuration(Math.floor(playbackStatus.positionMillis / 1000))} / 
                  {formatDuration(Math.floor(playbackStatus.durationMillis / 1000))}
                </Text>
              </View>
            )}
          </View>

          {music.preview && (
            <TouchableOpacity 
              style={[styles.previewButton, isPlaying && styles.playingButton]}
              onPress={loadAndPlayPreview}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={20} 
                color="#ffffff" 
              />
              <Text style={styles.previewButtonText}>
                {isPlaying ? 'Pause Preview' : 'Play Preview'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
  albumContainer: {
    position: 'relative',
    width: width,
    height: width,
  },
  albumArt: {
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
    marginBottom: 8,
  },
  artist: {
    color: '#cccccc',
    fontSize: 18,
    marginBottom: 4,
  },
  album: {
    color: '#666',
    fontSize: 16,
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
  previewButton: {
    flexDirection: 'row',
    backgroundColor: '#3B68D9',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playingButton: {
    backgroundColor: '#E74C3C',
  },
  previewButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default MusicDetail; 