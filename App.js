import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import Welcome from './frontend/screens/Welcome';
import Signup from './frontend/screens/Signup';
import Login from './frontend/screens/Login';
import Home from './frontend/screens/Home';
import Movies from './frontend/screens/Movies';
import Music from './frontend/screens/Music';
import MovieDetail from './frontend/screens/MovieDetail';
import MusicDetail from './frontend/screens/MusicDetail';
import Profile from './frontend/screens/Profile';
import Favorites from './frontend/screens/Favorites';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right'
        }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Signup" component={Signup} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Movies" component={Movies} />
        <Stack.Screen name="Music" component={Music} />
        <Stack.Screen name="MovieDetail" component={MovieDetail} />
        <Stack.Screen name="MusicDetail" component={MusicDetail} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="Favorites" component={Favorites} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
