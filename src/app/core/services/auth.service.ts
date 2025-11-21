import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private userEmail: string | null = null;

  constructor(private router: Router) {}

  login(email: string, password: string): boolean {
    // Simulação de autenticação
    if (email === 'admin@admin.com' && password === '123') {
      this.isAuthenticated = true;
      this.userEmail = email;
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      return true;
    }
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userEmail = null;
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    // Verifica tanto no serviço quanto no localStorage
    const storedAuth = localStorage.getItem('isLoggedIn');
    if (storedAuth === 'true') {
      this.isAuthenticated = true;
      this.userEmail = localStorage.getItem('userEmail');
    }
    return this.isAuthenticated;
  }

  getUserEmail(): string | null {
    return this.userEmail || localStorage.getItem('userEmail');
  }
}