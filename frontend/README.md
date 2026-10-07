# Frontend – plantilla React (Vite)

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

## Estructura

```
src/
├── main.jsx                   Punto de entrada (Router + AuthProvider)
├── App.jsx                    Rutas: /login, /, /contracts/:id
├── styles.css                 Estilos base
├── api/
│   └── client.js              Cliente HTTP: token, errores, una función por endpoint
├── context/
│   └── AuthContext.jsx        Sesión: user, login(), logout(), cierre automático en 401
├── utils/
│   └── format.js              Catálogos (roles, estatus), etiquetas y formato de fechas
├── components/
│   ├── ProtectedRoute.jsx     Redirige a /login si no hay sesión
│   ├── Layout.jsx             Cabecera con usuario y botón Salir
│   ├── StatCard.jsx           Tarjeta de indicador del dashboard
│   ├── StatusBadge.jsx        Etiqueta de color por estatus
│   ├── ContractList.jsx       Tabla de contratos con enlace al detalle
│   ├── TicketTable.jsx        Tabla de tickets con columna de acciones (render prop)
│   └── Feedback.jsx           <Loading /> y <ErrorMessage />
└── pages/
    ├── LoginPage.jsx          ✔ Completa
    ├── DashboardPage.jsx      ⚠ TODO: contadores de tickets pendientes / en proceso
    └── ContractDetailPage.jsx ⚠ TODO: acciones por rol/estatus y llamada a PATCH
```

## Qué debe implementar el candidato

Cada archivo empieza con un bloque `PARA EL CANDIDATO` que indica si está **COMPLETO** o si
**REQUIERE IMPLEMENTACIÓN**, y describe exactamente qué debe hacerse. Busca `TODO (candidato)`:

| Archivo                        | El candidato debe implementar                                                                                                   |
|--------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `pages/DashboardPage.jsx`      | En `load()`: el cálculo de `ticketsPendientes` y `ticketsEnProceso` para el usuario autenticado (vía `GET /api/dashboard` o contando los tickets de cada contrato). |
| `pages/ContractDetailPage.jsx` | `getAvailableActions(ticket, user)`: qué botones ver según rol y estatus. `handleChangeStatus(ticket, estatus)`: llamar a `PATCH /api/tickets/{id}`, refrescar la tabla y mostrar los errores `403`/`409` del backend. |

Los demás archivos están completos (login, rutas protegidas, cliente HTTP con token, cierre de sesión
en 401, tablas, badges, estados de carga y error) y funcionan contra la API descrita en
`PRUEBA_TECNICA.md`. En `src/api/client.js` está el listado completo de endpoints que el backend
debe exponer, con cuerpos, respuestas y códigos HTTP.
