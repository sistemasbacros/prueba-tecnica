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

## Qué debes completar

Busca `TODO (candidato)` en el código:

| Archivo                       | Qué falta                                                                      |
|-------------------------------|--------------------------------------------------------------------------------|
| `pages/DashboardPage.jsx`     | Calcular `ticketsPendientes` y `ticketsEnProceso` para el usuario autenticado. |
| `pages/ContractDetailPage.jsx`| `getAvailableActions` (reglas por rol y estatus) y `handleChangeStatus` (llamar a `PATCH /api/tickets/{id}`, refrescar, mostrar errores 403/409). |

Todo lo demás (login, rutas protegidas, cliente HTTP con token, cierre de sesión en 401,
tablas, estados de carga y error) ya funciona contra la API descrita en `PRUEBA_TECNICA.md`.
