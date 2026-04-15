import { Component, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PermisosPerfilService } from '../../../core/services/permisos-perfil.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { ModuloService } from '../../../core/services/modulo.service';
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
                  (ngModelChange)="onPerfilChange()">
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
                    [disabled]="!hayCambios || saving()">
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
                <tr *ngFor="let modulo of modulosArray()">
                  <td class="text-start fw-semibold">{{ modulo.strNombreModulo }}</td>
                  <td>
                    <input type="checkbox" 
                           [checked]="getPermisoValue(modulo.id!, 'bitAgregar')" 
                           (change)="onCheckboxChange(modulo.id!, 'bitAgregar', $event)">
                  </td>
                  <td>
                    <input type="checkbox" 
                           [checked]="getPermisoValue(modulo.id!, 'bitEditar')" 
                           (change)="onCheckboxChange(modulo.id!, 'bitEditar', $event)">
                  </td>
                  <td>
                    <input type="checkbox" 
                           [checked]="getPermisoValue(modulo.id!, 'bitEliminar')" 
                           (change)="onCheckboxChange(modulo.id!, 'bitEliminar', $event)">
                  </td>
                  <td>
                    <input type="checkbox" 
                           [checked]="getPermisoValue(modulo.id!, 'bitConsulta')" 
                           (change)="onCheckboxChange(modulo.id!, 'bitConsulta', $event)">
                  </td>
                  <td>
                    <input type="checkbox" 
                           [checked]="getPermisoValue(modulo.id!, 'bitDetalle')" 
                           (change)="onCheckboxChange(modulo.id!, 'bitDetalle', $event)">
                  </td>
                </tr>
                <tr *ngIf="modulosArray().length === 0">
                  <td colspan="6" class="text-center py-4 text-muted">
                    No hay módulos disponibles.
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="!hayCambios && !loadingPermisos() && modulosArray().length > 0" 
                 class="alert alert-light text-center mt-3 py-2">
              <i class="bi bi-info-circle me-1"></i>
              Sin cambios. Modifica algún permiso para habilitar el guardado.
            </div>
            
            <div *ngIf="hayCambios && !loadingPermisos() && modulosArray().length > 0" 
                 class="alert alert-warning text-center mt-3 py-2">
              <i class="bi bi-exclamation-triangle me-1"></i>
              Tienes cambios sin guardar. Haz clic en "Guardar Cambios".
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
  permisosData: any[] = [];
  permisosOriginalBackup: any[] = [];
  
  hayCambios: boolean = false;
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
  
  constructor(
    private perfilService: PerfilService,
    private moduloService: ModuloService,
    private ppService: PermisosPerfilService,
    private cdr: ChangeDetectorRef
  ) {}
  
  ngOnInit() {
    this.cargarCatalogos();
  }
  
  cargarCatalogos() {
    this.perfilService.getAll(1).subscribe({
      next: res => this.perfilesList.set(res.data || [])
    });
    
    this.moduloService.getAllSimple().subscribe({
      next: res => this.modulosList.set(Array.isArray(res) ? res : [])
    });
  }
  
  onPerfilChange() {
    if (!this.selectedPerfilId) {
      this.permisosData = [];
      this.permisosOriginalBackup = [];
      this.hayCambios = false;
      return;
    }
    
    this.loadingPermisos.set(true);
    this.hayCambios = false;
    
    this.ppService.getByPerfil(this.selectedPerfilId).subscribe({
      next: (permisos) => {
        // Crear un mapa con los permisos existentes
        const permisosMap = new Map();
        
        if (Array.isArray(permisos)) {
          permisos.forEach(p => {
            if (p.idModulo) {
              permisosMap.set(p.idModulo, {
                id: p.id,
                idPerfil: p.idPerfil,
                idModulo: p.idModulo,
                bitAgregar: p.bitAgregar === true,
                bitEditar: p.bitEditar === true,
                bitEliminar: p.bitEliminar === true,
                bitConsulta: p.bitConsulta === true,
                bitDetalle: p.bitDetalle === true
              });
            }
          });
        }
        
        // Construir el arreglo de permisos para todos los módulos
        this.permisosData = [];
        
        this.modulosArray().forEach(modulo => {
          const moduloId = modulo.id;
          if (moduloId) {
            const permisoExistente = permisosMap.get(moduloId);
            
            if (permisoExistente) {
              this.permisosData.push({ ...permisoExistente });
            } else {
              this.permisosData.push({
                idPerfil: this.selectedPerfilId,
                idModulo: moduloId,
                bitAgregar: false,
                bitEditar: false,
                bitEliminar: false,
                bitConsulta: false,
                bitDetalle: false
              });
            }
          }
        });
        
        this.permisosOriginalBackup = JSON.parse(JSON.stringify(this.permisosData));
        this.loadingPermisos.set(false);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando permisos:', err);
        this.loadingPermisos.set(false);
        alert('Error al cargar los permisos del perfil');
      }
    });
  }
  
  getPermisoValue(moduloId: number, campo: string): boolean {
    const permiso = this.permisosData.find(p => p.idModulo === moduloId);
    if (!permiso) return false;
    return permiso[campo] === true;
  }
  
  onCheckboxChange(moduloId: number, campo: string, event: Event) {
    const valor = (event.target as HTMLInputElement).checked;
    
    const permiso = this.permisosData.find(p => p.idModulo === moduloId);
    if (permiso) {
      permiso[campo] = valor;
    }
    
    // Detectar si hay cambios
    this.hayCambios = false;
    for (let i = 0; i < this.permisosData.length; i++) {
      const actual = this.permisosData[i];
      const original = this.permisosOriginalBackup[i];
      
      if (!original) {
        this.hayCambios = true;
        break;
      }
      
      if (actual.bitAgregar !== original.bitAgregar ||
          actual.bitEditar !== original.bitEditar ||
          actual.bitEliminar !== original.bitEliminar ||
          actual.bitConsulta !== original.bitConsulta ||
          actual.bitDetalle !== original.bitDetalle) {
        this.hayCambios = true;
        break;
      }
    }
    
    this.cdr.detectChanges();
  }
  
  guardarCambios() {
    if (!this.selectedPerfilId || !this.hayCambios) {
      return;
    }
    
    this.saving.set(true);
    
    const permisosAGuardar = this.permisosData.filter(permiso => {
      const original = this.permisosOriginalBackup.find(p => p.idModulo === permiso.idModulo);
      if (!original) return true;
      return (permiso.bitAgregar !== original.bitAgregar ||
              permiso.bitEditar !== original.bitEditar ||
              permiso.bitEliminar !== original.bitEliminar ||
              permiso.bitConsulta !== original.bitConsulta ||
              permiso.bitDetalle !== original.bitDetalle);
    });
    
    const promises = permisosAGuardar.map(permiso => {
      if (permiso.id) {
        return this.ppService.update(permiso.id, permiso).toPromise();
      } else {
        return this.ppService.create(permiso).toPromise();
      }
    });
    
    Promise.all(promises)
      .then(() => {
        this.permisosOriginalBackup = JSON.parse(JSON.stringify(this.permisosData));
        this.hayCambios = false;
        this.saving.set(false);
        alert('✅ Permisos guardados correctamente');
        this.cdr.detectChanges();
      })
      .catch(err => {
        console.error('Error guardando permisos:', err);
        this.saving.set(false);
        alert('❌ Error al guardar los permisos');
      });
  }
}