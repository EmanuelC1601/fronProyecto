import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.prod';
import { LoginResponse, MenuPermiso } from '../../shared/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  currentUser = signal<LoginResponse['usuario'] | null>(null);
  permisos    = signal<MenuPermiso[]>([]);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadFromStorage();
  }

  // 🔐 LOGIN
  login(strNombreUsuario: string, strPwd: string, captchaToken: string) {

    console.log('🔐 Intentando login...');
    console.log('API:', `${this.apiUrl}/auth/login`);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      {
        strNombreUsuario,
        strPwd,
        captchaToken
      }
    ).pipe(

      tap(res => {
        console.log('✅ LOGIN OK:', res);

        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));

        this.currentUser.set(res.usuario);
      }),

      // 🔥 MANEJO DE ERRORES (IMPORTANTE PARA PRODUCCIÓN)
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error login:', error);

        let mensaje = 'Error al iniciar sesión';

        if (error.error?.message) {
          mensaje = error.error.message;
        }

        return throwError(() => ({
          ...error,
          message: mensaje
        }));
      })
    );
  }

  // 🚪 LOGOUT
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');

    this.currentUser.set(null);
    this.permisos.set([]);

    this.router.navigate(['/login']);
  }

  // 🎟️ TOKEN
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ✅ ESTADO DE SESIÓN
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // 🔐 PERMISOS
  setPermisos(permisos: MenuPermiso[]) {
    this.permisos.set(permisos);
    localStorage.setItem('permisos', JSON.stringify(permisos));
  }

  getPermisoForModulo(nombreModulo: string): MenuPermiso | undefined {
    return this.permisos().find(p =>
      p.strNombreModulo.toLowerCase() === nombreModulo.toLowerCase()
    );
  }

  // 🔄 RECUPERAR SESIÓN
  private loadFromStorage() {
    try {
      const usuario  = localStorage.getItem('usuario');
      const permisos = localStorage.getItem('permisos');

      if (usuario) {
        this.currentUser.set(JSON.parse(usuario));
      }

      if (permisos) {
        this.permisos.set(JSON.parse(permisos));
      }

    } catch (error) {
      console.warn('⚠️ Error cargando sesión:', error);
      this.logout();
    }
  }
}