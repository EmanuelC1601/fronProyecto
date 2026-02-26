import { Component, OnInit } from '@angular/core';
import { MensajeService, Mensaje, PaginatedResponse } from '../../services/mensaje.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-mensajes',
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.css']
})
export class MensajesComponent implements OnInit {
  mensajes: Mensaje[] = [];
  paginacion = { page: 1, limit: 10, total: 0, pages: 0 };

  formData: Mensaje = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  editando = false;
  idEditando: number | null = null;

  // Filtros
  searchTerm: string = '';
  edadMin?: number;
  edadMax?: number;

  private searchSubject = new Subject<string>();

  constructor(private mensajeService: MensajeService) {}

  ngOnInit(): void {
    this.cargarMensajes();

    // Debounce para búsqueda en vivo
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm = term;
      this.paginacion.page = 1;
      this.cargarMensajes();
    });
  }

  cargarMensajes(): void {
    this.mensajeService.getMensajes(
      this.paginacion.page,
      this.paginacion.limit,
      this.searchTerm,
      this.edadMin,
      this.edadMax
    ).subscribe((res: PaginatedResponse) => {
      this.mensajes = res.data;
      this.paginacion = res.pagination;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }

  onAgeFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const value = select.value;
    if (value) {
      const [min, max] = value.split('-').map(Number);
      this.edadMin = min;
      this.edadMax = max;
    } else {
      this.edadMin = undefined;
      this.edadMax = undefined;
    }
    this.paginacion.page = 1;
    this.cargarMensajes();
  }

  guardarMensaje(): void {
    if (this.editando && this.idEditando) {
      this.mensajeService.updateMensaje(this.idEditando, this.formData).subscribe({
        next: () => {
          this.cancelarEdicion();
          this.cargarMensajes();
        },
        error: (err) => alert('Error al actualizar: ' + err.error?.errors?.join(', '))
      });
    } else {
      this.mensajeService.createMensaje(this.formData).subscribe({
        next: () => {
          this.formData = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
          this.cargarMensajes();
        },
        error: (err) => alert('Error al crear: ' + err.error?.errors?.join(', '))
      });
    }
  }

  editarMensaje(mensaje: Mensaje): void {
    this.editando = true;
    this.idEditando = mensaje.id!;
    this.formData = { ...mensaje };
  }

  cancelarEdicion(): void {
    this.editando = false;
    this.idEditando = null;
    this.formData = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  }

  eliminarMensaje(id: number): void {
    if (confirm('¿Eliminar este mensaje?')) {
      this.mensajeService.deleteMensaje(id).subscribe(() => {
        this.cargarMensajes();
      });
    }
  }

  cambiarPagina(page: number): void {
    this.paginacion.page = page;
    this.cargarMensajes();
  }
}