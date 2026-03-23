import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      // Seguridad
      {
        path: 'seguridad/perfil',
        loadComponent: () =>
          import('./features/seguridad/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'seguridad/modulo',
        loadComponent: () =>
          import('./features/seguridad/modulo/modulo.component').then(m => m.ModuloComponent)
      },
      {
        path: 'seguridad/permisos-perfil',
        loadComponent: () =>
          import('./features/seguridad/permisos-perfil/permisos-perfil.component')
            .then(m => m.PermisosPerfilComponent)
      },
      {
        path: 'seguridad/usuario',
        loadComponent: () =>
          import('./features/seguridad/usuario/usuario.component').then(m => m.UsuarioComponent)
      },
      // Principal 1
      {
        path: 'principal1/p11',
        loadComponent: () =>
          import('./features/principal1/p11/p11.component').then(m => m.P11Component)
      },
      {
        path: 'principal1/p12',
        loadComponent: () =>
          import('./features/principal1/p12/p12.component').then(m => m.P12Component)
      },
      // Principal 2
      {
        path: 'principal2/p21',
        loadComponent: () =>
          import('./features/principal2/p21/p21.component').then(m => m.P21Component)
      },
      {
        path: 'principal2/p22',
        loadComponent: () =>
          import('./features/principal2/p22/p22.component').then(m => m.P22Component)
      },
      // Ruta por defecto dentro del layout
      { path: '**', redirectTo: 'seguridad/perfil' }
    ]
  },
  {
    path: 'error',
    loadComponent: () =>
      import('./shared/components/error-page/error-page.component').then(m => m.ErrorPageComponent)
  },
  { path: '**', redirectTo: 'error' }
];