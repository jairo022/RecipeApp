import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-create-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
            <h1 class="text-2xl font-bold text-white">Create New Recipe</h1>
            <p class="text-blue-100">Share your delicious recipe with the world</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Recipe Title *</label>
              <input type="text" [(ngModel)]="recipe.title" name="title" class="w-full px-4 py-2 border rounded-lg" required />
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2">Description *</label>
              <textarea rows="4" [(ngModel)]="recipe.description" name="description" class="w-full px-4 py-2 border rounded-lg" required></textarea>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Prep Time (min)</label>
                <input type="number" [(ngModel)]="recipe.prepTime" name="prepTime" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Cook Time (min)</label>
                <input type="number" [(ngModel)]="recipe.cookTime" name="cookTime" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Servings</label>
                <input type="number" [(ngModel)]="recipe.servings" name="servings" class="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label class="block text-gray-700 font-semibold mb-2">Difficulty</label>
                <select [(ngModel)]="recipe.difficulty" name="difficulty" class="w-full px-4 py-2 border rounded-lg">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <!-- Ingredients -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-gray-700 font-semibold">Ingredients</label>
                <button type="button" (click)="addIngredient()" class="text-blue-500">+ Add Ingredient</button>
              </div>
              <div *ngFor="let ing of recipe.ingredients; let i = index; trackBy: trackByIndex" class="flex gap-3 mb-2">
                <input type="text" [(ngModel)]="ing.name" [name]="'ing_name_' + i" placeholder="Ingredient name" class="flex-1 px-4 py-2 border rounded-lg" />
                <input type="text" [(ngModel)]="ing.quantity" [name]="'ing_qty_' + i" placeholder="Quantity" class="w-32 px-4 py-2 border rounded-lg" />
                <button type="button" (click)="removeIngredient(i)" class="text-red-500">✕</button>
              </div>
            </div>

            <!-- Instructions -->
            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-gray-700 font-semibold">Instructions</label>
                <button type="button" (click)="addInstruction()" class="text-blue-500">+ Add Step</button>
              </div>
              <div *ngFor="let step of recipe.instructions; let i = index; trackBy: trackByIndex" class="flex gap-3 mb-2">
                <span class="font-bold w-8 pt-2">{{ i + 1 }}.</span>
                <textarea rows="2" [(ngModel)]="recipe.instructions[i]" [name]="'instruction_' + i" placeholder="Step {{ i + 1 }}" class="flex-1 px-4 py-2 border rounded-lg"></textarea>
                <button type="button" *ngIf="recipe.instructions.length > 1" (click)="removeInstruction(i)" class="text-red-500">✕</button>
              </div>
            </div>

            <div class="flex gap-3 pt-4">
              <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded-lg">Create Recipe</button>
              <button type="button" routerLink="/recipes" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CreateRecipeComponent {
  recipe: any = {
    title: '',
    description: '',
    ingredients: [{ name: '', quantity: '' }],
    instructions: [''],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'Medium'
  };

  constructor(private recipeService: RecipeService, private router: Router) {}

  trackByIndex(index: number, item: any): number {
    return index;
  }

  addIngredient() {
    this.recipe.ingredients.push({ name: '', quantity: '' });
  }

  removeIngredient(index: number) {
    this.recipe.ingredients.splice(index, 1);
  }

  addInstruction() {
    this.recipe.instructions.push('');
  }

  removeInstruction(index: number) {
    this.recipe.instructions.splice(index, 1);
  }

  onSubmit() {
    console.log('Submitting recipe:', this.recipe);
    this.recipeService.create(this.recipe).subscribe({
      next: (response) => {
        console.log('Recipe created:', response);
        this.router.navigate(['/recipes']);
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Failed to create recipe');
      }
    });
  }
}
