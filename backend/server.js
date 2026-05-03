require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// User Schema
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: String,
  password: String
}));

// Signup - SIMPLE, NO NEXT
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashed = bcrypt.hashSync(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'secret');
    res.json({ token, user: { _id: user._id, username, email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login - SIMPLE, NO NEXT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, 'secret');
    res.json({ token, user: { _id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recipe Schema
const Recipe = mongoose.model('Recipe', new mongoose.Schema({
  title: String,
  description: String,
  ingredients: Array,
  instructions: Array,
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  difficulty: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}));

// Create Recipe
app.post('/api/recipes', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');
    const recipe = new Recipe({ ...req.body, author: decoded.userId });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'username');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single recipe
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username');
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update recipe
app.put('/api/recipes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (recipe.author.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(recipe, req.body);
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete recipe
app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (recipe.author.toString() !== decoded.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await recipe.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('DB error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));