import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-backend-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="backend-test">
      <h3>🔗 Teste de Conexão com Backend</h3>

      <div class="buttons">
        <button (click)="testBackend()" [disabled]="loading.backend">
          {{ loading.backend ? 'Testando...' : 'Testar Backend' }}
        </button>

        <button (click)="testDatabase()" [disabled]="loading.database">
          {{ loading.database ? 'Testando...' : 'Testar Banco' }}
        </button>

        <button (click)="getConfig()" [disabled]="loading.config">
          {{ loading.config ? 'Carregando...' : 'Ver Config' }}
        </button>
      </div>

      <div class="results">
        <div *ngIf="results.backend" class="result" [class.success]="results.backend.success">
          <strong>Backend:</strong> {{ results.backend.message }}
        </div>

        <div *ngIf="results.database" class="result" [class.success]="results.database.success">
          <strong>Banco:</strong> {{ results.database.message }}
        </div>

        <div *ngIf="results.config" class="result">
          <strong>Config:</strong> {{ results.config }}
        </div>

        <div *ngIf="error" class="error">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .backend-test {
      padding: 20px;
      border: 2px solid #ddd;
      border-radius: 8px;
      margin: 20px;
    }
    .buttons {
      margin-bottom: 15px;
    }
    button {
      margin-right: 10px;
      padding: 8px 16px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    .result {
      margin: 10px 0;
      padding: 10px;
      border-radius: 4px;
      background: #f8f9fa;
    }
    .success {
      background: #d4edda;
      color: #155724;
    }
    .error {
      color: #721c24;
      background: #f8d7da;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
  `]
})
export class BackendTestComponent {
  private apiService = inject(ApiService);

  loading = {
    backend: false,
    database: false,
    config: false
  };

  results = {
    backend: null as any,
    database: null as any,
    config: null as any
  };

  error: string = '';

  testBackend() {
    this.loading.backend = true;
    this.error = '';
    this.results.backend = null;

    this.apiService.testBackend().subscribe({
      next: (response: string) => {
        console.log('Resposta no componente:', response);
        this.results.backend = { success: true, message: response };
        this.loading.backend = false;
      },
      error: (err: any) => {
        console.error('Erro no componente:', err);
        this.results.backend = { success: false, message: 'Erro: ' + err.message };
        this.error = 'Backend não encontrado. Verifique se está rodando na porta 8080.';
        this.loading.backend = false;
      }
    });
  }

  testDatabase() {
    this.loading.database = true;
    this.error = '';
    this.results.database = null;

    this.apiService.testDatabase().subscribe({
      next: (response: string) => {
        this.results.database = { success: true, message: response };
        this.loading.database = false;
      },
      error: (err: any) => {
        this.results.database = { success: false, message: 'Erro: ' + err.message };
        this.error = 'Problema com o banco de dados.';
        this.loading.database = false;
      }
    });
  }

  getConfig() {
    this.loading.config = true;
    this.error = '';
    this.results.config = null;

    this.apiService.getBackendInfo().subscribe({
      next: (response: string) => {
        this.results.config = response;
        this.loading.config = false;
      },
      error: (err: any) => {
        this.results.config = 'Erro ao carregar configurações';
        this.error = 'Endpoint de configuração não disponível.';
        this.loading.config = false;
      }
    });
  }
}