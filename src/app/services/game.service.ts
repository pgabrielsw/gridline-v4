import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  saveGame(saveName: string, gameData: any): Observable<any> {
    
    console.log('Salvando jogo:', saveName, gameData);
    return of({ success: true, message: 'Jogo salvo localmente' });
  }

  updateCookies(cookies: number): Observable<any> {
    
    console.log('Atualizando cookies:', cookies);
    return of({ success: true, cookies: cookies });
  }
}