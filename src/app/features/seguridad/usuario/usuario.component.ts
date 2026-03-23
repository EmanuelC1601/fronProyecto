import { Component, OnInit, signal } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { PerfilService } from '../../../core/services/perfil.service';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario, Perfil } from '../../../shared/models';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, BreadcrumbComponent, PaginationComponent],
  template: `
    <app-breadcrumb [items]="[{label:'Seguridad'},{label:'Usuario'}]" />

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-bold mb-0"><i class="bi bi-people me-2 text-primary"></i>Usuarios</h5>
      <button *ngIf="permisos().bitAgregar" class="btn btn-primary btn-sm" (click)="openForm()">
        <i class="bi bi-plus-circle me-1"></i> Nuevo Usuario
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Usuario</th>
                <th>Perfil</th>
                <th>Correo</th>
                <th class="text-center">Estado</th>
                <th *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle"
                    class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="loading()">
                <td colspan="6" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary"></div> Cargando...
                </td>
              </tr>
              <tr *ngIf="!loading() && usuarios().length === 0">
                <td colspan="6" class="text-center py-4 text-muted">Sin registros</td>
              </tr>
              <tr *ngFor="let u of usuarios()">
                <td>
                  <img *ngIf="u.strImagen"
                       [src]="usuarioService.getImageUrl(u.strImagen)"
                       class="avatar" alt="avatar" />
                  <div *ngIf="!u.strImagen" class="avatar-placeholder">
                    {{ u.strNombreUsuario.charAt(0).toUpperCase() }}
                  </div>
                </td>
                <td class="fw-semibold">{{ u.strNombreUsuario }}</td>
                <td class="text-muted small">{{ u.strNombrePerfil }}</td>
                <td class="small">{{ u.strCorreo }}</td>
                <td class="text-center">
                  <span class="badge" [class]="u.idEstadoUsuario ? 'bg-success' : 'bg-danger'">
                    {{ u.idEstadoUsuario ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="text-center" *ngIf="permisos().bitEditar || permisos().bitEliminar || permisos().bitDetalle">
                  <button *ngIf="permisos().bitDetalle"
                          class="btn btn-sm btn-outline-info me-1"
                          (click)="viewDetail(u)" title="Detalle">
                    <i class="bi bi-eye"></i>
                  </button>
                  <button *ngIf="permisos().bitEditar"
                          class="btn btn-sm btn-outline-warning me-1"
                          (click)="editUsuario(u)" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button *ngIf="permisos().bitEditar"
                          class="btn btn-sm btn-outline-secondary me-1"
                          (click)="openImageUpload(u)" title="Subir imagen">
                    <i class="bi bi-camera"></i>
                  </button>
                  <button *ngIf="permisos().bitEliminar"
                          class="btn btn-sm btn-outline-danger"
                          (click)="deleteUsuario(u)" title="Eliminar">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="card-footer d-flex align-items-center bg-white">
        <app-pagination
          [currentPage]="currentPage()"
          [pages]="totalPages()"
          [total]="total()"
          (pageChange)="loadPage($event)" />
      </div>
    </div>

    <!-- Modal detalle -->
    <div *ngIf="detailItem()" class="modal-backdrop-custom" (click)="detailItem.set(null)">
      <div class="card shadow-lg" style="width:400px;" (click)="$event.stopPropagation()">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-info-circle me-2 text-info"></i>Detalle Usuario</span>
          <button class="btn btn-sm btn-outline-secondary" (click)="detailItem.set(null)"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body text-center">
          <img *ngIf="detailItem()!.strImagen"
               [src]="usuarioService.getImageUrl(detailItem()!.strImagen)"
               class="rounded-circle mb-3" style="width:80px;height:80px;object-fit:cover;" alt="avatar" />
          <div *ngIf="!detailItem()!.strImagen"
               class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
               style="width:80px;height:80px;font-size:2rem;">
            {{ detailItem()!.strNombreUsuario.charAt(0).toUpperCase() }}
          </div>
          <dl class="row mb-0 text-start small">
            <dt class="col-5 text-muted">Usuario</dt><dd class="col-7">{{ detailItem()!.strNombreUsuario }}</dd>
            <dt class="col-5 text-muted">Perfil</dt><dd class="col-7">{{ detailItem()!.strNombrePerfil }}</dd>
            <dt class="col-5 text-muted">Correo</dt><dd class="col-7">{{ detailItem()!.strCorreo }}</dd>
            <dt class="col-5 text-muted">Celular</dt><dd class="col-7">{{ detailItem()!.strNumeroCelular || '—' }}</dd>
            <dt class="col-5 text-muted">Estado</dt>
            <dd class="col-7">
              <span class="badge" [class]="detailItem()!.idEstadoUsuario ? 'bg-success' : 'bg-danger'">
                {{ detailItem()!.idEstadoUsuario ? 'Activo' : 'Inactivo' }}
              </span>
            </dd>
          </dl>
        </div>
      </div>
    </div>

    <!-- Modal upload imagen -->
    <div *ngIf="uploadTarget()" class="modal-backdrop-custom">
      <div class="card shadow-lg" style="width:400px;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold"><i class="bi bi-camera me-2"></i>Subir Imagen</span>
          <button class="btn btn-sm btn-outline-secondary" (click)="uploadTarget.set(null)"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body text-center">
          <p class="small text-muted mb-3">
            Usuario: <strong>{{ uploadTarget()!.strNombreUsuario }}</strong>
          </p>

          <div *ngIf="previewUrl()" class="mb-3">
            <img [src]="previewUrl()!" class="rounded-circle"
                 style="width:100px;height:100px;object-fit:cover;" alt="preview" />
          </div>

          <input type="file" class="form-control form-control-sm mb-3"
                 accept="image/jpeg,image/png,image/gif,image/webp"
                 (change)="onFileSelected($event)" />

          <div *ngIf="uploadError()" class="alert alert-danger py-2 small">{{ uploadError() }}</div>

          <button class="btn btn-primary btn-sm w-100"
                  [disabled]="!selectedFile() || uploadingImg()"
                  (click)="uploadImage()">
            <span *ngIf="uploadingImg()" class="spinner-border spinner-border-sm me-1"></span>
            Subir imagen
          </button>
        </div>
      </div>
    </div>

    <!-- Modal formulario -->
    <div *ngIf="showForm()" class="modal-backdrop-custom">
      <div class="card shadow-lg" style="width:520px;max-height:90vh;overflow-y:auto;">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">
            <i class="bi bi-person me-2 text-primary"></i>
            {{ editingId() ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </span>
          <button class="btn btn-sm btn-outline-secondary" (click)="closeForm()"><i class="bi bi-x"></i></button>
        </div>
        <div class="card-body">
          <div *ngIf="formError()" class="alert alert-danger py-2 small">{{ formError() }}</div>
          <form [formGroup]="form" (ngSubmit)="saveForm()">
            <div class="row g-3">
              <div class="col-6">
                <label class="form-label fw-semibold">Usuario *</label>
                <input type="text" class="form-control" formControlName="strNombreUsuario"
                       [class.is-invalid]="isInvalid('strNombreUsuario')" />
                <div class="invalid-feedback">Requerido.</div>
              </div>
              <div class="col-6">
                <label class="form-label fw-semibold">Perfil *</label>
                <select class="form-select" formControlName="idPerfil"
                        [class.is-invalid]="isInvalid('idPerfil')">
                  <option value="">Seleccionar...</option>
                  <option *ngFor="let p of perfilesList()" [value]="p.id">{{ p.strNombrePerfil }}</option>
                </select>
                <div class="invalid-feedback">Requerido.</div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">
                  {{ editingId() ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *' }}
                </label>
                <input type="password" class="form-control" formControlName="strPwd"
                       [class.is-invalid]="isInvalid('strPwd')" />
                <div class="invalid-feedback">Mínimo 6 caracteres.</div>
              </div>
              <div class="col-8">
                <label class="form-label fw-semibold">Correo *</label>
                <input type="email" class="form-control" formControlName="strCorreo"
                       [class.is-invalid]="isInvalid('strCorreo')" />
                <div class="invalid-feedback">Correo inválido.</div>
              </div>
              <div class="col-4">
                <label class="form-label fw-semibold">Estado</label>
                <div class="form-check form-switch mt-2">
                  <input class="form-check-input" type="checkbox" id="estado"
                         formControlName="idEstadoUsuario" />
                  <label class="form-check-label small" for="estado">Activo</label>
                </div>
              </div>
              <div class="col-12">
                <label class="form-label fw-semibold">Número Celular</label>
                <input type="text" class="form-control" formControlName="strNumeroCelular"
                       placeholder="Opcional" />
              </div>
            </div>
            <div class="d-flex gap-2 justify-content-end mt-3">
              <button type="button" class="btn btn-secondary btn-sm" (click)="closeForm()">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-sm" [disabled]="saving()">
                <span *ngIf="saving()" class="spinner-border spinner-border-sm me-1"></span>
                {{ editingId() ? 'Actualizar' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`.modal-backdrop-custom{position:fixed;inset:0;background:rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;z-index:1050;}`]
})
export class UsuarioComponent implements OnInit {
  usuarios     = signal<Usuario[]>([]);
  perfilesList = signal<Perfil[]>([]);
  loading      = signal(true);
  currentPage  = signal(1);
  totalPages   = signal(1);
  total        = signal(0);
  showForm     = signal(false);
  editingId    = signal<number | null>(null);
  saving       = signal(false);
  formError    = signal('');
  detailItem   = signal<Usuario | null>(null);
  uploadTarget = signal<Usuario | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl   = signal<string | null>(null);
  uploadingImg = signal(false);
  uploadError  = signal('');
  permisos     = signal({ bitAgregar: false, bitEditar: false, bitEliminar: false,
                          bitConsulta: false, bitDetalle: false });
  form!: FormGroup;

  constructor(
  public usuarioService: UsuarioService,
  private perfilService: PerfilService,
  private authService: AuthService,
  private fb: FormBuilder
) {} 

  ngOnInit() {
    const p = this.authService.getPermisoForModulo('usuario');
    if (p) this.permisos.set(p as any);
    this.buildForm(false);
    this.loadPage(1);
    this.perfilService.getAll(1).subscribe(r => this.perfilesList.set(r.data));
  }

  buildForm(editMode: boolean) {
    this.form = this.fb.group({
      strNombreUsuario: ['', Validators.required],
      idPerfil:         ['', Validators.required],
      strPwd:           ['', editMode ? [] : [Validators.required, Validators.minLength(6)]],
      strCorreo:        ['', [Validators.required, Validators.email]],
      idEstadoUsuario:  [true],
      strNumeroCelular: ['']
    });
  }

  loadPage(page: number) {
    this.loading.set(true);
    this.usuarioService.getAll(page).subscribe({
      next: res => {
        this.usuarios.set(res.data);
        this.currentPage.set(res.page);
        this.totalPages.set(res.pages);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  openForm() {
    this.editingId.set(null);
    this.formError.set('');
    this.buildForm(false);
    this.showForm.set(true);
  }

  editUsuario(u: Usuario) {
    this.editingId.set(u.id!);
    this.formError.set('');
    this.buildForm(true);
    this.form.patchValue({ ...u, strPwd: '' });
    this.showForm.set(true);
  }

  viewDetail(u: Usuario) { this.detailItem.set(u); }

  closeForm() { this.showForm.set(false); }

  isInvalid(f: string) {
    const c = this.form.get(f);
    return !!(c?.invalid && c.touched);
  }

  saveForm() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.formError.set('');

    const val = this.form.value;
    if (!val.strPwd) delete val.strPwd;

    const req = this.editingId()
      ? this.usuarioService.update(this.editingId()!, val)
      : this.usuarioService.create(val);

    req.subscribe({
      next: () => { this.saving.set(false); this.closeForm(); this.loadPage(this.currentPage()); },
      error: err => { this.saving.set(false); this.formError.set(err.error?.message || 'Error al guardar'); }
    });
  }

  deleteUsuario(u: Usuario) {
    if (!confirm(`¿Eliminar al usuario "${u.strNombreUsuario}"?`)) return;
    this.usuarioService.delete(u.id!).subscribe({
      next: () => this.loadPage(this.currentPage()),
      error: err => alert(err.error?.message || 'Error al eliminar')
    });
  }

  openImageUpload(u: Usuario) {
    this.uploadTarget.set(u);
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.uploadError.set('');
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedFile.set(file);
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  uploadImage() {
    if (!this.selectedFile() || !this.uploadTarget()) return;
    this.uploadingImg.set(true);
    this.uploadError.set('');

    this.usuarioService.uploadImagen(this.uploadTarget()!.id!, this.selectedFile()!).subscribe({
      next: () => {
        this.uploadingImg.set(false);
        this.uploadTarget.set(null);
        this.loadPage(this.currentPage());
      },
      error: err => {
        this.uploadingImg.set(false);
        this.uploadError.set(err.error?.message || 'Error al subir imagen');
      }
    });
  }
}