import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <div class="text-center">
        <div style="font-size:6rem;" class="text-danger">
          <i class="bi bi-exclamation-triangle-fill"></i>
        </div>
        <h1 class="display-4 fw-bold text-dark">404</h1>
        <p class="lead text-muted">La página que buscas no existe o no tienes acceso.</p>
        <a routerLink="/login" class="btn btn-primary mt-3">
          <i class="bi bi-house me-2"></i> Volver al inicio
        </a>
      </div>
    </div>
  `
})
export class ErrorPageComponent {}