import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-100">
      <nav class="bg-white shadow-md p-4">
        <div class="container mx-auto flex justify-between items-center">
          <h1 class="text-2xl font-bold text-blue-600">RecipeApp</h1>
          <div class="flex items-center gap-4">
            <span class="text-gray-700">Welcome, {{ username }}!</span>
            <button (click)="logout()" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div class="container mx-auto p-8">
        <div class="bg-white rounded-lg shadow p-8 text-center">
          <h2 class="text-2xl font-bold mb-4">Welcome to RecipeApp!</h2>
          <p class="text-gray-600">You are successfully logged in.</p>
          <p class="text-gray-600 mt-2">Your backend is running on port 5001.</p>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  username: string = '';

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getUser();
    this.username = user?.username || '';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
