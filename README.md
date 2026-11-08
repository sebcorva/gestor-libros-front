# gestor-libros-front

Frontend en **Angular** para la **gestión de libros de una biblioteca**. Permite listar, ver, crear, editar y eliminar libros, consumiendo la API REST del microservicio **[`gestor-libros-ms`](../gestor-libros-ms)**.

Los dos proyectos forman una sola aplicación:

| Proyecto | Rol | Tecnología | Puerto |
|---|---|---|---|
| `gestor-libros-front` (este repo) | Frontend: interfaz de usuario | Angular 22 | `4200` |
| `gestor-libros-ms` | Backend: API REST y persistencia | Spring Boot 4 + Oracle Autonomous DB | `8080` |

```
Navegador (Angular, localhost:4200) ──HTTP + CORS──► gestor-libros-ms (localhost:8080) ──JPA──► Oracle (tabla LIBROS)
```

## Funcionalidades

- **Listado** de todos los libros, con opción para eliminar cada uno.
- **Detalle** de un libro por su id.
- **Formulario** de creación y edición (el mismo componente para ambos casos), con validaciones en el cliente iguales a las del backend.
- **Mensajes de error unificados**: si el backend no responde, devuelve `404`, `400` (validación) o `5xx`, la app muestra un mensaje claro. Los errores de validación del servidor se muestran junto a cada campo.

## Arquitectura

La app sigue el patrón **MVC** adaptado a Angular, con componentes standalone:

- **Modelo** → `models/libro.ts` (interfaz `Libro`) y `services/libro.service.ts`, que obtiene y persiste los datos llamando a la API.
- **Vista** → las plantillas HTML/CSS de cada componente.
- **Controlador** → la clase TypeScript de cada componente, que reacciona a las acciones del usuario y llama al servicio.

Además se aplican estos patrones:

- **Singleton**: `LibroService` se registra con `providedIn: 'root'`, así que hay una sola instancia para toda la app.
- **Observer**: cada método del servicio devuelve un `Observable`; la petición HTTP sale cuando el componente se suscribe con `.subscribe({ next, error })`.
- **Inyección de dependencias** con `inject()`.
- **Signals** para el estado de los componentes (`cargando`, `error`, etc.).

### Estructura

```
src/
├── app/
│   ├── app.config.ts          # Providers: router y HttpClient (con fetch)
│   ├── app.routes.ts          # Definición de rutas
│   ├── app.html / app.ts      # Layout: barra de navegación + <router-outlet>
│   ├── models/
│   │   └── libro.ts           # Interfaz Libro
│   ├── services/
│   │   └── libro.service.ts   # CRUD contra la API (getAll, getById, create, update, delete)
│   ├── components/
│   │   ├── libro-list/        # Listado y eliminación
│   │   ├── libro-detail/      # Detalle por id
│   │   └── libro-form/        # Crear / editar (formulario reactivo)
│   └── utils/
│       └── mensaje-error.ts   # Traduce errores HTTP a mensajes para el usuario
└── environments/
    ├── environment.ts             # apiUrl para producción
    └── environment.development.ts # apiUrl para desarrollo
```

### Rutas

| Ruta | Componente | Descripción |
|---|---|---|
| `/` | — | Redirige a `/libros` |
| `/libros` | `LibroListComponent` | Listado de libros |
| `/libros/nuevo` | `LibroFormComponent` | Crear un libro |
| `/libros/:id` | `LibroDetailComponent` | Detalle de un libro |
| `/libros/:id/editar` | `LibroFormComponent` | Editar un libro |
| `**` | — | Cualquier otra ruta redirige a `/libros` |

### Comunicación con el backend

La URL de la API se define en `src/environments/`:

```ts
export const environment = {
  apiUrl: 'http://localhost:8080/libros',
};
```

| Acción en la app | Petición |
|---|---|
| Ver listado | `GET /libros` |
| Ver detalle / cargar para editar | `GET /libros/{id}` |
| Crear | `POST /libros` |
| Guardar edición | `PUT /libros/{id}` |
| Eliminar | `DELETE /libros/{id}` |

El modelo `Libro` tiene `id`, `titulo`, `autor`, `anioPublicacion` y `genero`, igual que el `LibroResponse` del backend. Para el detalle de endpoints, validaciones y formato de errores, revisa el README de `gestor-libros-ms`.

## Requisitos

- Node.js (desarrollado con v26) y npm 11
- El backend `gestor-libros-ms` corriendo en `http://localhost:8080` (Java 17)

## Cómo ejecutar

### 1. Levantar el backend

```bash
cd gestor-libros-ms
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080/libros`.

### 2. Levantar el frontend

```bash
cd gestor-libros-front
npm install
npm start        # equivale a: ng serve
```

Abre `http://localhost:4200/` en el navegador. La app se recarga sola cuando modificas el código.

> Si el frontend muestra "No se pudo conectar con el servidor", revisa que `gestor-libros-ms` esté corriendo en el puerto `8080`.

### Build de producción

```bash
npm run build
```

Los archivos quedan en `dist/`.

## Tests

Los tests unitarios usan **[Vitest](https://vitest.dev/)** con `jsdom`, a través del builder de Angular. No necesitan el backend: las peticiones HTTP se simulan.

```bash
npm test                       # modo watch (se vuelven a correr al guardar)
npx ng test --watch=false      # una sola ejecución, útil para CI
```

Hay pruebas para el servicio (`libro.service.spec.ts`), los tres componentes y el componente raíz (`app.spec.ts`).
