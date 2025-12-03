import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private TOKEN_KEY = 'auth_token';

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  login(email: string): void {
    if (!this.isBrowser()) return;
    const fakeToken = 'token-' + email + '-' + new Date().getTime();
    localStorage.setItem(this.TOKEN_KEY, fakeToken);
  }

  signup(email: string): void {
    if (!this.isBrowser()) return;
    const fakeToken = 'token-' + email + '-' + new Date().getTime();
    localStorage.setItem(this.TOKEN_KEY, fakeToken);
  }

  logout(): void {
    if (!this.isBrowser()) return;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser()) return false;
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
