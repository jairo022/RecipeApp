const express = require('express');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const router = express.Router();

// CREATE a new recipe
router.post('/', auth, async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      author: req.userId
    });
    await recipe.save();
    await recipe.populate('author', 'username');
    
    const io = req.app.get('io');
    io.emit('recipe:created', recipe);
    
    res.status(201).json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ all recipes (with filters)
router.get('/', async (req, res) => {
  try {
    const { difficulty, search } = req.query;
    let query = {};
    
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    const recipes = await Recipe.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ single recipe
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username');
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a recipe
router.put('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to edit this recipe' });
    }
    
    Object.assign(recipe, req.body);
    await recipe.save();
    await recipe.populate('author', 'username');
    
    const io = req.app.get('io');
    io.emit('recipe:updated', recipe);
    
    res.json(recipe);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a recipe
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    if (recipe.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this recipe' });
    }
    
    await recipe.deleteOne();
    
    const io = req.app.get('io');
    io.emit('recipe:deleted', req.params.id);
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;