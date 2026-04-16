import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment.prod';
import { Usuario, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private apiUrl     = `${environment.apiUrl}/usuario`;
  private uploadUrl  = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  getAll(page = 1) {
    return this.http.get<PaginatedResponse<Usuario>>(`${this.apiUrl}?page=${page}`).pipe(
      map(response => ({
        ...response,
        data: response.data.map(user => ({
          ...user,
          idEstadoUsuario: !!user.idEstadoUsuario
        }))
      }))
    );
  }

  getById(id: number) {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`).pipe(
      map(user => ({
        ...user,
        idEstadoUsuario: !!user.idEstadoUsuario
      }))
    );
  }

  create(data: Usuario) {
    const payload = {
      strNombreUsuario: data.strNombreUsuario,
      idPerfil: data.idPerfil,
      strCorreo: data.strCorreo,
      strPwd: data.strPwd,
      idEstadoUsuario: data.idEstadoUsuario ? 1 : 0,
      strNumeroCelular: data.strNumeroCelular || ''
    };
    return this.http.post<{ id: number; message: string }>(this.apiUrl, payload);
  }

  update(id: number, data: Partial<Usuario>) {
    // Construir payload solo con los campos que vienen
    const payload: any = {};
    
    if (data.strNombreUsuario !== undefined) payload.strNombreUsuario = data.strNombreUsuario;
    if (data.idPerfil !== undefined) payload.idPerfil = data.idPerfil;
    if (data.strCorreo !== undefined) payload.strCorreo = data.strCorreo;
    if (data.strNumeroCelular !== undefined) payload.strNumeroCelular = data.strNumeroCelular;
    if (data.idEstadoUsuario !== undefined) payload.idEstadoUsuario = data.idEstadoUsuario ? 1 : 0;
    if (data.strPwd !== undefined && data.strPwd !== '') payload.strPwd = data.strPwd;
    
    console.log('Update payload:', payload);
    
    return this.http.put<{ message: string }>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  uploadImagen(id: number, file: File) {
    const formData = new FormData();
    formData.append('imagen', file);
    return this.http.post<{ message: string; strImagen: string }>(
      `${this.uploadUrl}/usuario/${id}`, formData
    );
  }

  getImageUrl(path: string | null | undefined): string {
    if (!path) return 'assets/avatar-default.png';
    if (path.startsWith('http')) return path;
    return `${environment.apiUrl.replace('/api', '')}${path}`;
  }
}