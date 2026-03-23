import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { LoginResponse, MenuPermiso } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl;

  currentUser = signal<LoginResponse['usuario'] | null>(null);
  permisos    = signal<MenuPermiso[]>([]);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  login(strNombreUsuario: string, strPwd: string, captchaToken: string) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
      strNombreUsuario,
      strPwd,
      captchaToken
    }).pipe(
      tap(res => {
        localStorage.setItem('token',   res.token);
        localStorage.setItem('usuario', JSON.stringify(res.usuario));
        this.currentUser.set(res.usuario);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('permisos');
    this.currentUser.set(null);
    this.permisos.set([]);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  setPermisos(permisos: MenuPermiso[]) {
    this.permisos.set(permisos);
    localStorage.setItem('permisos', JSON.stringify(permisos));
  }

  getPermisoForModulo(nombreModulo: string): MenuPermiso | undefined {
    return this.permisos().find(p =>
      p.strNombreModulo.toLowerCase() === nombreModulo.toLowerCase()
    );
  }

  private loadFromStorage() {
    const usuario  = localStorage.getItem('usuario');
    const permisos = localStorage.getItem('permisos');
    if (usuario)  this.currentUser.set(JSON.parse(usuario));
    if (permisos) this.permisos.set(JSON.parse(permisos));
  }
}