import { Component, OnInit, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PermisosPerfilService } from '../../../core/services/permisos-perfil.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ModuloService } from '../../../core/services/modulo.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermisosPerfil, Perfil, Modulo } from '../../../shared/models';

@Component({
  selector: 'app-permisos-perfil',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, BreadcrumbComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Seguridad'},{label:'Permisos Perfil'}]" />

    <div class="card shadow-sm border-0">
      <div class="card-header bg-white border-0 pt-4 pb-2">
        <h5 class="fw-bold mb-0">
          <i class="bi bi-key me-2 text-primary"></i>Gestión de Permisos
        </h5>
        <p class="text-muted small mb-0">Administra los permisos por perfil y módulo</p>
      </div>

      <div class="card-body">
        <!-- Selector de Perfil -->
        <div class="mb-4">
          <label class="form-label fw-semibold">Seleccionar Perfil</label>
          <select class="form-select w-100" style="max-width: 350px;"
                  [(ngModel)]="selectedPerfilId"
                  (change)="onPerfilChange()">
            <option [ngValue]="null">Selecciona un perfil...</option>
            <option *ngFor="let p of perfilesList()" [ngValue]="p.id">
              {{ p.strNombrePerfil }}
            </option>
          </select>
          <div class="form-text text-muted small mt-1">
            <i class="bi bi-info-circle"></i>
            Selecciona un perfil para ver y editar sus permisos.
          </div>
        </div>

        <!-- Tabla de Permisos (solo si hay perfil seleccionado) -->
        <div *ngIf="selectedPerfilId">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <i class="bi bi-person-badge me-1 text-primary"></i>
              <span class="fw-semibold">Permisos para:</span>
              <span class="text-primary ms-1">{{ selectedPerfilNombre() }}</span>
            </div>
            <button class="btn btn-sm btn-success" 
                    (click)="guardarCambios()"
                    [disabled]="!hayCambios() || saving()">
              <span *ngIf="saving()" class="spinner-border spinner-border-sm me-1"></span>
              <i class="bi bi-save me-1"></i> Guardar Cambios
            </button>
          </div>

          <!-- Mostrar loading -->
          <div *ngIf="loadingPermisos()" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Cargando permisos...</p>
          </div>

          <!-- Tabla de permisos -->
          <div *ngIf="!loadingPermisos()" class="table-responsive">
            <table class="table table-bordered table-hover align-middle text-center">
              <thead class="table-light">
                <tr>
                  <th class="text-start" style="width: 200px">Módulos</th>
                  <th style="min-width: 90px">Agregar</th>
                  <th style="min-width: 90px">Editar</th>
                  <th style="min-width: 90px">Eliminar</th>
                  <th style="min-width: 90px">Consultar</th>
                  <th style="min-width: 90px">Detalle</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let modulo of modulosArray()">
                  <td class="text-start fw-semibold">
                    <i class="bi bi-grid me-2 text-secondary"></i>
                    {{ modulo.strNombreModulo }}
                   </td>
                  <td>
                    <div class="form-check d-flex justify-content-center">
                      <input class="form-check-input" type="checkbox"
                             [ngModel]="getPermiso(modulo.id!, 'bitAgregar')"
                             (ngModelChange)="setPermiso(modulo.id!, 'bitAgregar', $event)" />
                    </div>
                   </td>
                  <td>
                    <div class="form-check d-flex justify-content-center">
                      <input class="form-check-input" type="checkbox"
                             [ngModel]="getPermiso(modulo.id!, 'bitEditar')"
                             (ngModelChange)="setPermiso(modulo.id!, 'bitEditar', $event)" />
                    </div>
                   </td>
                  <td>
                    <div class="form-check d-flex justify-content-center">
                      <input class="form-check-input" type="checkbox"
                             [ngModel]="getPermiso(modulo.id!, 'bitEliminar')"
                             (ngModelChange)="setPermiso(modulo.id!, 'bitEliminar', $event)" />
                    </div>
                   </td>
                  <td>
                    <div class="form-check d-flex justify-content-center">
                      <input class="form-check-input" type="checkbox"
                             [ngModel]="getPermiso(modulo.id!, 'bitConsulta')"
                             (ngModelChange)="setPermiso(modulo.id!, 'bitConsulta', $event)" />
                    </div>
                   </td>
                  <td>
                    <div class="form-check d-flex justify-content-center">
                      <input class="form-check-input" type="checkbox"
                             [ngModel]="getPermiso(modulo.id!, 'bitDetalle')"
                             (ngModelChange)="setPermiso(modulo.id!, 'bitDetalle', $event)" />
                    </div>
                   </td>
                 </tr>
                <tr *ngIf="modulosArray().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No hay módulos disponibles. Crea algunos módulos primero.
                   </td>
                 </tr>
              </tbody>
            </table>

            <!-- Mensaje cuando no hay cambios -->
            <div *ngIf="!hayCambios() && !loadingPermisos() && modulosArray().length > 0" 
                 class="alert alert-light text-center mt-3 py-2">
              <i class="bi bi-info-circle me-1"></i>
              Sin cambios. Modifica algún permiso para habilitar el guardado.
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay perfil seleccionado -->
        <div *ngIf="!selectedPerfilId" class="text-center py-5 text-muted">
          <i class="bi bi-person-badge fs-1 d-block mb-3"></i>
          <p class="mb-0">Selecciona un perfil para ver sus permisos</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th, .table td {
      vertical-align: middle;
    }
    .form-check-input {
      width: 1.2rem;
      height: 1.2rem;
      cursor: pointer;
    }
    .table-bordered {
      border: 1px solid #dee2e6;
    }
  `]
})
export class PermisosPerfilComponent implements OnInit {
  // Listas como signals
  perfilesList = signal<Perfil[]>([]);
  modulosList = signal<Modulo[]>([]);
  
  // Estado
  selectedPerfilId: number | null = null;
  permisosOriginales = new Map<number, PermisosPerfil>();
  permisosEditados = new Map<number, PermisosPerfil>();
  
  // Signals para UI
  saving = signal(false);
  loadingPermisos = signal(false);
  loadingCatalogos = signal(false);
  
  // Computed: devuelve un array siempre (para evitar errores)
  modulosArray = computed(() => {
    const lista = this.modulosList();
    return Array.isArray(lista) ? lista : [];
  });
  
  // Computed: nombre del perfil seleccionado
  selectedPerfilNombre = computed(() => {
    const perfil = this.perfilesList().find(p => p.id === this.selectedPerfilId);
    return perfil?.strNombrePerfil || '';
  });
  
  // Computed: hay cambios sin guardar
  hayCambios = computed(() => {
    if (this.permisosOriginales.size !== this.permisosEditados.size) return true;
    
    for (const [moduloId, editado] of this.permisosEditados) {
      const original = this.permisosOriginales.get(moduloId);
      if (!original) return true;
      
      if (original.bitAgregar !== editado.bitAgregar ||
          original.bitEditar !== editado.bitEditar ||
          original.bitEliminar !== editado.bitEliminar ||
          original.bitConsulta !== editado.bitConsulta ||
          original.bitDetalle !== editado.bitDetalle) {
        return true;
      }
    }
    return false;
  });
  
  constructor(
    private perfilService: PerfilService,
    private moduloService: ModuloService,
    private ppService: PermisosPerfilService,
    private authService: AuthService
  ) {}
  
  ngOnInit() {
    this.cargarCatalogos();
  }
  
  cargarCatalogos() {
    this.loadingCatalogos.set(true);
    
    // Cargar perfiles
    this.perfilService.getAll(1).subscribe({
      next: res => {
        console.log('✅ Perfiles cargados:', res.data);
        this.perfilesList.set(res.data || []);
        this.loadingCatalogos.set(false);
      },
      error: err => {
        console.error('❌ Error cargando perfiles:', err);
        this.loadingCatalogos.set(false);
      }
    });
    
    // Cargar módulos
    this.moduloService.getAllSimple().subscribe({
      next: res => {
        console.log('✅ Módulos cargados:', res);
        this.modulosList.set(Array.isArray(res) ? res : []);
      },
      error: err => {
        console.error('❌ Error cargando módulos:', err);
        this.modulosList.set([]);
      }
    });
  }
  
  onPerfilChange() {
    if (!this.selectedPerfilId) {
      this.permisosOriginales.clear();
      this.permisosEditados.clear();
      return;
    }
    
    this.loadingPermisos.set(true);
    
    console.log('📡 Cargando permisos para perfil:', this.selectedPerfilId);
    
    this.ppService.getByPerfil(this.selectedPerfilId).subscribe({
      next: (permisos) => {
        console.log('✅ Permisos recibidos:', permisos);
        
        // Limpiar maps
        this.permisosOriginales.clear();
        this.permisosEditados.clear();
        
        // Cargar permisos existentes
        if (Array.isArray(permisos)) {
          permisos.forEach(p => {
            if (p.idModulo) {
              this.permisosOriginales.set(p.idModulo, p);
              this.permisosEditados.set(p.idModulo, { ...p });
            }
          });
        }
        
        // Asegurar que todos los módulos tengan permisos
        const modulos = this.modulosArray();
        modulos.forEach(modulo => {
          const moduloId = modulo.id;
          if (moduloId && !this.permisosOriginales.has(moduloId)) {
            const nuevoPermiso: PermisosPerfil = {
              idPerfil: this.selectedPerfilId!,
              idModulo: moduloId,
              bitAgregar: false,
              bitEditar: false,
              bitEliminar: false,
              bitConsulta: false,
              bitDetalle: false
            };
            this.permisosOriginales.set(moduloId, nuevoPermiso);
            this.permisosEditados.set(moduloId, { ...nuevoPermiso });
          }
        });
        
        this.loadingPermisos.set(false);
      },
      error: err => {
        console.error('❌ Error cargando permisos:', err);
        this.loadingPermisos.set(false);
      }
    });
  }
  
  getPermiso(moduloId: number, campo: string): boolean {
    const permiso = this.permisosEditados.get(moduloId);
    if (!permiso) return false;
    
    switch(campo) {
      case 'bitAgregar': return permiso.bitAgregar;
      case 'bitEditar': return permiso.bitEditar;
      case 'bitEliminar': return permiso.bitEliminar;
      case 'bitConsulta': return permiso.bitConsulta;
      case 'bitDetalle': return permiso.bitDetalle;
      default: return false;
    }
  }
  
  setPermiso(moduloId: number, campo: string, valor: boolean) {
    let permiso = this.permisosEditados.get(moduloId);
    
    if (!permiso) {
      permiso = {
        idPerfil: this.selectedPerfilId!,
        idModulo: moduloId,
        bitAgregar: false,
        bitEditar: false,
        bitEliminar: false,
        bitConsulta: false,
        bitDetalle: false
      };
      this.permisosEditados.set(moduloId, permiso);
    }
    
    switch(campo) {
      case 'bitAgregar': permiso.bitAgregar = valor; break;
      case 'bitEditar': permiso.bitEditar = valor; break;
      case 'bitEliminar': permiso.bitEliminar = valor; break;
      case 'bitConsulta': permiso.bitConsulta = valor; break;
      case 'bitDetalle': permiso.bitDetalle = valor; break;
    }
  }
  
  guardarCambios() {
    if (!this.selectedPerfilId || !this.hayCambios()) return;
    
    this.saving.set(true);
    
    const permisosAGuardar: PermisosPerfil[] = [];
    
    for (const [moduloId, editado] of this.permisosEditados) {
      const original = this.permisosOriginales.get(moduloId);
      
      if (!original || 
          original.bitAgregar !== editado.bitAgregar ||
          original.bitEditar !== editado.bitEditar ||
          original.bitEliminar !== editado.bitEliminar ||
          original.bitConsulta !== editado.bitConsulta ||
          original.bitDetalle !== editado.bitDetalle) {
        permisosAGuardar.push(editado);
      }
    }
    
    const promises = permisosAGuardar.map(permiso => {
      const existingId = this.permisosOriginales.get(permiso.idModulo!)?.id;
      
      if (existingId) {
        return this.ppService.update(existingId, permiso).toPromise();
      } else {
        return this.ppService.create(permiso).toPromise();
      }
    });
    
    Promise.all(promises)
      .then(() => {
        for (const [moduloId, editado] of this.permisosEditados) {
          this.permisosOriginales.set(moduloId, { ...editado });
        }
        this.saving.set(false);
        alert('✅ Permisos guardados correctamente');
      })
      .catch(err => {
        console.error('Error guardando permisos:', err);
        this.saving.set(false);
        alert('❌ Error al guardar los permisos');
      });
  }
}