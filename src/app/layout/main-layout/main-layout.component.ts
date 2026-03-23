import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { MenuPermiso } from '../../shared/models';
import { UsuarioService } from '../../core/services/usuario.service';

interface MenuItem {
  label: string;
  icon: string;
  children: { label: string; route: string; modulo: string }[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf, NgClass],
  template: `
    <!-- Sidebar -->
    <nav class="sidebar" [ngClass]="{ open: sidebarOpen() }">
      <div class="brand d-flex align-items-center gap-2">
        <i class="bi bi-shield-lock-fill text-info"></i>
        Sistema Corporativo
      </div>

      <ul class="nav flex-column mt-2 pb-4">
        <ng-container *ngFor="let menu of visibleMenus()">
          <li class="menu-parent">{{ menu.label }}</li>
          <li *ngFor="let child of menu.children">
            <a class="nav-link"
               [routerLink]="child.route"
               routerLinkActive="active"
               (click)="closeSidebar()">
              <i class="bi bi-dot"></i>
              {{ child.label }}
            </a>
          </li>
        </ng-container>
      </ul>
    </nav>

    <!-- Overlay mobile -->
    <div *ngIf="sidebarOpen()"
         class="position-fixed top-0 start-0 w-100 h-100"
         style="background:rgba(0,0,0,0.4);z-index:999;"
         (click)="closeSidebar()">
    </div>

    <!-- Topbar -->
    <header class="topbar">
      <button class="btn btn-sm btn-outline-secondary d-md-none me-2"
              (click)="toggleSidebar()">
        <i class="bi bi-list fs-5"></i>
      </button>

      <div class="flex-grow-1"></div>

      <!-- Info usuario -->
      <div class="d-flex align-items-center gap-2">
        <ng-container *ngIf="authService.currentUser() as user">
          <img *ngIf="user.strImagen"
               [src]="usuarioService.getImageUrl(user.strImagen)"
               class="avatar" alt="avatar" />
          <div *ngIf="!user.strImagen" class="avatar-placeholder">
            {{ user.nombre.charAt(0).toUpperCase() }}
          </div>
          <span class="d-none d-sm-inline fw-semibold text-secondary small">
            {{ user.nombre }}
          </span>
        </ng-container>
        <button class="btn btn-sm btn-outline-danger" (click)="logout()">
          <i class="bi bi-box-arrow-right"></i>
          <span class="d-none d-sm-inline ms-1">Salir</span>
        </button>
      </div>
    </header>

    <!-- Contenido -->
    <main class="main-content">
      <router-outlet />
    </main>
  `
})
export class MainLayoutComponent implements OnInit {
  sidebarOpen = signal(false);
  visibleMenus = signal<MenuItem[]>([]);

  private readonly menuConfig: MenuItem[] = [
    {
      label: 'Seguridad', icon: 'bi-shield-lock',
      children: [
        { label: 'Perfil',           route: '/seguridad/perfil',          modulo: 'perfil' },
        { label: 'Módulo',           route: '/seguridad/modulo',          modulo: 'modulo' },
        { label: 'Permisos Perfil',  route: '/seguridad/permisos-perfil', modulo: 'permisos-perfil' },
        { label: 'Usuario',          route: '/seguridad/usuario',         modulo: 'usuario' }
      ]
    },
    {
      label: 'Principal 1', icon: 'bi-grid',
      children: [
        { label: 'Principal 1.1', route: '/principal1/p11', modulo: 'principal1-1' },
        { label: 'Principal 1.2', route: '/principal1/p12', modulo: 'principal1-2' }
      ]
    },
    {
      label: 'Principal 2', icon: 'bi-grid-3x3',
      children: [
        { label: 'Principal 2.1', route: '/principal2/p21', modulo: 'principal2-1' },
        { label: 'Principal 2.2', route: '/principal2/p22', modulo: 'principal2-2' }
      ]
    }
  ];

  constructor(
    public authService: AuthService,
    public usuarioService: UsuarioService,
    private menuService: MenuService
  ) {}

  ngOnInit() {
    this.menuService.getMenu().subscribe({
      next: permisos => {
        this.authService.setPermisos(permisos);
        this.buildVisibleMenus(permisos);
      },
      error: () => {
        // Si falla, intenta con permisos en cache
        this.buildVisibleMenus(this.authService.permisos());
      }
    });
  }

  private buildVisibleMenus(permisos: MenuPermiso[]) {
    const modulosConAcceso = new Set(
      permisos
        .filter(p => p.bitAgregar || p.bitEditar || p.bitConsulta || p.bitEliminar || p.bitDetalle)
        .map(p => p.strNombreModulo.toLowerCase())
    );

    const menus: MenuItem[] = this.menuConfig
      .map(menu => ({
        ...menu,
        children: menu.children.filter(c => modulosConAcceso.has(c.modulo.toLowerCase()))
      }))
      .filter(menu => menu.children.length > 0);

    this.visibleMenus.set(menus);
  }

  toggleSidebar()  { this.sidebarOpen.update(v => !v); }
  closeSidebar()   { this.sidebarOpen.set(false); }
  logout()         { this.authService.logout(); }
}