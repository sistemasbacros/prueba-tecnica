# Backend – API REST

Esta carpeta está vacía a propósito: aquí va tu API en el lenguaje y framework que elijas.

Debe contener al menos:

- `Dockerfile`
- `.env.example` con las variables que tu API necesita (host/puerto/usuario de la base, secreto del token, puerto HTTP).
- El código de la API.

Endpoints obligatorios (detalle completo en `../PRUEBA_TECNICA.md`, sección 6):

| Método | Ruta                          | Auth | Roles                          |
|--------|-------------------------------|------|--------------------------------|
| POST   | `/api/auth/login`             | No   | todos                          |
| GET    | `/api/contracts`              | Sí   | todos (filtrado por rol)       |
| GET    | `/api/contracts/{id}`         | Sí   | todos (403 si no tiene acceso) |
| GET    | `/api/contracts/{id}/tickets` | Sí   | todos (filtrado por rol)       |
| PATCH  | `/api/tickets/{id}`           | Sí   | todos (técnico solo los suyos) |

Conexión a la base desde el contenedor:

```
Server=db,1433;Database=MantenimientoDB;User Id=mantenimiento_app;Password=App2026!Mant;TrustServerCertificate=True;
```
