import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent }
];

@NgModule({
  declarations: [], // Vazio pois o componente é standalone
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    LoginComponent // Importa o componente standalone
  ]
})
export class LoginModule {}