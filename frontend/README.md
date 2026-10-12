# Frontend – plantilla Vue 3 (Vite)

Plantilla inicial para que no empieces desde cero. Puedes modificar cualquier archivo,
cambiar los estilos o migrar a TypeScript si lo prefieres.

## Ejecutar en desarrollo

```bash
cd frontend
cp .env.example .env        # ajusta VITE_API_URL si tu API no corre en localhost:8080
npm install
npm run dev                 # http://localhost:5173
```

## Compilar imagen Docker

```bash
docker build -t mantenimiento-frontend --build-arg VITE_API_URL=http://localhost:8080/api .
docker run -p 3000:80 mantenimiento-frontend
```

Servicio para `docker-compose.yml`:

```yaml
  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: http://localhost:8080/api   # Vite la incrusta en el build
    container_name: mantenimiento-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

## Estructura

```
src/
├── main.js                    Punto de entrada (app + router + cierre de sesión en 401)
├── App.vue                    <RouterView />
├── router.js                  Rutas /login, /, /contracts/:id y guard de autenticación
├── styles.css                 Estilos base
├── api/
│   └── client.js              Cliente HTTP: token, errores, una función por endpoint
├── auth/
│   └── session.js             Sesión: useAuth() → user, login(), logout(); cierre automático en 401
├── utils/
│   └── format.js              Catálogos (roles, estatus), etiquetas y formato de fechas
├── components/
│   ├── AppLayout.vue          Cabecera con usuario y botón Salir + <RouterView /> de la página
│   ├── StatCard.vue           Tarjeta de indicador del dashboard
│   ├── StatusBadge.vue        Etiqueta de color por estatus
│   ├── ContractList.vue       Tabla de contratos con enlace al detalle
│   ├── TicketTable.vue        Tabla de tickets con columna de acciones (slot `actions`)
│   ├── LoadingMessage.vue     "Cargando…"
│   └── ErrorMessage.vue       Mensaje de error con botón "Reintentar" opcional
└── pages/
    ├── LoginPage.vue          ✔ Completa
    ├── DashboardPage.vue      ⚠ TODO: contadores de tickets pendientes / en proceso
    └── ContractDetailPage.vue ⚠ TODO: acciones por rol/estatus y llamada a PATCH
```

## Qué debe implementar el candidato

Cada archivo empieza con un bloque `PARA EL CANDIDATO` que indica si está **COMPLETO** o si
**REQUIERE IMPLEMENTACIÓN**, y describe exactamente qué debe hacerse. Busca `TODO (candidato)`:

| Archivo                        | El candidato debe implementar                                                                                                   |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `pages/DashboardPage.vue`      | En `load()`: el cálculo de `ticketsPendientes` y `ticketsEnProceso` para el usuario autenticado (vía `GET /api/dashboard` o contando los tickets de cada contrato). |
| `pages/ContractDetailPage.vue` | `getAvailableActions(ticket, user)`: qué botones ver según rol y estatus. `handleChangeStatus(ticket, estatus)`: llamar a `PATCH /api/tickets/{id}`, refrescar la tabla y mostrar los errores `403`/`409` del backend. |

Los demás archivos están completos (login, rutas protegidas, cliente HTTP con token, cierre de sesión
en 401, tablas, badges, estados de carga y error) y funcionan contra la API descrita en
`PRUEBA_TECNICA.md`. En `src/api/client.js` está el listado completo de endpoints que el backend
debe exponer, con cuerpos, respuestas y códigos HTTP.

