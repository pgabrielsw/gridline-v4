import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { GameComponent } from './game.component';

const routes: Routes = [
  { path: '', component: GameComponent }
];

@NgModule({
  declarations: [], // Remove a declaração do componente
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    GameComponent // Importa o componente standalone
  ]
})
export class GameModule {}