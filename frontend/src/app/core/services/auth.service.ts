import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly usernameState = signal<string>(localStorage.getItem('inv_user') ?? '');
  private readonly passwordState = signal<string>(localStorage.getItem('inv_pass') ?? '');

  readonly isLoggedIn = computed(() => !!this.usernameState() && !!this.passwordState());
  readonly username = computed(() => this.usernameState());
  readonly isAdmin = computed(() => this.usernameState().toLowerCase() === 'admin');

  login(username: string, password: string): void {
    this.usernameState.set(username);
    this.passwordState.set(password);
    localStorage.setItem('inv_user', username);
    localStorage.setItem('inv_pass', password);
  }

  logout(): void {
    this.usernameState.set('');
    this.passwordState.set('');
    localStorage.removeItem('inv_user');
    localStorage.removeItem('inv_pass');
  }

  basicToken(): string {
    return btoa(`${this.usernameState()}:${this.passwordState()}`);
  }
}
