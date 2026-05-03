import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 hover:scale-105">
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🍳</div>
          <h1 class="text-3xl font-bold text-gray-800">RecipeApp</h1>
          <p class="text-gray-500 mt-2">Welcome back! Please login to your account</p>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your email"
              required
            />
          </div>

          <div class="mb-6">
            <label class="block text-gray-700 text-sm font-semibold mb-2">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Login
          </button>
        </form>

        <p class="text-center text-gray-600 mt-6">
          Don't have an account?
          <a routerLink="/signup" class="text-blue-600 font-semibold hover:text-blue-700 transition">Sign up</a>
        </p>

        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveUser(response.user);
        this.router.navigate(['/recipes']);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Login failed';
      }
    });
  }
}
