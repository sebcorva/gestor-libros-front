import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Libro } from '../../models/libro';
import { LibroService } from '../../services/libro.service';

// Vista: muestra el detalle de un libro según el :id de la URL.
@Component({
  selector: 'app-libro-detail',
  imports: [RouterLink],
  templateUrl: './libro-detail.component.html',
  styleUrl: './libro-detail.component.css',
})
export class LibroDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly libroService = inject(LibroService);

  protected readonly libro = signal<Libro | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    // El id viene de la ruta (/libros/:id), así sobrevive a un F5 o a una URL directa.
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('El ID indicado no es válido.');
      this.cargando.set(false);
      return;
    }

    // Patrón Observer: nos suscribimos y reaccionamos cuando llega la respuesta.
    this.libroService.getById(id).subscribe({
      next: (libro) => {
        this.libro.set(libro);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(this.mensajeError(err, id));
        this.cargando.set(false);
      },
    });
  }

  private mensajeError(err: HttpErrorResponse, id: number): string {
    if (err.status === 404) {
      return `No existe un libro con ID ${id}.`;
    }
    if (err.status === 0) {
      return 'No se pudo conectar con el servidor. ¿Está corriendo gestor-libros-ms?';
    }
    if (err.status >= 500) {
      return 'Error interno del servidor. Intenta más tarde.';
    }
    return 'No se pudo cargar el libro.';
  }
}
