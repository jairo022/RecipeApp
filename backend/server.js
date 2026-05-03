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
    origin: ['http://localhost:4200', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);
app.use(cors());
app.use(express.json());

// ========== USER SCHEMA & AUTH ==========
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already exists' });
    const user = new User({ username, email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'mysecretkey');
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
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id }, 'mysecretkey');
    res.json({ token, user: { _id: user._id, username: user.username, email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========== RECIPE SCHEMA & CRUD ==========
const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  ingredients: [{ name: String, quantity: String }],
  instructions: [String],
  prepTime: { type: Number, default: 0 },
  cookTime: { type: Number, default: 0 },
  servings: { type: Number, default: 1 },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Recipe = mongoose.model('Recipe', recipeSchema);

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.userId = jwt.verify(token, 'mysecretkey').userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post('/api/recipes', auth, async (req, res) => {
  try {
    const recipe = new Recipe({ ...req.body, author: req.userId });
    await recipe.save();
    await recipe.populate('author', 'username');
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recipes', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    const recipes = await Recipe.find(query).populate('author', 'username').sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username');
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/recipes/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    Object.assign(recipe, req.body);
    await recipe.save();
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/recipes/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await recipe.deleteOne();
    res.json({ message: 'Recipe deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== COMMENT SCHEMA & CRUD ==========
const commentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

app.get('/api/comments/recipe/:recipeId', async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/comments', auth, async (req, res) => {
  try {
    const comment = new Comment({
      content: req.body.content,
      recipe: req.body.recipeId,
      author: req.userId
    });
    await comment.save();
    await comment.populate('author', 'username');
    
    // Emit real-time event
    io.to(`recipe_${req.body.recipeId}`).emit('new_comment', comment);
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SOCKET.IO ==========
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join:recipe', (recipeId) => {
    socket.join(`recipe_${recipeId}`);
    console.log(`Socket ${socket.id} joined recipe ${recipeId}`);
  });
  
  socket.on('leave:recipe', (recipeId) => {
    socket.leave(`recipe_${recipeId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ========== MongoDB Connection ==========
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB error:', err.message));

const PORT = 5001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});