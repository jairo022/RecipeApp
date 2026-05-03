try {
  console.log('Loading dotenv...');
  require('dotenv').config();
  console.log('Dotenv loaded');
  
  console.log('Loading express...');
  const express = require('express');
  console.log('Express loaded');
  
  console.log('Loading auth routes...');
  const authRoutes = require('./routes/auth');
  console.log('Auth routes loaded');
  
  console.log('Loading recipe routes...');
  const recipeRoutes = require('./routes/recipes');
  console.log('Recipe routes loaded');
  
  console.log('Loading comment routes...');
  const commentRoutes = require('./routes/comments');
  console.log('Comment routes loaded');
  
  console.log('All files loaded successfully!');
} catch (error) {
  console.error('ERROR:', error.message);
  console.error('Stack:', error.stack);
}
