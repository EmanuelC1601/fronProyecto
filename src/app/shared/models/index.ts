export interface Perfil {
  id?: number;
  strNombrePerfil: string;
  bitAdministrador: boolean;
}

export interface Modulo {
  id?: number;
  strNombreModulo: string;
}

export interface PermisosPerfil {
  id?: number;
  idModulo: number;
  idPerfil: number;
  strNombreModulo?: string;
  strNombrePerfil?: string;
  bitAgregar: boolean;
  bitEditar: boolean;
  bitConsulta: boolean;
  bitEliminar: boolean;
  bitDetalle: boolean;
}

export interface Usuario {
  id?: number;
  strNombreUsuario: string;
  idPerfil: number;
  strNombrePerfil?: string;
  strPwd?: string;
  idEstadoUsuario: boolean;
  strCorreo: string;
  strNumeroCelular?: string;
  strImagen?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface MenuPermiso {
  idModulo: number;
  strNombreModulo: string;
  bitAgregar: boolean;
  bitEditar: boolean;
  bitConsulta: boolean;
  bitEliminar: boolean;
  bitDetalle: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    nombre: string;
    idPerfil: number;
    strImagen: string | null;
  };
}