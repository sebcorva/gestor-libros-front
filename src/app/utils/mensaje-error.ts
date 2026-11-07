import { HttpErrorResponse } from '@angular/common/http';

export function mensajeError(err: HttpErrorResponse, porDefecto: string): string {
  if (err.status === 0) {
    return 'No se pudo conectar con el servidor. ¿Está corriendo gestor-libros-ms?';
  }
  if (err.status >= 500) {
    return 'Error interno del servidor. Intenta más tarde.';
  }
  return porDefecto;
}
