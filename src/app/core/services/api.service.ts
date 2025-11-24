import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  // Testa se o backend está respondendo
  testBackend(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`);
  }

  // Testa a conexão com o banco de dados
  testDatabase(): Observable<any> {
    return this.http.get(`${this.baseUrl}/db/test`);
  }

  // Pega informações do backend
  getBackendInfo(): Observable<any> {
    return this.http.get(`${this.baseUrl}/debug/config`);
  }

  // Simula login (para testar)
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, { email, password });
  }
}