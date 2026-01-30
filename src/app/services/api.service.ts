import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Interfaces para tipado
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface Registro {
  id: number;
  usuario: string;
  password: string;
  serie: number;
  fechaRegistro: string;
}

export interface Usuario {
  id: number;
  usuario: string;
  fechaNacimiento: string;
  fechaRegistro: string;
}

export interface Imagen {
  id: number;
  nombreOriginal: string;
  nombreArchivo: string;
  ruta: string;
  tipo: string;
  tamaño: number;
  fechaSubida: string;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // ✅ URL CORRECTA: Tu backend en Render
  private baseUrl = 'https://backend-bhit.onrender.com';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };
  
  constructor(private http: HttpClient) { }

  // ========== REGISTROS ==========

  // Insertar datos automáticos
  insertData(data: { usuario: string; password: string; serie: number }): Observable<ApiResponse<Registro>> {
    return this.http.post<ApiResponse<Registro>>(
      `${this.baseUrl}/registros/insertar-automatico`, 
      data, 
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // Registrar usuario
  // En tu ApiService, agrega o verifica este método:
  registerUser(userData: { usuario: string; fechaNacimiento: string; password: string; confirmPassword: string }): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(
    `${this.baseUrl}/registros/registrar-usuario`, 
    userData,
    this.httpOptions
  ).pipe(catchError(this.handleError));
}

  // Obtener todos los registros
  getRegistros(): Observable<ApiResponse<Registro[]>> {
    return this.http.get<ApiResponse<Registro[]>>(
      `${this.baseUrl}/registros/obtener-registros`,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // ========== IMÁGENES ==========

  // Subir imagen (usa FormData, diferente Content-Type)
  uploadImage(file: File): Observable<ApiResponse<Imagen>> {
    const formData = new FormData();
    formData.append('imagen', file, file.name);
    
    // Para FormData, Angular establece automáticamente 'multipart/form-data'
    const uploadOptions = {
      headers: new HttpHeaders({
        'Accept': 'application/json'
        // NO establecer 'Content-Type' manualmente
      })
    };
    
    return this.http.post<ApiResponse<Imagen>>(
      `${this.baseUrl}/imagenes/subir`, 
      formData, 
      uploadOptions
    ).pipe(catchError(this.handleError));
  }

  // Obtener todas las imágenes
  getImages(): Observable<ApiResponse<Imagen[]>> {
    return this.http.get<ApiResponse<Imagen[]>>(
      `${this.baseUrl}/imagenes/obtener-todas`,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // Eliminar imagen
  deleteImage(id: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(
      `${this.baseUrl}/imagenes/eliminar/${id}`,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // ========== UTILIDADES ==========

  // Verificar salud del servidor
  checkHealth(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.baseUrl}/health`,
      this.httpOptions
    ).pipe(catchError(this.handleError));
  }

  // Método simple para ver la raíz (sin /api)
  getRootInfo(): Observable<any> {
    return this.http.get('https://backend-bhit.onrender.com', {
      headers: new HttpHeaders({ 'Accept': 'application/json' })
    }).pipe(catchError(this.handleError));
  }

  // Manejo de errores mejorado
  private handleError(error: HttpErrorResponse) {
    console.error('❌ Error completo:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
      headers: error.headers
    });
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else {
      // Error del servidor
      switch (error.status) {
        case 0:
          errorMessage = 'No se puede conectar al servidor. Verifica tu conexión o que el backend esté ejecutándose.';
          break;
        case 400:
          errorMessage = error.error?.message || 'Solicitud incorrecta (400)';
          break;
        case 401:
          errorMessage = 'No autorizado (401)';
          break;
        case 403:
          errorMessage = 'Acceso prohibido (403)';
          break;
        case 404:
          errorMessage = `Recurso no encontrado (404): ${error.url}`;
          break;
        case 409:
          errorMessage = 'Conflicto: El recurso ya existe (409)';
          break;
        case 500:
          errorMessage = 'Error interno del servidor (500)';
          break;
        case 502:
        case 503:
        case 504:
          errorMessage = `Error de conexión con el backend (${error.status}). El servidor puede estar iniciándose.`;
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.message}`;
      }
    }
    
    console.error('Error en API Service:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
