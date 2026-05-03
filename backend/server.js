require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// ========== USER SCHEMA ==========
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// ========== AUTH ROUTES (no middleware, no next issues) ==========
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email exists' });
    
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'mysecret');
    res.json({ token, user: { _id: user._id, username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user._id }, 'mysecret');
    res.json({ token, user: { _id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== RECIPE SCHEMA ==========
const recipeSchema = new mongoose.Schema({
  title: String,
  description: String,
  ingredients: Array,
  instructions: Array,
  prepTime: Number,
  cookTime: Number,
  servings: Number,
  difficulty: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// ========== RECIPE ROUTES ==========
app.post('/api/recipes', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, 'mysecret');
    const recipe = new Recipe({ ...req.body, author: decoded.userId });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'username');
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username');
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== DATABASE ==========
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));