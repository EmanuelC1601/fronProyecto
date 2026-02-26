import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxCaptchaModule } from 'ngx-captcha';

import { CommonModule } from '@angular/common';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ErrorComponent } from './components/error/error.component';
import { InsertDataComponent } from './components/insert-data/insert-data.component';
import { RegisterComponent } from './components/register/register.component';
import { UploadAndCarouselComponent } from './components/upload-and-carousel/upload-and-carousel.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { MensajesComponent } from './components/mensajes/mensajes.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ErrorComponent,
    InsertDataComponent,
    RegisterComponent,
    UploadAndCarouselComponent,
    BreadcrumbComponent,
    MensajesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxCaptchaModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }