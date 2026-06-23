import { apiClient } from './apiClient';

export interface UsuarioSesion {
  id: string;
  negocioId: string;
  nombre: string;
  email: string;
  rol: 'dueno' | 'staff';
}

export interface LoginResponse {
  ok: boolean;
  data: {
    token: string;
    usuario: UsuarioSesion;
  };
}

export async function login(email: string, password: string) {
  const response = await apiClient.post<LoginResponse>('/auth/login', {
    email,
    password,
  });

  return response.data;
}

export function guardarSesion(data: LoginResponse['data']) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('usuario', JSON.stringify(data.usuario));
}

export function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
}

export function obtenerUsuarioActual(): UsuarioSesion | null {
  const usuario = localStorage.getItem('usuario');

  if (!usuario) return null;

  try {
    return JSON.parse(usuario) as UsuarioSesion;
  } catch {
    return null;
  }
}