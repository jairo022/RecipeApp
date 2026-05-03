import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 transform transition-all duration-300 hover:scale-105">
        <div class="text-center mb-8">
          <div class="text-5xl mb-3">🍳</div>
          <h1 class="text-3xl font-bold text-gray-800">Create Account</h1>
          <p class="text-gray-500 mt-2">Join our recipe community today!</p>
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-semibold mb-2">Username</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Choose a username"
              required
            />
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-semibold mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              placeholder="Create a password"
              required
            />
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.02]"
          >
            Sign Up
          </button>
        </form>

        <p class="text-center text-gray-600 mt-6">
          Already have an account?
          <a routerLink="/login" class="text-green-600 font-semibold hover:text-green-700 transition">Login</a>
        </p>

        <div *ngIf="errorMessage" class="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `
})
export class SignupComponent {
  username = '';
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.errorMessage = '';
    this.authService.signup({
      username: this.username,
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveUser(response.user);
        this.router.navigate(['/recipes']);
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Signup failed';
      }
    });
  }
}
