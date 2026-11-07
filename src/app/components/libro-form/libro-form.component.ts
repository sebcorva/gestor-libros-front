import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Libro } from '../../models/libro';
import { LibroService } from '../../services/libro.service';
import { mensajeError } from '../../utils/mensaje-error';

type Campo = 'titulo' | 'autor' | 'anioPublicacion' | 'genero';

function noVacio(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  return typeof valor === 'string' && valor.trim() === '' ? { required: true } : null;
}

@Component({
  selector: 'app-libro-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './libro-form.component.html',
  styleUrl: './libro-form.component.css',
})
export class LibroFormComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly libroService = inject(LibroService);

  protected readonly form = this.fb.group({
    titulo: ['', [Validators.required, noVacio, Validators.maxLength(150)]],
    autor: ['', [Validators.required, noVacio, Validators.maxLength(100)]],
    anioPublicacion: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.pattern(/^\d+$/),
    ]),
    genero: ['', [Validators.required, noVacio, Validators.maxLength(100)]],
  });

  // null = crear; número = editar ese id.
  protected readonly idEdicion = signal<number | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Partial<Record<Campo, string>>>({});

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param === null) {
      return;
    }

    const id = Number(param);
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('El ID indicado no es válido.');
      this.form.disable();
      return;
    }

    this.idEdicion.set(id);
    this.cargando.set(true);

    // Patrón Observer: nos suscribimos y precargamos el formulario cuando llega el libro.
    this.libroService.getById(id).subscribe({
      next: (libro) => {
        this.form.patchValue(libro);
        this.cargando.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(
          err.status === 404
            ? `No existe un libro con ID ${id}.`
            : mensajeError(err, 'No se pudo cargar el libro.'),
        );
        this.form.disable();
        this.cargando.set(false);
      },
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const libro: Libro = {
      titulo: valores.titulo.trim(),
      autor: valores.autor.trim(),
      anioPublicacion: Number(valores.anioPublicacion),
      genero: valores.genero.trim(),
    };

    const id = this.idEdicion();
    const peticion =
      id === null ? this.libroService.create(libro) : this.libroService.update(id, libro);

    this.guardando.set(true);
    this.error.set(null);
    this.erroresServidor.set({});

    // Patrón Observer: la petición (POST o PUT) sale recién al suscribirnos.
    peticion.subscribe({
      next: (guardado) => {
        this.guardando.set(false);
        this.router.navigate(['/libros', guardado.id]);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        if (err.status === 400 && err.error?.errors) {
          this.erroresServidor.set(err.error.errors);
          this.error.set('Revisa los campos marcados.');
        } else if (err.status === 400) {
          this.error.set(err.error?.message ?? 'Datos inválidos.');
        } else if (err.status === 404) {
          this.error.set('El libro ya no existe.');
        } else {
          this.error.set(mensajeError(err, 'No se pudo guardar el libro.'));
        }
      },
    });
  }

  protected errorDe(campo: Campo): string | null {
    const control = this.form.controls[campo];
    if (control.touched && control.errors) {
      const e = control.errors;
      if (e['required']) return 'Este campo es obligatorio.';
      if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
      if (e['min'] || e['pattern']) return 'Debe ser un número entero positivo.';
    }
    return this.erroresServidor()[campo] ?? null;
  }
}
