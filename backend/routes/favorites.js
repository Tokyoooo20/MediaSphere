const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// Get all favorites (movies and music)
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      movies: user.favoriteMovies,
      tracks: user.favoriteTracks
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Error fetching favorites' });
  }
});

// Add movie to favorites
router.post('/movies', protect, async (req, res) => {
  try {
    const { movieId, title, poster_path, vote_average, release_date } = req.body;

    const user = await User.findById(req.user._id);

    // Check if movie already exists in favorites
    const movieExists = user.favoriteMovies.find(m => m.movieId === movieId);
    if (movieExists) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    user.favoriteMovies.push({
      movieId,
      title,
      poster_path,
      vote_average,
      release_date
    });

    await user.save();
    res.json(user.favoriteMovies);
  } catch (error) {
    console.error('Add favorite movie error:', error);
    res.status(500).json({ message: 'Error adding movie to favorites' });
  }
});

// Remove movie from favorites
router.delete('/movies/:movieId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favoriteMovies = user.favoriteMovies.filter(
      movie => movie.movieId !== req.params.movieId
    );
    await user.save();
    res.json(user.favoriteMovies);
  } catch (error) {
    console.error('Remove favorite movie error:', error);
    res.status(500).json({ message: 'Error removing movie from favorites' });
  }
});

// Add track to favorites
router.post('/tracks', protect, async (req, res) => {
  try {
    const { trackId, title, artist, album } = req.body;

    const user = await User.findById(req.user._id);

    // Check if track already exists in favorites
    const trackExists = user.favoriteTracks.find(t => t.trackId === trackId);
    if (trackExists) {
      return res.status(400).json({ message: 'Track already in favorites' });
    }

    user.favoriteTracks.push({
      trackId,
      title,
      artist,
      album
    });

    await user.save();
    res.json(user.favoriteTracks);
  } catch (error) {
    console.error('Add favorite track error:', error);
    res.status(500).json({ message: 'Error adding track to favorites' });
  }
});

// Remove track from favorites
router.delete('/tracks/:trackId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.favoriteTracks = user.favoriteTracks.filter(
      track => track.trackId !== req.params.trackId
    );
    await user.save();
    res.json(user.favoriteTracks);
  } catch (error) {
    console.error('Remove favorite track error:', error);
    res.status(500).json({ message: 'Error removing track from favorites' });
  }
});

module.exports = router; 