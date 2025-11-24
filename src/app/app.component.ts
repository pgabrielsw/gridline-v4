import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BackendTestComponent } from './components/backend-test/backend-test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BackendTestComponent],
  template: `
    <div class="app">
      <h1>🏙️ Gridline V2</h1>
      <app-backend-test></app-backend-test>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app {
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    h1 {
      color: #333;
      text-align: center;
    }
  `]
})
export class AppComponent {
  title = 'gridline-frontend';
}