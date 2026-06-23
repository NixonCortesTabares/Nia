import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Interceptor para agregar JWT automáticamente
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Helper para obtener mensaje de error
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      mensaje?: string;
      message?: string;
    }>;

    return (
      axiosError.response?.data?.mensaje ||
      axiosError.response?.data?.message ||
      axiosError.message ||
      'Error en la solicitud'
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Error desconocido';
}