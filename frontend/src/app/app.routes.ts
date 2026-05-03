import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { RecipesComponent } from './pages/recipes/recipes.component';
import { CreateRecipeComponent } from './pages/create-recipe/create-recipe.component';
import { RecipeDetailComponent } from './pages/recipe-detail/recipe-detail.component';
import { EditRecipeComponent } from './pages/edit-recipe/edit-recipe.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'recipes', component: RecipesComponent },
  { path: 'create-recipe', component: CreateRecipeComponent },
  { path: 'recipe/:id', component: RecipeDetailComponent },
  { path: 'edit-recipe/:id', component: EditRecipeComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
