# PRD — Gestor de Libros Front (S3 "Aplicando un patrón de diseño a nuestro desarrollo")


## 1. Contexto y objetivo

Construir una aplicación web en **Angular** que gestione los libros de una biblioteca y que consuma el **microservicio de la semana 1** (`gestor-libros-ms`, CRUD de `/libros` sobre Oracle). El frontend debe construirse siguiendo un **patrón de diseño** y su **arquetipo**.

El contrato de la API, los errores y CORS están definidos en `gestor-libros-ms/docs/PRD.md`. Este documento cubre **solo el frontend**.

## 2. Alcance

| Repo | Carpeta | Contenido |
|---|---|---|
| Frontend | `PROGRAMACION/gestor-libros-front` | Angular CLI 22 (standalone, zoneless, **sin SSR**), consume `gestor-libros-ms` |

**Depende de:** `gestor-libros-ms` corriendo en `http://localhost:8080` con CORS habilitado para `http://localhost:4200` (issue #4 del backend).

**Fuera de alcance:** autenticación, despliegue y Docker.

## 3. Modelo

`models/libro.ts` replica los campos del backend con los **mismos nombres** que el JSON:

| Campo | Tipo TS | Nota |
|---|---|---|
| `id` | `number` | opcional al crear (lo genera la BD) |
| `titulo` | `string` | obligatorio |
| `autor` | `string` | obligatorio |
| `anioPublicacion` | `number` | obligatorio, positivo |
| `genero` | `string` | obligatorio |

## 4. Endpoints que consume

Base URL en `environment.ts`: `http://localhost:8080/libros`.

| Método | Ruta | Uso en el front | Respuestas a manejar |
|---|---|---|---|
| GET | `/libros` | Listado | `200` |
| GET | `/libros/{id}` | Detalle / cargar el formulario de edición | `200`, `404` |
| POST | `/libros` | Crear | `201`, `400` (`errors` por campo) |
| PUT | `/libros/{id}` | Editar | `200`, `404`, `400` |
| DELETE | `/libros/{id}` | Eliminar | `204`, `404` |

Además: status `0` (backend caído o bloqueado por CORS) y `500`.

## 5. Patrón de diseño y arquetipo

- **Arquetipo:** el proyecto se genera con **Angular CLI**: `ng new gestor-libros-front --ssr=false`, y los artefactos con `ng generate component|service`. Eso da la estructura estándar (`src/app`, `app.config.ts`, `app.routes.ts`, `environments`).
- **Patrón principal: MVC**, con el mismo mapeo que el ejemplo del profesor:
  - **Modelo:** `services/libro.service.ts`, la capa que obtiene y persiste los datos consumiendo la API con `HttpClient`. Se apoya en `models/libro.ts`, que define la forma del dato.
  - **Vista:** `components/*` (template `.html` + clase `.ts`), que muestran los datos y capturan las acciones del usuario.
  - **Controlador:** `app.routes.ts`, que decide qué vista se muestra según la URL.
- **Patrón Observer:** los métodos del servicio devuelven `Observable<T>` (RxJS). Los componentes se **suscriben** con `.subscribe({ next, error })` y reaccionan cuando llega la respuesta. Marcarlo con un comentario en el código, como hace el profesor.
- **Complemento: Singleton por inyección de dependencias.** `@Injectable({ providedIn: 'root' })` crea una única instancia del servicio para toda la app.

**Justificación (para el README):** separa responsabilidades. Si cambia la URL o el backend, solo cambian `environment.ts` y el servicio, sin tocar los componentes. Además cada capa se puede probar por separado.

### Qué se toma de ejemplo profesor

| Se toma tal cual | Se hace distinto (y por qué) |
|---|---|
| `provideHttpClient(withFetch())` en `app.config.ts` | **Sin `providers: [LibroService]` en los componentes:** eso crea una instancia por componente y rompe el Singleton |
| `signal(...)` para guardar los datos que llegan de la API (Angular es *zoneless*: sin signal la vista no se refresca) | **El id va en la ruta** (`/libros/:id`), no en `router state`: así sobrevive a un F5 o a una URL directa, y lo necesita la edición |
| Bloques `@for` / `@if` / `@empty` | **`apiUrl` en `environment.ts`**, no fijo dentro del servicio |
| Carpetas `models/`, `services/`, `components/` | **Sin SSR** (`--ssr=false`): el ejemplo lo activa y después fuerza todo a renderizar en el cliente |
| | **`error` en cada `subscribe`**: el ejemplo no maneja errores |
| | **POST, PUT y DELETE en la UI**: el ejemplo solo lista y muestra el detalle; el enunciado pide los 5 |

Estructura objetivo:

```
src/app/
├── models/libro.ts
├── services/libro.service.ts      # Modelo (MVC) + Observables
├── components/
│   ├── libro-list/                # Vista: tabla + eliminar
│   ├── libro-detail/              # Vista: detalle por ID
│   └── libro-form/                # Vista: crear y editar (mismo componente)
├── app.routes.ts                  # Controlador (MVC)
└── app.config.ts                  # provideHttpClient(withFetch())
src/environments/environment.ts    # apiUrl
```

Rutas: `''` → redirige a `libros`, `libros` (listado), `libros/nuevo`, `libros/:id`, `libros/:id/editar`. *Trampa:* `libros/nuevo` debe declararse **antes** que `libros/:id`, o "nuevo" se toma como id.

## 6. Requisitos funcionales

1. **RF1 — Listar:** ver todos los libros en una tabla (ID, título, autor, año, género), con `@empty` si no hay datos.
2. **RF2 — Detalle:** ver un libro por su ID (`/libros/:id`). Si responde 404, mostrar un mensaje claro.
3. **RF3 — Crear:** formulario con validación en el cliente (campos obligatorios, año numérico y positivo). Mostrar los errores 400 del backend si llegan.
4. **RF4 — Editar:** el mismo formulario precargado con `GET /libros/{id}`, que envía `PUT`.
5. **RF5 — Eliminar:** pedir confirmación, enviar `DELETE` y refrescar el listado.
6. **RF6 — Errores:** si el backend está caído o responde un error, mostrar un aviso en la UI en vez de dejar la pantalla en blanco.

## 7. Backlog (issues)

- [ ] **#1 Arquetipo:** generar el proyecto **dentro de esta carpeta** (ya existe y tiene `docs/`): desde `gestor-libros-front`, `ng new gestor-libros-front --ssr=false --directory .` + repo git + carpetas `models/`, `services/`, `components/`.
- [ ] **#2 Model + environment** (`apiUrl`) + `provideHttpClient(withFetch())`.
- [ ] **#3 `LibroService`:** los 5 métodos, que devuelven `Observable`.
- [ ] **#4 `libro-list`:** listado con signal + eliminar con confirmación.
- [ ] **#5 `libro-detail`:** detalle leyendo `:id` de la ruta, y manejo del 404.
- [ ] **#6 `libro-form`:** crear/editar con Reactive Forms y errores 400.
- [ ] **#7 Rutas (Controlador) + navegación + aviso de errores.**
- [ ] **#8 Entrega:** README (cómo levantar, patrón MVC + Observer + arquetipo explicados, capturas) y zip.

## 8. Criterios de aceptación

- Los 5 endpoints se consumen desde la UI contra la URL local del microservicio.
- Se muestran los 5 atributos del libro.
- El código respeta el patrón: los componentes nunca usan `HttpClient` directamente, y el servicio es único (sin `providers` en los componentes).
- El README explica el arquetipo (Angular CLI) y el patrón (MVC + Observer) con el mismo mapeo de capas de §5.
