# Prueba Técnica – Desarrollador Full Stack

**Duración: 1:30 horas.**

Lee este documento completo antes de empezar. Está pensado para que no tengas que adivinar nada:
todo lo que se evalúa está descrito aquí. Si algo no está especificado, decide tú y anótalo en la
sección "Decisiones y supuestos" de tu README.

---

## Índice

1. [Objetivo](#1-objetivo)
2. [Reglas de la prueba](#2-reglas-de-la-prueba)
3. [Arquitectura esperada](#3-arquitectura-esperada)
4. [Base de datos (entregada)](#4-base-de-datos-entregada)
5. [Paso 1 – Levantar la base de datos](#5-paso-1--levantar-la-base-de-datos)
6. [Paso 2 – API REST](#6-paso-2--api-rest)
7. [Paso 3 – Frontend en React](#7-paso-3--frontend-en-react)
8. [Paso 4 – Contenedores y docker-compose](#8-paso-4--contenedores-y-docker-compose)
9. [Roles y permisos](#9-roles-y-permisos)
10. [Manejo de errores](#10-manejo-de-errores)
11. [Alcance: obligatorio vs. deseable](#11-alcance-obligatorio-vs-deseable)
12. [Entrega](#12-entrega)
13. [Pregunta final](#13-pregunta-final)
14. [Criterios de evaluación](#14-criterios-de-evaluación)
15. [Sugerencia de distribución del tiempo](#15-sugerencia-de-distribución-del-tiempo)
16. [Referencia rápida: librerías por lenguaje](#16-referencia-rápida-librerías-por-lenguaje)
17. [Checklist antes de entregar](#17-checklist-antes-de-entregar)

---

## 1. Objetivo

Construir una aplicación web sencilla para consultar **contratos de mantenimiento** y los
**tickets** asociados a cada contrato, con inicio de sesión y permisos por rol.

Nosotros entregamos la base de datos ya construida (SQL Server en Docker, con tablas y datos).
Tú desarrollas la API REST y el frontend:

```
Base de datos (entregada)  →  API REST (tú)  →  Frontend en React (tú)
```

### Qué se espera en 1:30 horas (perfil senior)

La prueba está dimensionada para un desarrollador senior en un stack que domina. No se espera
perfección ni que todo esté terminado: **se evalúa qué priorizas y la calidad de lo que entregas.**

Orden de prioridad recomendado. Entrega cada punto funcionando antes de pasar al siguiente:

1. Backend conectado a la base con `mantenimiento_app`, login con bcrypt y token.
2. Middleware de autenticación y validación de roles en el backend.
3. Los tres `GET` con el filtrado por rol correcto.
4. `PATCH /api/tickets/{id}` con sus reglas de negocio.
5. Los dos `TODO (candidato)` del frontend.
6. `Dockerfile` del backend y servicios `backend` y `frontend` en el compose.
7. README con decisiones, lo que faltó y la pregunta final.

Un candidato senior típicamente completa los puntos 1 a 5 y deja el 6 o el 7 parcialmente
documentados. Un punto a medias pero documentado ("no alcancé a X, lo haría así") puntúa; un punto
que no arranca, no.

---

## 2. Reglas de la prueba

| # | Regla |
|---|-------|
| 1 | **Backend:** lenguaje y framework de libre elección (Node, .NET, PHP/Laravel, Python, Java, Go, Rust, etc.). Justifica brevemente tu elección en el README. |
| 2 | **Frontend:** obligatoriamente en **React**. En `frontend/` hay una plantilla (Vite + React Router) con login, rutas, cliente HTTP y componentes ya hechos; úsala o reemplázala, pero las pantallas y requisitos de la sección 7 son los mismos. |
| 3 | **Tres contenedores separados** orquestados por el `docker-compose.yml` de este repositorio: `db` (entregado, no se modifica), `backend` (tuyo) y `frontend` (tuyo). |
| 4 | **No modifiques** `db/init/01-schema.sql` ni `db/init/02-seed.sql`. Si necesitas objetos adicionales (vistas, índices, procedimientos), agrégalos en un archivo nuevo `db/init/03-<nombre>.sql` y explícalo en el README. |
| 5 | **No guardes contraseñas en texto plano** ni cambies los hashes de la base. El login debe validar contra el hash bcrypt existente. |
| 6 | La configuración (puertos, cadena de conexión, secreto del token) debe salir de **variables de entorno**. Versiona un `.env.example`; no versiones `.env`. |
| 7 | Entrega un **repositorio Git** (fork de este o uno nuevo) con commits significativos. No se aceptan archivos comprimidos. |
| 8 | Puedes usar cualquier recurso (documentación, IA, librerías). Lo que se evalúa es el resultado y que puedas explicarlo. |
| 9 | Si no terminas todo en 1:30 horas, entrega lo que tengas funcionando y documenta en el README qué faltó y cómo lo harías. Una entrega parcial bien explicada vale más que una completa que no arranca. |

---

## 3. Arquitectura esperada

```
┌─────────────────────────────┐
│          FRONTEND           │  contenedor `frontend`
│   React (Vite / Next / CRA) │  puerto host: el que elijas (sugerido 3000)
└──────────────┬──────────────┘
               │ HTTP / JSON  (fetch / axios)
               ▼
┌─────────────────────────────┐
│           API REST          │  contenedor `backend`
│      lenguaje libre         │  puerto host: el que elijas (sugerido 8080)
└──────────────┬──────────────┘
               │ TDS (TCP 1433) – host `db` dentro de la red de compose
               ▼
┌─────────────────────────────┐
│          SQL SERVER         │  contenedor `db` (entregado)
│       MantenimientoDB       │  puerto host 1433
└─────────────────────────────┘
```

Puntos clave:

- El frontend habla **solo** con la API. Nunca con la base de datos.
- El backend se conecta a SQL Server usando el host `db` (nombre del servicio en compose), **no** `localhost`.
- El backend debe usar el login `mantenimiento_app` (ver sección 4.4), no `sa`.

---

## 4. Base de datos (entregada)

Nombre de la base: **`MantenimientoDB`**. Scripts en `db/init/`.

### 4.1 Tabla `Usuarios`

| Columna         | Tipo         | Restricciones                                                   |
|-----------------|--------------|-----------------------------------------------------------------|
| `IdUsuario`     | INT          | PK, identity                                                    |
| `NombreUsuario` | VARCHAR(100) | NOT NULL, único                                                 |
| `PasswordHash`  | VARCHAR(255) | NOT NULL, hash **bcrypt** (prefijo `$2a$`, cost 10)             |
| `Correo`        | VARCHAR(150) | NOT NULL, único                                                 |
| `Rol`           | VARCHAR(30)  | NOT NULL, CHECK: `ADMINISTRADOR` · `SUPERVISOR` · `TECNICO`     |
| `Activo`        | BIT          | NOT NULL, default 1. Un usuario inactivo **no puede iniciar sesión** |

### 4.2 Tabla `Contratos`

| Columna                | Tipo         | Restricciones                                            |
|------------------------|--------------|----------------------------------------------------------|
| `IdContrato`           | INT          | PK, identity                                             |
| `NumeroContrato`       | VARCHAR(50)  | NOT NULL, único (ej. `CON-001`)                          |
| `NombreContrato`       | VARCHAR(200) | NOT NULL                                                 |
| `FechaInicio`          | DATE         | NOT NULL                                                 |
| `FechaFin`             | DATE         | NOT NULL, CHECK `FechaFin >= FechaInicio`                |
| `Estatus`              | VARCHAR(30)  | NOT NULL, CHECK: `ACTIVO` · `FINALIZADO` · `CANCELADO`   |
| `IdUsuarioResponsable` | INT          | NOT NULL, FK → `Usuarios.IdUsuario`                      |

### 4.3 Tabla `Tickets`

| Columna             | Tipo         | Restricciones                                                                     |
|---------------------|--------------|-----------------------------------------------------------------------------------|
| `IdTicket`          | INT          | PK, identity                                                                      |
| `IdContrato`        | INT          | NOT NULL, FK → `Contratos.IdContrato`                                             |
| `Tipo`              | VARCHAR(30)  | NOT NULL, CHECK: `PREVENTIVO` · `CORRECTIVO` · `EMERGENCIA`                       |
| `Descripcion`       | VARCHAR(500) | NOT NULL                                                                          |
| `FechaSolicitud`    | DATETIME     | NOT NULL, default `GETDATE()`                                                     |
| `Estatus`           | VARCHAR(30)  | NOT NULL, default `PENDIENTE`. CHECK: `PENDIENTE` · `ASIGNADO` · `EN_PROCESO` · `FINALIZADO` · `CANCELADO` |
| `IdUsuarioAsignado` | INT          | NULL permitido (= sin asignar), FK → `Usuarios.IdUsuario`                         |

Índices existentes: `IX_Contratos_Responsable`, `IX_Tickets_Contrato`, `IX_Tickets_Asignado`, `IX_Tickets_Estatus`.

### 4.4 Credenciales de SQL Server (para tu backend)

| Login               | Contraseña      | Uso                                                                 |
|---------------------|-----------------|---------------------------------------------------------------------|
| `mantenimiento_app` | `App2026!Mant`  | **Úsalo en tu backend.** Solo lectura/escritura sobre `MantenimientoDB`. |
| `sa`                | `Bacros2026!Sql`| Administración. Lo usa el contenedor de inicialización. No lo uses en tu API. |

Cadena de conexión de ejemplo (desde el contenedor `backend`):

```
Server=db,1433;Database=MantenimientoDB;User Id=mantenimiento_app;Password=App2026!Mant;TrustServerCertificate=True;Encrypt=True;
```

Desde tu máquina (desarrollo sin contenedor) cambia `db` por `localhost`.

> **Importante:** SQL Server 2022 en Docker usa un certificado autofirmado. Casi todos los drivers
> requieren `TrustServerCertificate=True` (o `trustServerCertificate: true`) para conectarse.

### 4.5 Usuarios de la aplicación (tabla `Usuarios`)

| Id | Usuario         | Contraseña        | Rol           | Activo |
|----|-----------------|-------------------|---------------|--------|
| 1  | `administrador` | `Admin2026!`      | ADMINISTRADOR | Sí     |
| 2  | `supervisor`    | `Supervisor2026!` | SUPERVISOR    | Sí     |
| 3  | `tecnico01`     | `Tecnico2026!`    | TECNICO       | Sí     |
| 4  | `tecnico02`     | `Tecnico2026!`    | TECNICO       | Sí     |
| 5  | `tecnico03`     | `Tecnico2026!`    | TECNICO       | Sí     |
| 6  | `tecnico04`     | `Tecnico2026!`    | TECNICO       | **No** → el login debe rechazarlo |

### 4.6 Datos iniciales

**Contratos**

| Id | Número    | Nombre                     | Inicio     | Fin        | Estatus    | Responsable |
|----|-----------|----------------------------|------------|------------|------------|-------------|
| 1  | `CON-001` | Mantenimiento Planta Norte | 2026-01-01 | 2026-12-31 | ACTIVO     | supervisor  |
| 2  | `CON-002` | Mantenimiento Planta Sur   | 2026-03-01 | 2027-02-28 | ACTIVO     | supervisor  |
| 3  | `CON-003` | Mantenimiento Oficinas     | 2025-01-01 | 2025-12-31 | FINALIZADO | administrador |
| 4  | `CON-004` | Mantenimiento Centro de Distribución | 2026-06-01 | 2027-05-31 | ACTIVO | supervisor |

**Tickets** (17 en total)

| Id  | Contrato | Tipo       | Estatus    | Asignado a |
|-----|----------|------------|------------|------------|
| 101 | CON-001  | PREVENTIVO | ASIGNADO   | tecnico01  |
| 102 | CON-001  | CORRECTIVO | EN_PROCESO | tecnico02  |
| 103 | CON-001  | EMERGENCIA | PENDIENTE  | —          |
| 104 | CON-001  | PREVENTIVO | FINALIZADO | tecnico01  |
| 105 | CON-001  | CORRECTIVO | PENDIENTE  | —          |
| 106 | CON-001  | PREVENTIVO | EN_PROCESO | tecnico03  |
| 107 | CON-002  | PREVENTIVO | ASIGNADO   | tecnico02  |
| 108 | CON-002  | EMERGENCIA | EN_PROCESO | tecnico03  |
| 109 | CON-002  | CORRECTIVO | PENDIENTE  | —          |
| 110 | CON-002  | PREVENTIVO | PENDIENTE  | —          |
| 111 | CON-002  | CORRECTIVO | CANCELADO  | tecnico01  |
| 112 | CON-002  | PREVENTIVO | PENDIENTE  | —          |
| 113 | CON-003  | PREVENTIVO | FINALIZADO | tecnico01  |
| 114 | CON-003  | CORRECTIVO | FINALIZADO | tecnico02  |
| 115 | CON-003  | EMERGENCIA | FINALIZADO | tecnico03  |
| 116 | CON-004  | PREVENTIVO | ASIGNADO   | tecnico02  |
| 117 | CON-004  | CORRECTIVO | PENDIENTE  | —          |

Totales por estatus: PENDIENTE 6 · ASIGNADO 3 · EN_PROCESO 3 · FINALIZADO 4 · CANCELADO 1.
Estos números te sirven para validar el dashboard.

`CON-004` solo tiene tickets de `tecnico02`. Sirve para comprobar el filtrado por rol: `tecnico01` y
`tecnico03` no deben verlo en `GET /api/contracts` y deben recibir `403` en `GET /api/contracts/4`.

---

## 5. Paso 1 – Levantar la base de datos

### Antes de que empiece el tiempo

Estos pasos descargan imágenes y dependencias y **no forman parte de la prueba**. Hazlos antes de
iniciar el cronómetro:

1. Clonar el repositorio y ejecutar `docker compose up -d` (descarga SQL Server, ≈ 1.5 GB).
2. `cd frontend && npm install`.
3. Tener instalado el runtime de tu backend (Node, .NET SDK, Python, PHP + Composer, etc.).
4. Leer este documento, `tests/README.md` y el ejemplo de tu stack en `docs/ejemplos/`.

### Levantar la base

```bash
git clone https://github.com/sistemasbacros/prueba-tecnica.git
cd prueba-tecnica
docker compose up -d
```

Qué ocurre:

1. Se descarga la imagen `mcr.microsoft.com/mssql/server:2022-latest` (≈ 1.5 GB la primera vez).
2. Arranca el contenedor `mantenimiento-db` y el healthcheck espera a que SQL Server responda.
3. El contenedor `mantenimiento-db-init` ejecuta los scripts de `db/init/` y termina (es normal que quede en estado `Exited (0)`).

Comprueba que todo está bien:

```bash
docker compose ps                     # db debe estar "healthy"; db-init "Exited (0)"
docker compose logs db-init           # debe terminar con "Base de datos inicializada correctamente"
```

Consulta rápida desde dentro del contenedor:

```bash
docker exec -it mantenimiento-db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U mantenimiento_app -P 'App2026!Mant' -d MantenimientoDB -C \
  -Q "SELECT COUNT(*) AS Tickets FROM dbo.Tickets"
```

También puedes conectarte con SQL Server Management Studio, Azure Data Studio o DBeaver a
`localhost,1433` con las credenciales de la sección 4.4.

Problemas comunes: ver la sección [Solución de problemas del README](./README.md#solución-de-problemas).

---

## 6. Paso 2 – API REST

Las rutas, métodos, cuerpos y respuestas de esta sección son **exactos y obligatorios**. La plantilla de
frontend entregada (`frontend/src/api/client.js`) ya los consume tal cual, así que respetarlos te ahorra
tiempo. No agregues versionado (`/v1`), no cambies nombres de propiedades y no envuelvas las respuestas
en objetos tipo `{ data: ... }`.

Resumen:

| # | Método | Ruta                          | Auth | Quién                                   | Obligatorio |
|---|--------|-------------------------------|------|-----------------------------------------|:-----------:|
| 1 | POST   | `/api/auth/login`             | No   | todos                                   | ✔           |
| 2 | GET    | `/api/contracts`              | Sí   | todos (filtrado por rol)                | ✔           |
| 3 | GET    | `/api/contracts/{id}`         | Sí   | todos (`403` si no tiene acceso)        | ✔           |
| 4 | GET    | `/api/contracts/{id}/tickets` | Sí   | todos (filtrado por rol)                | ✔           |
| 5 | PATCH  | `/api/tickets/{id}`           | Sí   | todos (técnico solo los suyos)          | ✔           |
| 6 | GET    | `/api/dashboard`              | Sí   | todos                                   | deseable    |
| 7 | POST   | `/api/tickets/{id}/assign`    | Sí   | ADMINISTRADOR, SUPERVISOR               | deseable    |
| 8 | GET    | `/api/users?rol=TECNICO`      | Sí   | ADMINISTRADOR, SUPERVISOR               | deseable    |

Convenciones:

- Prefijo `/api`.
- Todas las respuestas en JSON (`Content-Type: application/json`).
- Todos los endpoints excepto `POST /api/auth/login` requieren el header `Authorization: Bearer <token>`.
- Las fechas se devuelven en formato ISO 8601 (`2026-01-01` para DATE, `2026-09-01T08:30:00` para DATETIME).
  `FechaSolicitud` es un `DATETIME` sin zona horaria: devuélvelo tal cual está en la base, sin
  convertirlo a UTC ni agregar sufijo `Z`.
- Los nombres de propiedades en JSON van en `camelCase`.

### 6.1 `POST /api/auth/login` — iniciar sesión

Request:

```json
{ "username": "supervisor", "password": "Supervisor2026!" }
```

Respuesta `200 OK`:

```json
{
  "token": "<jwt u otro token>",
  "user": { "id": 2, "username": "supervisor", "role": "SUPERVISOR" }
}
```

Reglas:

| Situación                                   | Respuesta |
|---------------------------------------------|-----------|
| Falta `username` o `password`               | `400`     |
| Usuario no existe o contraseña incorrecta   | `401` (mismo mensaje en ambos casos, no reveles cuál falló) |
| Usuario con `Activo = 0`                    | `401` o `403` (documenta cuál elegiste) |
| Credenciales correctas                      | `200` con token |

- La contraseña se compara con `PasswordHash` usando **bcrypt**. Nunca se almacena ni se compara en texto plano.
- El token puede ser JWT (recomendado), sesión con cookie, o cualquier mecanismo razonable. Si usas
  JWT, el secreto y la expiración salen de variables de entorno (`JWT_SECRET`, `JWT_EXPIRES_IN`).
- Expiración: **8 horas**. Un token expirado o manipulado responde `401`; el frontend entregado
  cierra la sesión automáticamente al recibirlo.
- El token debe permitir al backend conocer al menos el `id` y el `rol` del usuario en cada petición.

### 6.2 `GET /api/contracts` — listado de contratos

Devuelve los contratos **que el usuario autenticado puede ver** (ver sección 9).

Respuesta `200 OK`:

```json
[
  {
    "id": 1,
    "numero": "CON-001",
    "nombre": "Mantenimiento Planta Norte",
    "fechaInicio": "2026-01-01",
    "fechaFin": "2026-12-31",
    "estatus": "ACTIVO",
    "responsable": { "id": 2, "nombre": "supervisor" }
  }
]
```

### 6.3 `GET /api/contracts/{id}` — detalle de un contrato

Respuesta `200 OK`: el mismo objeto de la lista.
`404` si no existe. `403` si existe pero el usuario no tiene acceso (técnico sin tickets en ese contrato).

### 6.4 `GET /api/contracts/{id}/tickets` — tickets de un contrato

Devuelve los tickets del contrato **visibles para el usuario** (un técnico solo ve los suyos).

Respuesta `200 OK`:

```json
[
  {
    "id": 101,
    "tipo": "PREVENTIVO",
    "descripcion": "Revisión de motor principal línea 1",
    "fechaSolicitud": "2026-09-01T08:30:00",
    "estatus": "ASIGNADO",
    "usuarioAsignado": { "id": 3, "nombre": "tecnico01" }
  },
  {
    "id": 103,
    "tipo": "EMERGENCIA",
    "descripcion": "Fuga de aceite en compresor principal",
    "fechaSolicitud": "2026-09-05T06:45:00",
    "estatus": "PENDIENTE",
    "usuarioAsignado": null
  }
]
```

### 6.5 `PATCH /api/tickets/{id}` — cambiar el estatus de un ticket (**operación de escritura obligatoria**)

Request:

```json
{ "estatus": "EN_PROCESO" }
```

Respuesta `200 OK`: el ticket actualizado con la misma forma que en 6.4.

Reglas de negocio que **el backend debe validar**:

| Regla                                                                         | Respuesta si se incumple |
|-------------------------------------------------------------------------------|--------------------------|
| `estatus` debe ser uno de los 5 valores válidos                               | `400`                    |
| El ticket debe existir                                                        | `404`                    |
| Un técnico solo puede modificar tickets asignados a él                        | `403`                    |
| Un ticket `FINALIZADO` o `CANCELADO` ya no se puede modificar                 | `409`                    |
| Transiciones permitidas: `PENDIENTE`/`ASIGNADO` → `EN_PROCESO` · `EN_PROCESO` → `FINALIZADO` · cualquiera (no final) → `CANCELADO` | `409` |

### 6.6 `GET /api/dashboard` — contadores (opcional, ver sección 11)

Si lo implementas, devuelve los contadores ya calculados para el usuario autenticado:

```json
{ "contratosActivos": 3, "ticketsPendientes": 6, "ticketsEnProceso": 3 }
```

Si no lo implementas, el frontend puede calcular los contadores a partir de `GET /api/contracts` y
`GET /api/contracts/{id}/tickets`.

### 6.7 Endpoints deseables (solo si te sobra tiempo)

```
POST /api/tickets/{id}/assign     { "idUsuario": 4 }   → asigna un técnico (ADMIN/SUPERVISOR)
GET  /api/users?rol=TECNICO                            → lista de técnicos activos (ADMIN/SUPERVISOR)
```

Reglas de `assign`: solo a usuarios con rol `TECNICO` y `Activo = 1` (`400` si no), solo sobre tickets
de contratos `ACTIVO` (`409`), y si el ticket estaba `PENDIENTE` pasa a `ASIGNADO`.

### 6.8 Verificación automática

En `tests/` hay un script que comprueba todo lo anterior con 36 peticiones. **El evaluador usa
exactamente este script**, así que ejecútalo antes de entregar:

```bash
bash tests/smoke.sh                 # API en http://localhost:8080/api (en Windows: Git Bash)
API_URL=http://localhost:3001/api bash tests/smoke.sh
bash tests/smoke.sh --no-write      # omite los 3 casos que modifican el ticket 107
```

Objetivo: `FAIL: 0`. Los casos de endpoints deseables se marcan `SKIP` si no existen y no penalizan.
También hay un `tests/api.http` con las mismas peticiones para REST Client, Postman o Insomnia.
Detalle en [`tests/README.md`](./tests/README.md).

---

## 7. Paso 3 – Frontend en React

Tres pantallas. No se evalúa diseño visual: se evalúa que funcione, que esté bien estructurado y que
maneje los estados de carga y error.

**Para no empezar desde cero, en `frontend/` hay una plantilla React (Vite) lista para usar.**
Incluye rutas, login funcional, cliente HTTP con token, contexto de sesión, dashboard, detalle de
contrato, tablas, badges, estados de carga/error, `Dockerfile` y `nginx.conf`. Detalle en
[`frontend/README.md`](./frontend/README.md).

Lo que **tú** debes completar está marcado con `TODO (candidato)`:

| Archivo                                      | Qué falta                                                                                   |
|----------------------------------------------|---------------------------------------------------------------------------------------------|
| `frontend/src/pages/DashboardPage.jsx`       | Contadores de tickets pendientes y en proceso para el usuario autenticado.                  |
| `frontend/src/pages/ContractDetailPage.jsx`  | `getAvailableActions` (qué botones ver según rol y estatus) y `handleChangeStatus` (llamar a `PATCH /api/tickets/{id}`, refrescar, mostrar errores `403`/`409`). |

Puedes modificar cualquier archivo de la plantilla, cambiar estilos, usar TypeScript o una librería de
componentes. Si prefieres no usarla y hacer tu propio frontend, también es válido, pero debes cumplir
las mismas pantallas y requisitos.

### 7.1 Login (`/login`)

```
┌──────────────────────────────┐
│     SISTEMA MANTENIMIENTO    │
│                              │
│ Usuario:  [______________]   │
│ Password: [______________]   │
│                              │
│          [ INGRESAR ]        │
│                              │
│  (mensaje de error aquí)     │
└──────────────────────────────┘
```

- Llama a `POST /api/auth/login`.
- Guarda el token (localStorage, memoria o cookie; documenta tu elección) y redirige al dashboard.
- Muestra un mensaje claro si las credenciales son incorrectas o la API no responde.
- Si el usuario no está autenticado y entra a cualquier otra ruta, redirígelo a `/login`.

### 7.2 Dashboard (`/`)

```
┌────────────────────────────────────────────────┐
│ Dashboard              Usuario: supervisor  [Salir] │
├────────────────────────────────────────────────┤
│  Contratos activos: 3                          │
│  Tickets pendientes: 6                         │
│  Tickets en proceso: 3                         │
├────────────────────────────────────────────────┤
│ CONTRATOS                                      │
│  CON-001  Mantenimiento Planta Norte  ACTIVO     │
│  CON-002  Mantenimiento Planta Sur    ACTIVO     │
│  CON-003  Mantenimiento Oficinas      FINALIZADO │
│  CON-004  Mant. Centro de Distribución ACTIVO    │
└────────────────────────────────────────────────┘
```

- Muestra el usuario autenticado y un botón para cerrar sesión.
- Los contadores se calculan **con los datos que la API devuelve para ese usuario**. Para un técnico
  solo cuentan sus tickets.
- Cada contrato de la lista lleva al detalle.

Valores esperados con los datos iniciales:

| Usuario       | Contratos activos | Tickets pendientes | Tickets en proceso |
|---------------|------------------:|-------------------:|-------------------:|
| administrador | 3                 | 6                  | 3                  |
| supervisor    | 3                 | 6                  | 3                  |
| tecnico01     | 2 (CON-001 y CON-002; no ve CON-004) | 0 | 0 |
| tecnico02     | 3 (CON-001, CON-002 y CON-004) | 0    | 1                  |
| tecnico03     | 2                 | 0                  | 2                  |

### 7.3 Detalle del contrato (`/contracts/:id`)

```
Contrato: CON-001
Nombre:   Mantenimiento Planta Norte
Inicio:   01/01/2026
Fin:      31/12/2026
Estatus:  ACTIVO
Responsable: supervisor

TICKETS
┌─────┬────────────┬─────────────────────────────────────┬────────────┬─────────────┬──────────────┐
│ ID  │ Tipo       │ Descripción                         │ Estatus    │ Asignado a  │ Acciones     │
├─────┼────────────┼─────────────────────────────────────┼────────────┼─────────────┼──────────────┤
│ 101 │ Preventivo │ Revisión de motor principal línea 1 │ Asignado   │ tecnico01   │ [Iniciar]    │
│ 102 │ Correctivo │ Reparación de banda transportadora  │ En proceso │ tecnico02   │ [Finalizar]  │
│ 103 │ Emergencia │ Fuga de aceite en compresor         │ Pendiente  │ —           │ [Cancelar]   │
└─────┴────────────┴─────────────────────────────────────┴────────────┴─────────────┴──────────────┘
```

- Las fechas se muestran en formato `dd/mm/aaaa`.
- La columna **Acciones** permite cambiar el estatus con `PATCH /api/tickets/{id}` y refresca la
  tabla al terminar. Qué botones aparecen depende del rol y del estatus actual (ver 6.5 y 9).
- Ocultar un botón en el frontend **no sustituye** la validación en el backend: si el backend
  responde `403`, el frontend debe mostrar el error.
- Un técnico solo ve en la tabla sus propios tickets.

### 7.4 Requisitos transversales del frontend

- Una capa de acceso a la API (un módulo o hook) que agregue el header `Authorization` y
  centralice el manejo de errores. Si la API devuelve `401`, cerrar sesión y volver al login.
- Estados de carga ("Cargando…") y de error visibles en cada pantalla.
- La URL base de la API debe venir de una variable de entorno (por ejemplo `VITE_API_URL`), no estar
  escrita en el código.

---

## 8. Paso 4 – Contenedores y docker-compose

Agrega al `docker-compose.yml` existente los servicios `backend` y `frontend`. El servicio `db`
no se modifica.

Estructura esperada del repositorio al final:

```
.
├── docker-compose.yml          # db (entregado) + backend + frontend
├── .env.example                # ampliado con tus variables
├── db/init/                    # no se modifica (salvo 03-*.sql opcional)
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   └── ... tu código
├── frontend/                   # plantilla entregada (Dockerfile, nginx.conf y .env.example incluidos)
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── .env.example
│   └── src/ ... completa los TODO
├── README.md                   # el tuyo (ver sección 12)
└── PRUEBA_TECNICA.md
```

Ejemplo de cómo podrían quedar los servicios (adáptalo a tu stack):

```yaml
  backend:
    build: ./backend
    container_name: mantenimiento-backend
    environment:
      DB_HOST: db
      DB_PORT: 1433
      DB_NAME: MantenimientoDB
      DB_USER: mantenimiento_app
      DB_PASSWORD: ${DB_APP_PASSWORD:-App2026!Mant}
      JWT_SECRET: ${JWT_SECRET:-cambia-este-secreto}
      PORT: 8080
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: ./frontend
      args:
        # Vite incrusta esta URL en el build; es la que usará el navegador
        VITE_API_URL: http://localhost:8080/api
    container_name: mantenimiento-frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
```

El `Dockerfile` y el `nginx.conf` del frontend ya están en la plantilla; el servicio de arriba
funciona tal cual si tu backend escucha en el puerto `8080`.

Consideraciones:

- `depends_on` con `condition: service_healthy` garantiza que el backend arranque cuando SQL Server
  ya responde. Aun así, es buena práctica que el backend reintente la conexión al iniciar.
- El frontend corre en el navegador del usuario, por lo que llama a la API por `localhost:<puerto>`,
  **no** por `backend:<puerto>`. Alternativa válida: servir el frontend con nginx y hacer proxy de `/api` al backend.
- Habilita CORS en el backend para el origen del frontend, o usa el proxy mencionado.
- Al terminar, el evaluador ejecutará **solo** esto y abrirá el navegador:

  ```bash
  docker compose up -d --build
  ```

---

## 9. Roles y permisos

**El backend valida los permisos en cada petición.** El frontend solo adapta la interfaz.
La seguridad no debe depender del frontend.

| Acción                               | ADMINISTRADOR | SUPERVISOR | TECNICO                                        |
|--------------------------------------|:-------------:|:----------:|:----------------------------------------------:|
| Iniciar sesión                       | ✔             | ✔          | ✔ (si `Activo = 1`)                            |
| `GET /api/contracts`                 | todos         | todos      | solo contratos con al menos un ticket asignado a él |
| `GET /api/contracts/{id}`            | ✔             | ✔          | solo si tiene tickets en ese contrato (`403` si no) |
| `GET /api/contracts/{id}/tickets`    | todos         | todos      | solo los tickets asignados a él                |
| `PATCH /api/tickets/{id}` (estatus)  | cualquier ticket | cualquier ticket | solo tickets asignados a él (`403` si no) |
| `POST /api/tickets/{id}/assign` (deseable) | ✔       | ✔          | ✘ (`403`)                                      |
| `GET /api/users` (deseable)          | ✔             | ✔          | ✘ (`403`)                                      |

Casos concretos que se probarán:

1. `tecnico01` con su token llama `PATCH /api/tickets/102` (asignado a tecnico02) → `403`.
2. `tecnico01` llama `GET /api/contracts/1/tickets` → solo los tickets 101 y 104 (no 102, 103, 105 ni 106).
   `tecnico01` llama `GET /api/contracts` → no aparece `CON-004`; llama `GET /api/contracts/4` → `403`.
3. `tecnico04` intenta login → rechazado.
4. Petición a `GET /api/contracts` sin header `Authorization` → `401`.
5. Petición con token manipulado o expirado → `401`.
6. `supervisor` llama `PATCH /api/tickets/104` (FINALIZADO) con `{ "estatus": "EN_PROCESO" }` → `409`.

---

## 10. Manejo de errores

Formato único para todos los errores:

```json
{ "error": "TICKET_NOT_FOUND", "message": "El ticket 999 no existe" }
```

| Código | Cuándo                                                                 |
|--------|------------------------------------------------------------------------|
| `400`  | Body inválido, campo faltante, valor fuera del catálogo                |
| `401`  | Sin token, token inválido/expirado, credenciales incorrectas          |
| `403`  | Autenticado pero sin permiso para esa acción o recurso                 |
| `404`  | Recurso inexistente                                                    |
| `409`  | Conflicto con el estado actual (ticket cerrado, transición inválida)  |
| `500`  | Error no controlado. **Nunca** exponer stack trace ni detalles de SQL  |

- Un error de conexión a la base de datos no debe tumbar el proceso: responde `500` y registra el error en consola/log.
- El frontend muestra `message` al usuario cuando aplique.

---

## 11. Alcance: obligatorio vs. deseable

Para 1:30 horas, esto es lo **obligatorio** (con esto se obtiene la calificación completa):

- [ ] `docker compose up -d --build` levanta `db`, `backend` y `frontend` sin pasos manuales.
- [ ] `POST /api/auth/login` con bcrypt y token; rechaza inactivos.
- [ ] `GET /api/contracts`, `GET /api/contracts/{id}`, `GET /api/contracts/{id}/tickets` con filtrado por rol.
- [ ] `PATCH /api/tickets/{id}` con reglas de negocio y permisos.
- [ ] Frontend React con Login, Dashboard y Detalle de contrato consumiendo la API (completar los `TODO (candidato)` de la plantilla).
- [ ] Manejo de errores con los códigos de la sección 10.
- [ ] Variables de entorno + `.env.example`.
- [ ] README según la sección 12, incluida la pregunta final.

**Deseable** (suma puntos en "Calidad del código" y "API REST", pero no es necesario):

- `GET /api/dashboard`, `POST /api/tickets/{id}/assign`, `GET /api/users`.
- Pruebas automatizadas (aunque sean dos o tres sobre login y permisos).
- TypeScript en el frontend.
- Documentación de la API (OpenAPI/Swagger, colección de Postman/Insomnia o archivo `.http`).
- Reintentos de conexión a la base al arrancar el backend.
- Paginación en tickets.

**Fuera de alcance** (no lo hagas, no suma): Kubernetes, nube, microservicios, Redis, colas,
CI/CD, Terraform, registro de usuarios, recuperación de contraseña, diseño visual elaborado.

---

## 12. Entrega

1. Sube tu código a un repositorio Git (GitHub, GitLab o Bitbucket) y comparte el enlace.
2. Haz commits conforme avances. El historial forma parte de la evaluación.
3. Anota en el README la hora de inicio y de fin. El historial de commits debe ser coherente con ellas.
4. Ejecuta `bash tests/smoke.sh` y pega el resumen final (`PASS: n FAIL: n`) en el README.
5. Tu `README.md` (reemplaza el de este repositorio) debe contener **exactamente** estas secciones:

```markdown
# Prueba Técnica – Sistema de Mantenimiento

## Tecnologías utilizadas
- Backend: <lenguaje + framework + versión>. Por qué lo elegí: ...
- Frontend: React <versión> + <Vite/Next/...>
- Base de datos: SQL Server 2022 (entregada)

## Requisitos
Docker y Docker Compose. (Si hace falta algo más, dilo aquí.)

## Ejecución
git clone <tu-repo>
cd prueba-tecnica
docker compose up -d --build

- Frontend: http://localhost:3000
- API:      http://localhost:8080/api
- (Opcional) cómo ejecutar backend y frontend sin Docker para desarrollo.

## Usuarios de prueba
Tabla con usuario / contraseña / rol.

## Endpoints
Lista de endpoints implementados con método, ruta, roles permitidos y un ejemplo.

## Arquitectura
Estructura de carpetas del backend y del frontend, y una explicación breve de cómo fluye una
petición (ej. ruta → middleware de auth → controlador → servicio → repositorio → SQL).
Cómo se validan los permisos por rol.

## Decisiones y supuestos
Todo lo que decidiste porque el enunciado no lo especificaba o porque lo cambiaste a propósito.

## Qué faltó
Si no terminaste algo, qué fue y cómo lo harías.

## Escalabilidad
Respuesta a la pregunta final.
```

---

## 13. Pregunta final

Responde en tu README, en la sección **Escalabilidad**, en no más de 300 palabras:

> Si este sistema tuviera que crecer de 100 a 100,000 contratos y de cientos a millones de
> tickets, con decenas de técnicos actualizando tickets al mismo tiempo, ¿qué partes de tu solución
> cambiarías y por qué? Considera base de datos, API, frontend y despliegue.

No hay una respuesta única. Se evalúa el criterio, no la cantidad de tecnologías mencionadas.

---

## 14. Criterios de evaluación

| Área                        | Puntos | Qué se revisa                                                                                   |
|-----------------------------|-------:|-------------------------------------------------------------------------------------------------|
| Docker / instalación        | 10     | `docker compose up -d --build` funciona a la primera; Dockerfiles razonables; variables de entorno |
| Modelo de datos y consultas | 10     | Consultas correctas, uso de JOIN, sin N+1, uso de `mantenimiento_app`, sin SQL injection        |
| API REST                    | 20     | Endpoints obligatorios completos, JSON consistente, códigos HTTP correctos, reglas de negocio    |
| Autenticación / seguridad   | 15     | bcrypt, token bien implementado, secreto en env, inactivos rechazados, sin datos sensibles en respuestas |
| Manejo de roles             | 10     | Validado en backend en todos los endpoints; los 6 casos de la sección 9 pasan                   |
| Frontend                    | 15     | Tres pantallas funcionales, rutas protegidas, estados de carga/error, capa de API centralizada  |
| Calidad del código          | 10     | Estructura clara, nombres claros, separación de responsabilidades, sin código muerto, commits significativos |
| Manejo de errores           | 5      | Formato único, sin stack traces, errores de BD controlados                                      |
| README / documentación      | 5      | Secciones completas, instrucciones que funcionan, pregunta final respondida con criterio        |
| **Total**                   | **100**|                                                                                                 |

Interpretación: 90–100 excelente · 80–89 muy bueno · 70–79 cumple · 60–69 junior/intermedio · < 60 no cumple.

---

## 15. Sugerencia de distribución del tiempo

| Tiempo      | Actividad                                                                                   |
|-------------|---------------------------------------------------------------------------------------------|
| 0:00 – 0:08 | Levantar la base, conectarte, revisar tablas y datos. Elegir stack. `npm install` en `frontend/`. |
| 0:08 – 0:55 | Backend: conexión a SQL Server, login con bcrypt + token, middleware de auth/roles, 3 GET, 1 PATCH |
| 0:55 – 1:10 | Frontend: completar los `TODO (candidato)` (contadores, acciones por rol, PATCH) y probar con los 3 roles |
| 1:10 – 1:22 | Dockerfile del backend, servicios en compose, probar `docker compose up -d --build` desde cero |
| 1:22 – 1:30 | README, pregunta final, último commit                                                        |

Consejo: haz un commit en cuanto el login funcione de punta a punta. Si te quedas sin tiempo, un
flujo completo y pequeño vale más que muchas piezas sueltas.

---

## 16. Referencia rápida: librerías por lenguaje

Solo orientativo; usa lo que prefieras. En [`docs/ejemplos/`](./docs/ejemplos/README.md) hay, para
Node, .NET, Python y PHP, el `Dockerfile`, la conexión a SQL Server, el login con bcrypt y JWT y el
middleware de roles listos para copiar.

| Lenguaje / Framework    | Driver SQL Server                         | bcrypt                         | JWT                          |
|-------------------------|-------------------------------------------|--------------------------------|------------------------------|
| Node.js (Express/NestJS)| `mssql` (tedious)                         | `bcryptjs` o `bcrypt`          | `jsonwebtoken`               |
| .NET 8                  | `Microsoft.Data.SqlClient` / EF Core      | `BCrypt.Net-Next`              | `Microsoft.AspNetCore.Authentication.JwtBearer` |
| PHP / Laravel           | `pdo_sqlsrv` (requiere ODBC Driver 18)    | `password_verify` (nativo)     | `firebase/php-jwt` o Sanctum |
| Python (FastAPI/Flask)  | `pyodbc` (ODBC Driver 18) o `pymssql`     | `bcrypt`                       | `PyJWT` / `python-jose`      |
| Java (Spring Boot)      | `mssql-jdbc`                              | `spring-security-crypto`       | `jjwt`                       |
| Go                      | `github.com/microsoft/go-mssqldb`         | `golang.org/x/crypto/bcrypt`   | `github.com/golang-jwt/jwt`  |
| Rust                    | `tiberius`                                | `bcrypt`                       | `jsonwebtoken`               |

Notas:

- Los hashes tienen prefijo `$2a$`. Todas las librerías de arriba lo aceptan.
- En la imagen Docker del backend, los drivers ODBC (PHP, Python) requieren instalar
  `msodbcsql18` en el Dockerfile. Si eliges esos lenguajes, reserva tiempo para ello o usa un driver
  puro (`pymssql`, por ejemplo).
- Verifica el hash manualmente si tu login no funciona: `bcrypt.compare("Admin2026!", hashDeLaBase)` debe devolver `true`.

---

## 17. Checklist antes de entregar

- [ ] `docker compose down -v && docker compose up -d --build` funciona desde cero en menos de 5 minutos.
- [ ] `bash tests/smoke.sh` termina con `FAIL: 0`.
- [ ] Puedo iniciar sesión con `administrador`, `supervisor` y `tecnico01`; `tecnico04` es rechazado.
- [ ] El dashboard muestra 3 / 6 / 3 para `supervisor`.
- [ ] `tecnico01` no ve `CON-004`, solo ve sus tickets y no puede modificar el ticket 102.
- [ ] `PATCH /api/tickets/104` responde `409`.
- [ ] Una petición sin token responde `401`.
- [ ] Ningún secreto está escrito en el código; existe `.env.example`.
- [ ] El README tiene todas las secciones de la sección 12 y responde la pregunta final.
- [ ] El repositorio no incluye `node_modules`, `vendor`, `bin/obj`, `.env` ni archivos de IDE.
