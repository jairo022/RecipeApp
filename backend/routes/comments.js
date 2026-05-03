const express = require('express');
const Comment = require('../models/Comment');
const auth = require('../middleware/auth');
const router = express.Router();

// CREATE a comment
router.post('/', auth, async (req, res) => {
  try {
    const comment = new Comment({
      content: req.body.content,
      recipe: req.body.recipeId,
      author: req.userId
    });
    await comment.save();
    await comment.populate('author', 'username');
    
    const io = req.app.get('io');
    io.to(`recipe_${req.body.recipeId}`).emit('comment:new', comment);
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ comments for a recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const comments = await Comment.find({ recipe: req.params.recipeId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// READ single comment
router.get('/:id', async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'username');
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a comment
router.put('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    comment.content = req.body.content;
    await comment.save();
    await comment.populate('author', 'username');
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;