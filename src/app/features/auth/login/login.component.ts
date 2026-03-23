import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="login-wrapper">
      <div class="login-card">

        <div class="text-center mb-4">
          <div class="mb-3">
            <i class="bi bi-shield-lock-fill text-primary" style="font-size:3rem;"></i>
          </div>
          <h4 class="fw-bold mb-0">Sistema Corporativo</h4>
          <p class="text-muted small">Inicia sesión para continuar</p>
        </div>

        <div *ngIf="errorMsg()" class="alert alert-danger alert-dismissible py-2">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ errorMsg() }}
          <button type="button" class="btn-close btn-sm" (click)="errorMsg.set('')"></button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Usuario -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Usuario</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-person"></i>
              </span>
              <input
                type="text"
                class="form-control"
                formControlName="strNombreUsuario"
                placeholder="Nombre de usuario"
                [class.is-invalid]="isInvalid('strNombreUsuario')" />
              <div class="invalid-feedback">El usuario es requerido.</div>
            </div>
          </div>

          <!-- Contraseña -->
          <div class="mb-3">
            <label class="form-label fw-semibold">Contraseña</label>
            <div class="input-group">
              <span class="input-group-text bg-light">
                <i class="bi bi-lock"></i>
              </span>
              <input
                [type]="showPwd() ? 'text' : 'password'"
                class="form-control"
                formControlName="strPwd"
                placeholder="Contraseña"
                [class.is-invalid]="isInvalid('strPwd')" />
              <button class="btn btn-outline-secondary" type="button"
                      (click)="togglePwd()">
                <i [class]="showPwd() ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
              <div class="invalid-feedback">La contraseña es requerida.</div>
            </div>
          </div>

          <!-- reCAPTCHA -->
          <div class="mb-3 d-flex justify-content-center">
            <div id="recaptcha-container"></div>
          </div>

          <div *ngIf="captchaError()" class="text-danger small text-center mb-2">
            <i class="bi bi-exclamation-circle me-1"></i>Por favor completa el captcha.
          </div>

          <!-- Botón -->
          <button type="submit" class="btn btn-primary w-100 mt-1" [disabled]="loading()">
            <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!loading()" class="bi bi-box-arrow-in-right me-2"></i>
            {{ loading() ? 'Verificando...' : 'Ingresar' }}
          </button>

        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {

  form!: FormGroup;

  loading      = signal(false);
  errorMsg     = signal('');
  showPwd      = signal(false);
  captchaError = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/seguridad/perfil']);
      return;
    }

    this.form = this.fb.group({
      strNombreUsuario: ['', Validators.required],
      strPwd: ['', Validators.required]
    });

    this.loadRecaptcha();
  }

  // ✅ NUEVO MÉTODO (FIX)
  togglePwd() {
    this.showPwd.update(v => !v);
  }

  private loadRecaptcha() {
    if (document.getElementById('recaptcha-script')) {
      this.renderRecaptcha();
      return;
    }

    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit';
    script.async = true;
    script.defer = true;

    (window as any)['onRecaptchaLoad'] = () => this.renderRecaptcha();

    document.head.appendChild(script);
  }

  private renderRecaptcha() {
    if (typeof grecaptcha !== 'undefined') {
      grecaptcha.render('recaptcha-container', {
        sitekey: environment.recaptchaSiteKey
      });
    }
  }

  isInvalid(field: string): boolean {
    const c = this.form.get(field);
    return !!(c?.invalid && c.touched);
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    let captchaToken = '';

    if (typeof grecaptcha !== 'undefined') {
      captchaToken = grecaptcha.getResponse();
      if (!captchaToken) {
        this.captchaError.set(true);
        return;
      }
    }

    this.captchaError.set(false);

    const { strNombreUsuario, strPwd } = this.form.value;

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(strNombreUsuario, strPwd, captchaToken).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/seguridad/perfil']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al iniciar sesión');
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
      }
    });
  }
}