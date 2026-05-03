require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

// ========== USER SCHEMA (NO next) ==========
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String
});

// NO next - use synchronous hash
userSchema.pre('save', function() {
  if (this.isModified('password')) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
});

const User = mongoose.model('User', userSchema);

// ========== AUTH ROUTES ==========
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
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

// ========== RECIPE CRUD ==========
app.post('/api/recipes', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, 'mysecret');
    const recipe = new Recipe({ ...req.body, author: decoded.userId });
    await recipe.save();
    await recipe.populate('author', 'username');
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find().populate('author', 'username').sort({ createdAt: -1 });
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

app.put('/api/recipes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, 'mysecret');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (recipe.author.toString() !== decoded.userId) return res.status(403).json({ error: 'Unauthorized' });
    Object.assign(recipe, req.body);
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, 'mysecret');
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Not found' });
    if (recipe.author.toString() !== decoded.userId) return res.status(403).json({ error: 'Unauthorized' });
    await recipe.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== COMMENT SCHEMA ==========
const commentSchema = new mongoose.Schema({
  content: String,
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

// ========== COMMENT ROUTES ==========
app.get('/api/comments/recipe/:recipeId', async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId }).populate('author', 'username').sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/comments', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, 'mysecret');
    const comment = new Comment({ content: req.body.content, recipe: req.body.recipeId, author: decoded.userId });
    await comment.save();
    await comment.populate('author', 'username');
    io.to(`recipe_${req.body.recipeId}`).emit('new_comment', comment);
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/comments/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    const decoded = jwt.verify(token, 'mysecret');
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Not found' });
    if (comment.author.toString() !== decoded.userId) return res.status(403).json({ error: 'Unauthorized' });
    await comment.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== SOCKET.IO ==========
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join:recipe', (recipeId) => {
    socket.join(`recipe_${recipeId}`);
  });
  socket.on('leave:recipe', (recipeId) => {
    socket.leave(`recipe_${recipeId}`);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ========== DATABASE ==========
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('DB error:', err));

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));