import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comment {
  _id?: string;
  content: string;
  recipe: string;
  author?: { _id: string; username: string };
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getByRecipe(recipeId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/comments/recipe/${recipeId}`);
  }

  create(comment: { content: string; recipeId: string }): Observable<Comment> {
    return this.http.post<Comment>(`${this.apiUrl}/comments`, comment, { headers: this.getHeaders() });
  }

  delete(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comments/${id}`, { headers: this.getHeaders() });
  }
}
