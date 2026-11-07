import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';

import { Libro } from '../../models/libro';
import { LibroService } from '../../services/libro.service';

// Vista: muestra el listado y captura las acciones del usuario.
// Sin providers: usa la única instancia (Singleton) de LibroService.
@Component({
  selector: 'app-libro-list',
  imports: [RouterLink],
  templateUrl: './libro-list.component.html',
  styleUrl: './libro-list.component.css',
})
export class LibroListComponent implements OnInit {
  private readonly libroService = inject(LibroService);

  // signal: Angular es zoneless, sin signal la vista no se refresca al llegar los datos.
  protected readonly libros = signal<Libro[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarLibros();
  }

  cargarLibros(): void {
    this.cargando.set(true);

    this.libroService.getAll().subscribe({
      next: (libros) => {
        this.libros.set(libros);
        this.error.set(null);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err, 'No se pudo cargar el listado.'));
        this.cargando.set(false);
      },
    });
  }

  eliminar(libro: Libro): void {
    if (!libro.id || !confirm(`¿Eliminar "${libro.titulo}"?`)) {
      return;
    }
    // Patrón Observer: al confirmar el DELETE (204), refrescamos el listado.
    this.libroService.delete(libro.id).subscribe({
      next: () => this.cargarLibros(),
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.libros.update((lista) => lista.filter((l) => l.id !== libro.id));
          this.error.set('El libro ya no existe.');
          return;
        }
        this.error.set(this.mensajeError(err, 'No se pudo eliminar el libro.'));
      },
    });
  }

  private mensajeError(err: HttpErrorResponse, porDefecto: string): string {
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo gestor-libros-ms?';
    }
    if (err.status >= 500) {
      return 'Error interno del servidor. Intenta más tarde.';
    }
    return porDefecto;
  }
}
