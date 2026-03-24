import { Component, OnInit, AfterViewInit, signal } from '@angular/core';
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
          <i class="bi bi-shield-lock-fill text-primary" style="font-size:3rem;"></i>
          <h4 class="fw-bold mb-0">Sistema Corporativo</h4>
          <p class="text-muted small">Inicia sesión para continuar</p>
        </div>

        <div *ngIf="errorMsg()" class="alert alert-danger alert-dismissible py-2">
          {{ errorMsg() }}
          <button type="button" class="btn-close btn-sm" (click)="errorMsg.set('')"></button>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <!-- Usuario -->
          <input class="form-control mb-2"
            formControlName="strNombreUsuario"
            placeholder="Usuario">

          <!-- Password -->
          <input class="form-control mb-3"
            type="password"
            formControlName="strPwd"
            placeholder="Contraseña">

          <!-- CAPTCHA -->
          <div class="d-flex justify-content-center mb-2">
            <div id="recaptcha-container"></div>
          </div>

          <div *ngIf="captchaError()" class="text-danger text-center mb-2">
            Completa el captcha
          </div>

          <button class="btn btn-primary w-100" [disabled]="loading()">
            {{ loading() ? 'Verificando...' : 'Ingresar' }}
          </button>

        </form>
      </div>
    </div>

  `
})
export class LoginComponent implements OnInit, AfterViewInit {

  form!: FormGroup;

  loading      = signal(false);
  errorMsg     = signal('');
  captchaError = signal(false);

  private widgetId: number | null = null;

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
  }

  // 🔥 AQUÍ SE CARGA BIEN EL CAPTCHA
  ngAfterViewInit() {
    this.loadRecaptcha();
  }

  private loadRecaptcha() {
    // 1. Si grecaptcha ya está completamente cargado en la ventana
    if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
      this.renderRecaptcha();
      return;
    }

    // 2. Evitar inyectar múltiples scripts si el usuario entra y sale del componente
    if (document.getElementById('recaptcha-script')) {
      return;
    }

    const script = document.createElement('script');
    script.id = 'recaptcha-script';
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;

    // 3. Usar grecaptcha.ready() dentro del onload
    script.onload = () => {
      (window as any).grecaptcha.ready(() => {
        this.renderRecaptcha();
      });
    };

    document.head.appendChild(script);
  }

  private renderRecaptcha() {
    const container = document.getElementById('recaptcha-container');
    if (!container) return;

    this.widgetId = grecaptcha.render(container, {
      sitekey: environment.recaptchaSiteKey,
      callback: () => this.captchaError.set(false),
      'expired-callback': () => this.captchaError.set(true)
    });
  }

  onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (this.widgetId === null) {
      this.errorMsg.set('Captcha no cargado');
      return;
    }

    const token = grecaptcha.getResponse(this.widgetId);

    if (!token) {
      this.captchaError.set(true);
      return;
    }

    const { strNombreUsuario, strPwd } = this.form.value;

    this.loading.set(true);
    this.errorMsg.set('');

    this.authService.login(strNombreUsuario, strPwd, token).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/seguridad/perfil']);
      },
      error: err => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al iniciar sesión');
        grecaptcha.reset(this.widgetId);
      }
    });
  }
}