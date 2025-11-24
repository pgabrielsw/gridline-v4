import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet], 
  template: `
    <div class="app">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .app {
      padding: 0; 
      margin: 0; 
      font-family: Arial, sans-serif;
      min-height: 100vh;
      width: 100%;
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