import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../environments/environment';
import { LibroFormComponent } from './libro-form.component';

const libro = {
  id: 1,
  titulo: 'Rayuela',
  autor: 'Julio Cortázar',
  anioPublicacion: 1963,
  genero: 'Novela',
};

describe('LibroFormComponent', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'libros/nuevo', component: LibroFormComponent },
          { path: 'libros/:id/editar', component: LibroFormComponent },
          { path: '**', children: [] },
        ]),
      ],
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  function llenar(el: HTMLElement, valores: Record<string, string>) {
    for (const [id, valor] of Object.entries(valores)) {
      const input = el.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    }
  }

  it('no envía nada si el formulario es inválido', async () => {
    const comp = await harness.navigateByUrl('/libros/nuevo', LibroFormComponent);
    const el = harness.routeNativeElement!;
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await harness.fixture.whenStable();
    http.expectNone(environment.apiUrl);
    expect(comp).toBeTruthy();
    expect(el.textContent).toContain('Este campo es obligatorio.');
  });

  it('crea con POST y navega al detalle', async () => {
    await harness.navigateByUrl('/libros/nuevo', LibroFormComponent);
    const el = harness.routeNativeElement!;
    llenar(el, { titulo: 'Rayuela', autor: 'Julio Cortázar', anioPublicacion: '1963', genero: 'Novela' });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    const req = http.expectOne(environment.apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ titulo: 'Rayuela', autor: 'Julio Cortázar', anioPublicacion: 1963, genero: 'Novela' });
    req.flush(libro, { status: 201, statusText: 'Created' });
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/libros/1');
  });

  it('muestra los errores 400 del backend por campo', async () => {
    await harness.navigateByUrl('/libros/nuevo', LibroFormComponent);
    const el = harness.routeNativeElement!;
    llenar(el, { titulo: 'X', autor: 'Y', anioPublicacion: '2000', genero: 'Z' });
    el.querySelector('form')!.dispatchEvent(new Event('submit'));

    http.expectOne(environment.apiUrl).flush(
      { status: 400, errors: { titulo: 'El titulo ya existe' } },
      { status: 400, statusText: 'Bad Request' },
    );
    await harness.fixture.whenStable();
    expect(el.textContent).toContain('El titulo ya existe');
  });

  it('en edición precarga con GET y envía PUT', async () => {
    await harness.navigateByUrl('/libros/1/editar', LibroFormComponent);
    http.expectOne(`${environment.apiUrl}/1`).flush(libro);
    await harness.fixture.whenStable();
    const el = harness.routeNativeElement!;
    expect(el.querySelector<HTMLInputElement>('#titulo')!.value).toBe('Rayuela');

    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    const req = http.expectOne(`${environment.apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(libro);
  });
});
