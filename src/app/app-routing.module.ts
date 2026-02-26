import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './components/home/home.component';
import { ErrorComponent } from './components/error/error.component';
import { InsertDataComponent } from './components/insert-data/insert-data.component';
import { RegisterComponent } from './components/register/register.component';
import { UploadAndCarouselComponent } from './components/upload-and-carousel/upload-and-carousel.component';
import { MensajesComponent } from './components/mensajes/mensajes.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { breadcrumb: 'Inicio' } },
  { path: 'error', component: ErrorComponent, data: { breadcrumb: 'Error' } },
  { path: 'insert-data', component: InsertDataComponent, data: { breadcrumb: 'Insertar Datos' } },
  { path: 'register', component: RegisterComponent, data: { breadcrumb: 'Registro' } },
  { path: 'upload', component: UploadAndCarouselComponent, data: { breadcrumb: 'Subir Imágenes' } },
  { path: 'mensajes', component: MensajesComponent },
  { path: '**', redirectTo: '/error' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }