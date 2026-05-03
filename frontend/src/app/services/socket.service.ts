import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;

  connect(): void {
    this.socket = io(environment.socketUrl);
    console.log('Socket connected');
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinRecipeRoom(recipeId: string): void {
    if (this.socket) {
      this.socket.emit('join:recipe', recipeId);
      console.log('Joined recipe room:', recipeId);
    }
  }

  leaveRecipeRoom(recipeId: string): void {
    if (this.socket) {
      this.socket.emit('leave:recipe', recipeId);
    }
  }

  onNewComment(): Observable<any> {
    return new Observable(observer => {
      if (this.socket) {
        this.socket.on('new_comment', (data) => {
          console.log('New comment received:', data);
          observer.next(data);
        });
      }
    });
  }
}
