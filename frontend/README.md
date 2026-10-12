# Frontend – elige una plantilla

Hay **tres plantillas equivalentes**. Elige **una** según el stack que domines y trabaja solo en esa
carpeta; las otras dos puedes borrarlas de tu entrega (o dejarlas, no afecta la evaluación).

| Carpeta      | Stack                                   | Build            | Cómo recibe la URL de la API                      |
|--------------|-----------------------------------------|------------------|---------------------------------------------------|
| [`react/`](./react/README.md)     | React 19 + Vite + React Router 7 | `npm run build`  | `VITE_API_URL` como build arg (se incrusta en el build) |
| [`vue/`](./vue/README.md)         | Vue 3 + Vite + Vue Router 4      | `npm run build`  | `VITE_API_URL` como build arg (se incrusta en el build) |
| [`vanilla/`](./vanilla/README.md) | JavaScript puro (módulos ES), sin dependencias | ninguno | `API_URL` como variable de entorno del contenedor (genera `config.js` al arrancar) |

Las tres tienen exactamente lo mismo:

- Login funcional, rutas protegidas, cabecera con usuario y botón Salir.
- Cliente HTTP centralizado (`api/client.js` o `js/api.js`) que agrega el token, unifica los errores y
  cierra la sesión ante un `401`. Su cabecera lista **todos los endpoints que tu backend debe exponer**.
- Dashboard con contador de contratos activos y lista de contratos.
- Detalle de contrato con tabla de tickets y columna de acciones.
- Estados de carga y error, badges, formato de fechas, catálogos de roles y estatus.
- `Dockerfile` y `nginx.conf` listos.
- **Los mismos dos `TODO (candidato)`**: contadores del dashboard y acciones por rol + `PATCH` en el detalle.

Cada archivo empieza con un bloque `PARA EL CANDIDATO` que dice si está **COMPLETO** o si
**REQUIERE IMPLEMENTACIÓN**.

## Servicio `frontend` en docker-compose.yml

Apunta `build` a la carpeta de la plantilla elegida. React y Vue reciben la URL en el build; vanilla
la recibe al arrancar:

```yaml
  # React o Vue
  frontend:
    build:
      context: ./frontend/react          # o ./frontend/vue
      args:
        VITE_API_URL: http://localhost:8080/api
    container_name: mantenimiento-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

  # Vanilla
  frontend:
    build: ./frontend/vanilla
    container_name: mantenimiento-frontend
    environment:
      API_URL: http://localhost:8080/api
    ports:
      - "3000:80"
    depends_on:
      - backend
```

En los tres casos la URL es la que usará el **navegador** (`localhost`, no `backend`), y el backend
debe permitir CORS desde `http://localhost:3000`. Alternativa: activar el proxy `/api` comentado en
`nginx.conf` y usar `/api` como URL.

## ¿Puedo usar otro framework?

Sí (Angular, Svelte, TypeScript, Next, una librería de componentes…), siempre que cumplas las mismas
pantallas y requisitos de `PRUEBA_TECNICA.md` §7. Las plantillas existen para ahorrarte tiempo, no
para limitarte.
