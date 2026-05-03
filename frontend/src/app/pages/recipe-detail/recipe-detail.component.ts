import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../services/recipe.service';
import { CommentService, Comment } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { SocketService } from '../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gray-100 py-8">
      <div class="container mx-auto px-4 max-w-4xl">
        <!-- Loading State -->
        <div *ngIf="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p class="text-gray-500 mt-4">Loading recipe...</p>
        </div>

        <!-- Recipe Content -->
        <div *ngIf="!loading && recipe" class="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div class="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-6">
            <h1 class="text-3xl font-bold text-white">{{ recipe.title }}</h1>
            <p class="text-orange-100 mt-2">By {{ recipe.author?.username }}</p>
          </div>

          <div class="p-6">
            <p class="text-gray-700 text-lg mb-6">{{ recipe.description }}</p>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl">⏱️</div>
                <div class="font-semibold">{{ recipe.prepTime }} min</div>
                <div class="text-sm text-gray-500">Prep Time</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl">🍳</div>
                <div class="font-semibold">{{ recipe.cookTime }} min</div>
                <div class="text-sm text-gray-500">Cook Time</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl">👥</div>
                <div class="font-semibold">{{ recipe.servings }}</div>
                <div class="text-sm text-gray-500">Servings</div>
              </div>
              <div class="text-center p-3 bg-gray-50 rounded-lg">
                <div class="text-2xl">📊</div>
                <div class="font-semibold">{{ recipe.difficulty }}</div>
                <div class="text-sm text-gray-500">Difficulty</div>
              </div>
            </div>

            <div class="mb-8">
              <h2 class="text-xl font-bold text-gray-800 mb-3">🛒 Ingredients</h2>
              <ul class="space-y-2">
                <li *ngFor="let ing of recipe.ingredients" class="flex items-center gap-2">
                  <span class="text-green-500">✓</span>
                  <span>{{ ing.quantity }} {{ ing.name }}</span>
                </li>
              </ul>
            </div>

            <div class="mb-8">
              <h2 class="text-xl font-bold text-gray-800 mb-3">📖 Instructions</h2>
              <ol class="space-y-3">
                <li *ngFor="let step of recipe.instructions; let i = index" class="text-gray-700">
                  <span class="font-bold mr-2">{{ i + 1 }}.</span> {{ step }}
                </li>
              </ol>
            </div>

            <div class="flex gap-3 pt-4 border-t">
              <button *ngIf="isOwner" [routerLink]="['/edit-recipe', recipe._id]" class="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition">Edit Recipe</button>
              <button *ngIf="isOwner" (click)="deleteRecipe()" class="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition">Delete Recipe</button>
              <button routerLink="/recipes" class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition">Back to Recipes</button>
            </div>
          </div>
        </div>

        <!-- Comments Section -->
        <div *ngIf="!loading && recipe" class="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div class="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4">
            <h2 class="text-xl font-bold text-white">💬 Comments</h2>
            <p class="text-gray-300 text-sm">Join the discussion</p>
          </div>

          <div class="p-6">
            <!-- Add Comment Form -->
            <div class="mb-6">
              <textarea rows="3" [(ngModel)]="newComment" placeholder="Write a comment..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
              <button (click)="addComment()" class="mt-2 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">Post Comment</button>
            </div>

            <!-- Comments List -->
            <div *ngIf="comments.length === 0" class="text-center py-8 text-gray-500">
              No comments yet. Be the first to comment!
            </div>

            <div *ngFor="let comment of comments" class="border-b border-gray-200 py-4">
              <div class="flex justify-between items-start">
                <div>
                  <span class="font-semibold text-gray-800">{{ comment.author?.username }}</span>
                  <span class="text-xs text-gray-500 ml-2">{{ comment.createdAt | date:'medium' }}</span>
                </div>
                <button *ngIf="currentUserId === comment.author?._id" (click)="deleteComment(comment._id!)" class="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </div>
              <p class="text-gray-700 mt-2">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RecipeDetailComponent implements OnInit, OnDestroy {
  recipe: any = null;
  comments: Comment[] = [];
  loading = true;
  isOwner = false;
  currentUserId = '';
  newComment = '';
  private socketSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private recipeService: RecipeService,
    private commentService: CommentService,
    private authService: AuthService,
    private socketService: SocketService,
    private router: Router
  ) {
    const user = this.authService.getUser();
    this.currentUserId = user?._id || '';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadRecipe(id);
      this.loadComments(id);
      this.setupSocket(id);
    }
  }

  ngOnDestroy() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.socketService.leaveRecipeRoom(id);
    }
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  loadRecipe(id: string) {
    this.recipeService.getOne(id).subscribe({
      next: (data) => {
        this.recipe = data;
        this.isOwner = this.currentUserId === this.recipe.author?._id;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadComments(recipeId: string) {
    this.commentService.getByRecipe(recipeId).subscribe({
      next: (data) => {
        this.comments = data;
      }
    });
  }

  setupSocket(recipeId: string) {
    this.socketService.connect();
    this.socketService.joinRecipeRoom(recipeId);

    this.socketSubscription = this.socketService.onNewComment().subscribe((comment) => {
      if (comment.recipe === recipeId) {
        this.comments.unshift(comment);
      }
    });
  }

  addComment() {
    if (!this.newComment.trim()) return;

    const recipeId = this.route.snapshot.paramMap.get('id');
    if (recipeId) {
      this.commentService.create({ content: this.newComment, recipeId }).subscribe({
        next: (comment) => {
          this.newComment = '';
        },
        error: (err) => {
          console.error('Error adding comment:', err);
        }
      });
    }
  }

  deleteComment(commentId: string) {
    if (confirm('Delete this comment?')) {
      this.commentService.delete(commentId).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c._id !== commentId);
        }
      });
    }
  }

  deleteRecipe() {
    if (confirm('Delete this recipe?')) {
      this.recipeService.delete(this.recipe._id).subscribe({
        next: () => {
          this.router.navigate(['/recipes']);
        }
      });
    }
  }
}
