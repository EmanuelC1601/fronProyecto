import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ApiService, ApiResponse, Imagen } from '../../services/api.service';

interface CarouselImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-upload-and-carousel',
  templateUrl: './upload-and-carousel.component.html',
  styleUrls: ['./upload-and-carousel.component.css']
})
export class UploadAndCarouselComponent implements OnInit, AfterViewInit {
  selectedFile: File | null = null;
  imagePreview: string = '';
  uploadProgress = 0;
  isUploading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';
  
  // Referencia al input de archivo
  fileInput: HTMLInputElement | null = null;
  
  // Imágenes del carrusel
  carouselImages: CarouselImage[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  // Inicializar después de que la vista se haya cargado
  ngAfterViewInit() {
    this.fileInput = document.getElementById('fileInput') as HTMLInputElement;
  }

  // Cargar imágenes desde el backend
  loadImages(): void {
    this.apiService.getImages().subscribe({
      next: (response: ApiResponse<Imagen[]>) => {
        if (response.success && response.data) {
          this.carouselImages = response.data.map((img: Imagen) => ({
            id: img.id,
            url: img.url || img.ruta,
            title: img.nombreOriginal,
            description: `Subida el ${new Date(img.fechaSubida).toLocaleDateString()}`
          }));
        } else {
          // Si no hay imágenes o falla la respuesta, cargar imágenes por defecto
          this.loadDefaultImages();
        }
      },
      error: (error: Error) => {
        console.error('Error cargando imágenes:', error);
        // Cargar imágenes de ejemplo si falla la conexión
        this.loadDefaultImages();
      }
    });
  }

  // Cargar imágenes por defecto
  private loadDefaultImages(): void {
    this.carouselImages = [
      {
        id: 1,
        url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&h=400&fit=crop',
        title: 'Montaña 1',
        description: 'Imagen de montaña de ejemplo'
      },
      {
        id: 2,
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
        title: 'Montaña 2',
        description: 'Otra imagen de montaña'
      },
      {
        id: 3,
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
        title: 'Montaña 3',
        description: 'Tercera imagen de ejemplo'
      }
    ];
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      // Validar que sea una imagen
      if (!file.type.match('image.*')) {
        this.showError = true;
        this.errorMessage = 'Por favor, selecciona solo archivos de imagen';
        setTimeout(() => this.showError = false, 5000);
        return;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showError = true;
        this.errorMessage = 'La imagen no debe superar los 5MB';
        setTimeout(() => this.showError = false, 5000);
        return;
      }

      this.selectedFile = file;

      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Método para abrir el selector de archivos
  openFileSelector(): void {
    if (this.fileInput) {
      this.fileInput.click();
    } else {
      // Si no se encontró por ID, buscarlo
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
      }
    }
  }

  // Método para navegar a una slide específica
  goToSlide(index: number): void {
    const carouselElement = document.getElementById('imageCarousel');
    if (carouselElement) {
      // Usar la API de Bootstrap Carousel
      const bootstrap = (window as any).bootstrap;
      if (bootstrap && bootstrap.Carousel) {
        const carousel = new bootstrap.Carousel(carouselElement);
        carousel.to(index);
      }
    }
  }

  // Subir imagen al backend
  uploadImage(): void {
    if (!this.selectedFile) {
      this.showError = true;
      this.errorMessage = 'Por favor, selecciona una imagen primero';
      setTimeout(() => this.showError = false, 5000);
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;
    this.showSuccess = false;
    this.showError = false;

    // Simular progreso (opcional, para mejor UX)
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 200);

    // Llamar al servicio real
    this.apiService.uploadImage(this.selectedFile).subscribe({
      next: (response: ApiResponse<Imagen>) => {
        clearInterval(progressInterval);
        this.uploadProgress = 100;
        
        setTimeout(() => {
          this.isUploading = false;
          this.showSuccess = true;

          // Agregar imagen al carrusel
          if (response.success && response.data) {
            const newImage: CarouselImage = {
              id: response.data.id,
              url: response.data.ruta || response.data.url,
              title: response.data.nombreOriginal,
              description: 'Subida el ' + new Date().toLocaleDateString()
            };
            
            // Agregar al inicio del array
            this.carouselImages.unshift(newImage);
          }

          // Resetear formulario
          this.selectedFile = null;
          this.imagePreview = '';
          this.uploadProgress = 0;

          // Resetear input file
          if (this.fileInput) {
            this.fileInput.value = '';
          }

          // Ocultar mensaje después de 5 segundos
          setTimeout(() => {
            this.showSuccess = false;
          }, 5000);
        }, 500);
      },
      error: (error: Error) => {
        clearInterval(progressInterval);
        this.isUploading = false;
        this.showError = true;
        this.errorMessage = error.message || 'Error al subir la imagen';
        
        // Ocultar error después de 5 segundos
        setTimeout(() => {
          this.showError = false;
        }, 5000);
      }
    });
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.imagePreview = '';
    
    // Resetear input file
    if (this.fileInput) {
      this.fileInput.value = '';
    }
  }

  // Eliminar imagen del carrusel
  deleteImage(imageId: number, event?: Event): void {
    if (event) {
      event.stopPropagation(); // Evitar que se active el slide
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      this.apiService.deleteImage(imageId).subscribe({
        next: (response: ApiResponse) => {
          if (response.success) {
            // Remover imagen del array local
            this.carouselImages = this.carouselImages.filter(img => img.id !== imageId);
            
            // Mostrar mensaje de éxito
            const successAlert = document.createElement('div');
            successAlert.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
            successAlert.innerHTML = `
              <i class="bi bi-check-circle-fill me-2"></i>
              <strong>¡Éxito!</strong> Imagen eliminada correctamente.
              <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            `;
            document.body.appendChild(successAlert);
            
            // Auto-eliminar después de 3 segundos
            setTimeout(() => {
              successAlert.remove();
            }, 3000);
          }
        },
        error: (error: Error) => {
          this.showError = true;
          this.errorMessage = 'Error al eliminar la imagen: ' + error.message;
          setTimeout(() => this.showError = false, 5000);
        }
      });
    }
  }

  // Método auxiliar para obtener nombre de archivo
  getFileName(): string {
    return this.selectedFile ? this.selectedFile.name : '';
  }
}