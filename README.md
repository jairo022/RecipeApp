# 🍳 RecipeApp

A full-stack recipe sharing application where users can create, share, and comment on recipes in real-time.

## Live Demo

- **Frontend**: [https://recipe-frontend-fvxv.onrender.com](https://recipe-frontend-fvxv.onrender.com)
- **Backend API**: [https://recipe-api-live.onrender.com](https://recipe-api-live.onrender.com)

## Features

- ✅ User authentication (Signup/Login with JWT)
- ✅ Create, Read, Update, Delete recipes
- ✅ Real-time comments using WebSockets
- ✅ Search recipes by title
- ✅ Owner-only edit/delete permissions
- ✅ Responsive UI with Tailwind CSS

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Socket.io for real-time features

### Frontend
- Angular 17
- Tailwind CSS for styling
- Socket.io-client for WebSocket connection

### Deployment
- Render (Backend + Frontend)

  ### Environment Variables
- MongoURI: mongodb+srv://jairomanuelfr_db_user:QvKclCRhB5TVywh0@recipeappcluster.ltslbko.mongodb.net/recipe_app?retryWrites=true&w=majority&appName=RecipeAppCluster
- JWT: my_super_secret_jwt_key_recipeapp_2025.
