import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/api';

  // Método temporário - sem autenticação por enquanto
  saveGame(saveName: string, gameData: any): Observable<any> {
    console.log('Salvando jogo:', saveName, gameData);
    
    // Por enquanto, vamos salvar apenas localmente
    // Quando o backend tiver autenticação, implemente a chamada real:
    // return this.http.post(`${this.baseUrl}/game/save`, { saveName, gameData });
    
    return of({ 
      success: true, 
      message: 'Jogo salvo localmente',
      timestamp: new Date().toISOString()
    });
  }

  // Método temporário - sem autenticação por enquanto
  updateCookies(cookies: number): Observable<any> {
    console.log('Atualizando cookies:', cookies);
    
    // Por enquanto, vamos apenas simular
    // Quando o backend tiver autenticação, implemente a chamada real:
    // return this.http.put(`${this.baseUrl}/user/cookies`, { cookies });
    
    return of({ 
      success: true, 
      cookies: cookies,
      updatedAt: new Date().toISOString()
    });
  }

  // Método para carregar jogo salvo
  loadGame(saveName: string): Observable<any> {
    console.log('Carregando jogo:', saveName);
    
    // Por enquanto, retorna dados vazios
    return of({
      success: true,
      gameData: null,
      message: 'Nenhum jogo salvo encontrado'
    });
  }

  // Método para obter estatísticas do jogo
  getGameStats(): Observable<any> {
    console.log('Obtendo estatísticas do jogo');
    
    // Por enquanto, retorna estatísticas mock
    return of({
      totalPlayTime: '2h 30m',
      totalCookies: 1500,
      buildingsConstructed: 8,
      investmentsMade: 12
    });
  }
}