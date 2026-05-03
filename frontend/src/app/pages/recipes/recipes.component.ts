import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-recipes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-lg sticky top-0 z-50">
        <div class="container mx-auto px-4 py-4">
          <div class="flex justify-between items-center">
            <div class="flex items-center space-x-2">
              <span class="text-3xl">🍳</span>
              <h1 class="text-2xl font-bold text-gray-800">RecipeApp</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-600">Welcome, {{ username }}!</span>
              <button (click)="logout()" class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
          <div>
            <h2 class="text-3xl font-bold text-gray-800">My Recipes</h2>
            <p class="text-gray-600 mt-1">Discover and share amazing recipes</p>
          </div>
          <button routerLink="/create-recipe" class="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2">
            <span>+</span>
            <span>Create Recipe</span>
          </button>
        </div>

        <div class="mb-8">
          <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="searchRecipes()" placeholder="Search recipes..." class="w-full px-6 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p class="text-gray-500 mt-4">Loading delicious recipes...</p>
        </div>

        <div *ngIf="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div *ngFor="let recipe of recipes" class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <div class="p-6">
              <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-bold text-gray-800">{{ recipe.title }}</h3>
                <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">{{ recipe.difficulty }}</span>
              </div>
              <p class="text-gray-600 mb-4">{{ recipe.description?.substring(0, 100) }}...</p>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">By {{ recipe.author?.username }}</span>
                <button [routerLink]="['/recipe', recipe._id]" class="text-blue-500 hover:text-blue-700 font-semibold">View Recipe →</button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!loading && recipes.length === 0" class="text-center py-12 bg-white rounded-xl">
          <div class="text-6xl mb-4">📖</div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No recipes yet</h3>
          <p class="text-gray-500 mb-4">Be the first to share a recipe!</p>
          <button routerLink="/create-recipe" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">Create Your First Recipe</button>
        </div>
      </div>
    </div>
  `
})
export class RecipesComponent implements OnInit {
  recipes: any[] = [];
  loading = true;
  searchTerm = '';
  username = '';

  constructor(
    private recipeService: RecipeService,
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getUser();
    this.username = user?.username || '';
  }

  ngOnInit() {
    this.loadRecipes();
  }

  loadRecipes() {
    this.loading = true;
    this.recipeService.getAll().subscribe({
      next: (data) => {
        this.recipes = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  searchRecipes() {
    if (this.searchTerm) {
      this.recipeService.getAll({ search: this.searchTerm }).subscribe({
        next: (data) => {
          this.recipes = data;
        }
      });
    } else {
      this.loadRecipes();
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
