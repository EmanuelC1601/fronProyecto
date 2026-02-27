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
  paginacion = { page: 1, limit: 5, total: 0, pages: 0 }; // Cambiado a 5

  formData: Mensaje = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  editando = false;
  idEditando: number | null = null;
  mostrarFormulario = false;

  // Filtros
  searchTerm: string = '';
  edadMin?: number;
  edadMax?: number;

  private searchSubject = new Subject<string>();

  constructor(private mensajeService: MensajeService) {}

  ngOnInit(): void {
    this.cargarMensajes();

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

  abrirFormularioNuevo(): void {
    this.mostrarFormulario = true;
    this.editando = false;
    this.idEditando = null;
    this.formData = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  }

  cancelar(): void {
    this.mostrarFormulario = false;
    this.editando = false;
    this.idEditando = null;
    this.formData = { nombre_completo: '', email: '', edad: 18, mensaje: '' };
  }

  guardarMensaje(): void {
    if (this.editando && this.idEditando) {
      this.mensajeService.updateMensaje(this.idEditando, this.formData).subscribe({
        next: () => {
          this.cancelar();
          this.paginacion.page = 1;
          this.cargarMensajes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar: ' + (err.error?.errors?.join(', ') || 'Error desconocido'));
        }
      });
    } else {
      this.mensajeService.createMensaje(this.formData).subscribe({
        next: () => {
          this.cancelar();
          this.paginacion.page = 1;
          this.cargarMensajes();
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear: ' + (err.error?.errors?.join(', ') || 'Error desconocido'));
        }
      });
    }
  }

  editarMensaje(mensaje: Mensaje): void {
    this.mostrarFormulario = true;
    this.editando = true;
    this.idEditando = mensaje.id!;
    this.formData = { ...mensaje };
  }

  eliminarMensaje(id: number): void {
    if (confirm('¿Eliminar este mensaje?')) {
      this.mensajeService.deleteMensaje(id).subscribe(() => {
        this.cargarMensajes();
      });
    }
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.paginacion.pages) {
      this.paginacion.page = page;
      this.cargarMensajes();
    }
  }

  // Getter para mostrar un rango de hasta 5 páginas alrededor de la actual
  get paginasAMostrar(): number[] {
    const total = this.paginacion.pages;
    const actual = this.paginacion.page;
    const maxPaginas = 5;
    let inicio = Math.max(1, actual - Math.floor(maxPaginas / 2));
    let fin = Math.min(total, inicio + maxPaginas - 1);
    if (fin - inicio + 1 < maxPaginas) {
      inicio = Math.max(1, fin - maxPaginas + 1);
    }
    const paginas: number[] = [];
    for (let i = inicio; i <= fin; i++) {
      paginas.push(i);
    }
    return paginas;
  }
}