import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = false;
  private userEmail: string | null = null;

  constructor(private router: Router) {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const storedAuth = localStorage.getItem('isLoggedIn');
    const storedEmail = localStorage.getItem('userEmail');

    if (storedAuth === 'true' && storedEmail) {
      this.isAuthenticated = true;
      this.userEmail = storedEmail;
    }
  }

  login(email: string, password: string): boolean {
    // Simulação de autenticação
    if (email === 'admin@admin.com' && password === '123') {
      this.isAuthenticated = true;
      this.userEmail = email;
      
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      console.log('Login bem-sucedido para:', email);
      return true;
    }
    
    console.log('Login falhou para:', email);
    return false;
  }

  logout(): void {
    this.isAuthenticated = false;
    this.userEmail = null;
    
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    
    console.log('Usuário deslogado');
  }

  isLoggedIn(): boolean {
    const storedAuth = localStorage.getItem('isLoggedIn');
    if (storedAuth === 'true' && !this.isAuthenticated) {
      this.isAuthenticated = true;
      this.userEmail = localStorage.getItem('userEmail');
    }
    return this.isAuthenticated;
  }

  // ADICIONE ESTE MÉTODO:
  getUserEmail(): string | null {
    return this.userEmail || localStorage.getItem('userEmail');
  }
}