import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { environment } from '../../../environments/environment';
import { LibroDetailComponent } from './libro-detail.component';

describe('LibroDetailComponent', () => {
  let harness: RouterTestingHarness;
  let http: HttpTestingController;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'libros/:id', component: LibroDetailComponent }]),
      ],
    });
    harness = await RouterTestingHarness.create();
    http = TestBed.inject(HttpTestingController);
  });

  it('muestra el libro cuando el backend responde 200', async () => {
    await harness.navigateByUrl('/libros/1', LibroDetailComponent);
    http.expectOne(`${environment.apiUrl}/1`).flush({
      id: 1,
      titulo: 'Rayuela',
      autor: 'Julio Cortázar',
      anioPublicacion: 1963,
      genero: 'Novela',
    });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('Julio Cortázar');
  });

  it('muestra un mensaje claro cuando el backend responde 404', async () => {
    await harness.navigateByUrl('/libros/99', LibroDetailComponent);
    http
      .expectOne(`${environment.apiUrl}/99`)
      .flush(null, { status: 404, statusText: 'Not Found' });
    await harness.fixture.whenStable();
    expect(harness.routeNativeElement?.textContent).toContain('No existe un libro con ID 99');
  });
});
