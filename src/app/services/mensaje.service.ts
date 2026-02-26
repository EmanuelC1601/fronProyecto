import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Mensaje {
  id?: number;
  nombre_completo: string;
  email: string;
  edad: number;
  mensaje: string;
  created_at?: string;
}

export interface PaginatedResponse {
  data: Mensaje[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = 'https://backend-bhit.onrender.com/api/mensajes'; // Ajusta según tu backend

  constructor(private http: HttpClient) {}

  getMensajes(page: number = 1, limit: number = 10, search: string = '', edadMin?: number, edadMax?: number): Observable<PaginatedResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (edadMin !== undefined) params = params.set('edadMin', edadMin.toString());
    if (edadMax !== undefined) params = params.set('edadMax', edadMax.toString());

    return this.http.get<PaginatedResponse>(this.apiUrl, { params });
  }

  getMensaje(id: number): Observable<Mensaje> {
    return this.http.get<Mensaje>(`${this.apiUrl}/${id}`);
  }

  createMensaje(mensaje: Mensaje): Observable<any> {
    return this.http.post(this.apiUrl, mensaje);
  }

  updateMensaje(id: number, mensaje: Mensaje): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, mensaje);
  }

  deleteMensaje(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}