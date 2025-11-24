import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  testBackend(): Observable<string> {
    return this.http.get(`${this.baseUrl}/health`, { 
      responseType: 'text'
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erro de conexão com o backend'));
      })
    );
  }

  testDatabase(): Observable<string> {
    return this.http.get(`${this.baseUrl}/db/test`, { 
      responseType: 'text'
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erro de conexão com o banco'));
      })
    );
  }

  getBackendInfo(): Observable<string> {
    return this.http.get(`${this.baseUrl}/debug/config`, { 
      responseType: 'text'
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Erro ao carregar configurações'));
      })
    );
  }
}