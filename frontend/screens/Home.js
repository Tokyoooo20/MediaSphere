import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Movies from './Movies';
import Music from './Music';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('Movies');
  const [searchQuery, setSearchQuery] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-width)).current;
  const tabs = ['Movies', 'Music'];

  const menuItems = [
    { icon: 'person-outline', label: 'Profile' },
    { icon: 'heart-outline', label: 'Favorites' },
    { icon: 'settings-outline', label: 'Settings' },
    { icon: 'log-out-outline', label: 'Logout' },
  ];

  useEffect(() => {
    if (menuVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [menuVisible]);

  const handleMenuPress = (item) => {
    setMenuVisible(false);
    switch (item.label) {
      case 'Profile':
        navigation.navigate('Profile');
        break;
      case 'Favorites':
        // Handle favorites
        break;
      case 'Settings':
        // Handle settings
        break;
      case 'Logout':
        navigation.navigate('Welcome');
        break;
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Burger Menu */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>What do you want to watch?</Text>
      </View>

      {/* Slide-in Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent={true}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.menuContainer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile');
              }}
            >
              <Ionicons name="person-outline" size={24} color="#ffffff" />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Favorites');
              }}
            >
              <Ionicons name="heart-outline" size={24} color="#ffffff" />
              <Text style={styles.menuText}>Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Welcome');
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#ff4444" />
              <Text style={[styles.menuText, { color: '#ff4444' }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
          <TouchableOpacity 
            style={styles.modalOverlayTouch}
            activeOpacity={1} 
            onPress={() => setMenuVisible(false)}
          />
        </View>
      </Modal>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab.toLowerCase()}...`}
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
          onSubmitEditing={() => {
            if (searchQuery.trim()) {
              setSearchQuery(searchQuery.trim());
            }
          }}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab);
              setSearchQuery('');
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'Movies' ? (
        <Movies navigation={navigation} searchQuery={searchQuery} />
      ) : (
        <Music navigation={navigation} searchQuery={searchQuery} />
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
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3F47',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
  },
  modalOverlayTouch: {
    flex: 1,
  },
  menuContainer: {
    width: width * 0.75,
    height: '100%',
    backgroundColor: '#1F1F1F',
    paddingTop: 50,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3A3F47',
    margin: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#ffffff',
    fontSize: 14,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    marginRight: 32,
    paddingBottom: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B68D9',
  },
  tabText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#ffffff',
  },
});

export default Home; 