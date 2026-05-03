import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';

@Component({
  selector: 'app-edit-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4 max-w-3xl">
        <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
            <h1 class="text-2xl font-bold text-white">Edit Recipe</h1>
          </div>

          <form (ngSubmit)="onSubmit()" class="p-6 space-y-6">
            <div>
              <label class="block text-gray-700 font-semibold mb-2">Recipe Title</label>
              <input type="text" [(ngModel)]="recipe.title" name="title" class="w-full px-4 py-2 border rounded-lg" required />
            </div>

            <div>
              <label class="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea rows="3" [(ngModel)]="recipe.description" name="description" class="w-full px-4 py-2 border rounded-lg" required></textarea>
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

            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-gray-700 font-semibold">Ingredients</label>
                <button type="button" (click)="addIngredient()" class="text-blue-500">+ Add</button>
              </div>
              <div *ngFor="let ing of recipe.ingredients; let i = index" class="flex gap-3 mb-2">
                <input type="text" [(ngModel)]="ing.name" [name]="'ing_name_' + i" placeholder="Name" class="flex-1 px-4 py-2 border rounded-lg" />
                <input type="text" [(ngModel)]="ing.quantity" [name]="'ing_qty_' + i" placeholder="Quantity" class="w-32 px-4 py-2 border rounded-lg" />
                <button type="button" (click)="removeIngredient(i)" class="text-red-500">✕</button>
              </div>
            </div>

            <div>
              <div class="flex justify-between items-center mb-3">
                <label class="block text-gray-700 font-semibold">Instructions</label>
                <button type="button" (click)="addInstruction()" class="text-blue-500">+ Add Step</button>
              </div>
              <div *ngFor="let step of recipe.instructions; let i = index" class="flex gap-3 mb-2">
                <span class="font-bold w-8">{{ i + 1 }}.</span>
                <textarea rows="2" [(ngModel)]="recipe.instructions[i]" [name]="'instruction_' + i" class="flex-1 px-4 py-2 border rounded-lg"></textarea>
                <button type="button" (click)="removeInstruction(i)" class="text-red-500">✕</button>
              </div>
            </div>

            <div class="flex gap-3">
              <button type="submit" class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">Save Changes</button>
              <button type="button" routerLink="/recipes" class="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EditRecipeComponent implements OnInit {
  recipe: any = {
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: 'Medium'
  };

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private router: Router
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.recipeService.getOne(id).subscribe({
        next: (data) => {
          this.recipe = data;
        }
      });
    }
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
    this.recipeService.update(this.recipe._id, this.recipe).subscribe({
      next: () => {
        this.router.navigate(['/recipe', this.recipe._id]);
      }
    });
  }
}
