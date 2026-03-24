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
    <form [formGroup]="form" (ngSubmit)="onSubmit()">

      <input class="form-control mb-2"
        formControlName="strNombreUsuario"
        placeholder="Usuario">

      <input class="form-control mb-2"
        type="password"
        formControlName="strPwd"
        placeholder="Contraseña">

      <!-- CAPTCHA -->
      <div class="mb-3 d-flex justify-content-center">
        <div id="recaptcha-container"></div>
      </div>

      <div *ngIf="captchaError()" class="text-danger text-center">
        Completa el captcha
      </div>

      <button class="btn btn-primary w-100" [disabled]="loading()">
        {{ loading() ? 'Cargando...' : 'Ingresar' }}
      </button>

    </form>
  `
})
export class LoginComponent implements OnInit, AfterViewInit {

  form!: FormGroup;

  loading = signal(false);
  captchaError = signal(false);

  private widgetId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      strNombreUsuario: ['', Validators.required],
      strPwd: ['', Validators.required]
    });
  }

  // 🔥 CLAVE: aquí se carga el captcha
  ngAfterViewInit() {
    this.loadRecaptcha();
  }

  private loadRecaptcha() {
    if ((window as any).grecaptcha) {
      this.renderRecaptcha();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;

    script.onload = () => this.renderRecaptcha();

    document.head.appendChild(script);
  }

  private renderRecaptcha() {
    const container = document.getElementById('recaptcha-container');
    if (!container) return;

    this.widgetId = grecaptcha.render('recaptcha-container', {
      sitekey: environment.recaptchaSiteKey,
      callback: () => this.captchaError.set(false),
      'expired-callback': () => this.captchaError.set(true)
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const token = grecaptcha.getResponse(this.widgetId);

    if (!token) {
      this.captchaError.set(true);
      return;
    }

    const { strNombreUsuario, strPwd } = this.form.value;

    this.loading.set(true);

    this.authService.login(strNombreUsuario, strPwd, token).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/seguridad/perfil']);
      },
      error: () => {
        this.loading.set(false);
        grecaptcha.reset(this.widgetId);
      }
    });
  }
}