import { Component, OnInit, signal, computed } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PermisosPerfilService } from '../../../core/services/permisos-perfil.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ModuloService } from '../../../core/services/modulo.service';
import { AuthService } from '../../../core/services/auth.service';
import { PermisosPerfil, Perfil, Modulo } from '../../../shared/models';

@Component({
  selector: 'app-permisos-perfil',
  standalone: true,
  imports: [NgFor, NgIf, BreadcrumbComponent],
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
                  (change)="onPerfilChange($event)">
            <option value="">Selecciona un perfil...</option>
            <option *ngFor="let p of perfilesList()" [value]="p.id">
              {{ p.strNombrePerfil }}
            </option>
          </select>
          <div class="form-text text-muted small mt-1">
            <i class="bi bi-info-circle"></i>
            Selecciona un perfil para ver y editar sus permisos.
          </div>
        </div>

        <!-- Tabla de Permisos -->
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

          <div *ngIf="loadingPermisos()" class="text-center py-5">
            <div class="spinner-border text-primary"></div>
            <p class="mt-2 text-muted">Cargando permisos...</p>
          </div>

          <div *ngIf="!loadingPermisos()" class="table-responsive">
            <table class="table table-bordered table-hover align-middle text-center">
              <thead class="table-light">
                <tr>
                  <th class="text-start">Módulos</th>
                  <th>Agregar</th>
                  <th>Editar</th>
                  <th>Eliminar</th>
                  <th>Consultar</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let modulo of modulosArray(); trackBy: trackById">
                  <td class="text-start fw-semibold">{{ modulo.strNombreModulo }}</td>
                  <td><input type="checkbox" [checked]="getPermiso(modulo.id!, 'bitAgregar')" (change)="setPermiso(modulo.id!, 'bitAgregar', $event)"></td>
                  <td><input type="checkbox" [checked]="getPermiso(modulo.id!, 'bitEditar')" (change)="setPermiso(modulo.id!, 'bitEditar', $event)"></td>
                  <td><input type="checkbox" [checked]="getPermiso(modulo.id!, 'bitEliminar')" (change)="setPermiso(modulo.id!, 'bitEliminar', $event)"></td>
                  <td><input type="checkbox" [checked]="getPermiso(modulo.id!, 'bitConsulta')" (change)="setPermiso(modulo.id!, 'bitConsulta', $event)"></td>
                  <td><input type="checkbox" [checked]="getPermiso(modulo.id!, 'bitDetalle')" (change)="setPermiso(modulo.id!, 'bitDetalle', $event)"></td>
                </tr>
                <tr *ngIf="modulosArray().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No hay módulos disponibles.
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="!hayCambios() && !loadingPermisos() && modulosArray().length > 0" 
                 class="alert alert-light text-center mt-3 py-2">
              <i class="bi bi-info-circle me-1"></i>
              Sin cambios. Modifica algún permiso para habilitar el guardado.
            </div>
          </div>
        </div>

        <div *ngIf="!selectedPerfilId" class="text-center py-5 text-muted">
          <i class="bi bi-person-badge fs-1 d-block mb-3"></i>
          <p>Selecciona un perfil para ver sus permisos</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th, .table td { vertical-align: middle; }
    input[type="checkbox"] { width: 1.2rem; height: 1.2rem; cursor: pointer; }
  `]
})
export class PermisosPerfilComponent implements OnInit {
  perfilesList = signal<Perfil[]>([]);
  modulosList = signal<Modulo[]>([]);
  
  selectedPerfilId: number | null = null;
  permisosOriginales = new Map<number, PermisosPerfil>();
  permisosEditados = new Map<number, PermisosPerfil>();
  
  saving = signal(false);
  loadingPermisos = signal(false);
  
  modulosArray = computed(() => {
    const lista = this.modulosList();
    return Array.isArray(lista) ? lista : [];
  });
  
  selectedPerfilNombre = computed(() => {
    const perfil = this.perfilesList().find(p => p.id === this.selectedPerfilId);
    return perfil?.strNombrePerfil || '';
  });
  
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
    private ppService: PermisosPerfilService
  ) {}
  
  ngOnInit() {
    this.cargarCatalogos();
  }
  
  trackById(index: number, item: Modulo) {
    return item.id;
  }
  
  cargarCatalogos() {
    this.perfilService.getAll(1).subscribe({
      next: res => this.perfilesList.set(res.data || [])
    });
    
    this.moduloService.getAllSimple().subscribe({
      next: res => this.modulosList.set(Array.isArray(res) ? res : [])
    });
  }
  
  onPerfilChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedPerfilId = select.value ? parseInt(select.value) : null;
    
    if (!this.selectedPerfilId) {
      this.permisosOriginales.clear();
      this.permisosEditados.clear();
      return;
    }
    
    this.loadingPermisos.set(true);
    
    this.ppService.getByPerfil(this.selectedPerfilId).subscribe({
      next: (permisos) => {
        this.permisosOriginales.clear();
        this.permisosEditados.clear();
        
        if (Array.isArray(permisos)) {
          permisos.forEach(p => {
            if (p.idModulo) {
              this.permisosOriginales.set(p.idModulo, p);
              this.permisosEditados.set(p.idModulo, { ...p });
            }
          });
        }
        
        this.modulosArray().forEach(modulo => {
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
      error: () => this.loadingPermisos.set(false)
    });
  }
  
  getPermiso(moduloId: number, campo: string): boolean {
    return this.permisosEditados.get(moduloId)?.[campo as keyof PermisosPerfil] as boolean || false;
  }
  
  setPermiso(moduloId: number, campo: string, event: Event) {
    const valor = (event.target as HTMLInputElement).checked;
    
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
    }
    
    (permiso as any)[campo] = valor;
    this.permisosEditados.set(moduloId, { ...permiso });
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
      return existingId 
        ? this.ppService.update(existingId, permiso).toPromise()
        : this.ppService.create(permiso).toPromise();
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
        console.error(err);
        this.saving.set(false);
        alert('❌ Error al guardar los permisos');
      });
  }
}