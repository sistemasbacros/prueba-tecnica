# Prueba Técnica – Sistema de Mantenimiento

Repositorio base para la prueba técnica de desarrollo Full Stack (**duración: 1:30 horas**).

Este repositorio contiene:

- **La base de datos lista para usar:** SQL Server 2022 en Docker, con esquema y datos iniciales que se
  cargan automáticamente.
- **Una plantilla de frontend en React** (`frontend/`) con login, rutas, cliente HTTP y componentes,
  para que no empieces desde cero.
- **El enunciado completo** en [`PRUEBA_TECNICA.md`](./PRUEBA_TECNICA.md). Léelo antes de empezar.
- **Una guía visual** en [`docs/guia-candidato.html`](./docs/guia-candidato.html) con el mapa conceptual de la
  arquitectura y qué archivos se modifican. Ábrela en el navegador.

Tú debes desarrollar la **API REST** (lenguaje libre), completar el **frontend** y dejar todo corriendo
en **tres contenedores** (`db`, `backend`, `frontend`) con `docker compose`.

---

## Requisitos

- Docker Desktop (o Docker Engine) con Docker Compose v2.
- Node.js 20+ si quieres ejecutar el frontend fuera de Docker durante el desarrollo.
- El runtime de tu backend (Node, .NET, PHP, Python, etc.) si lo desarrollas fuera de Docker.

## Levantar la base de datos

```bash
git clone https://github.com/sistemasbacros/prueba-tecnica.git
cd prueba-tecnica
docker compose up -d
```

La primera vez se descarga la imagen de SQL Server (≈ 1.5 GB). Al terminar:

```bash
docker compose ps
# mantenimiento-db        Up (healthy)
# mantenimiento-db-init   Exited (0)        <- normal: ejecuta los scripts y termina

docker compose logs db-init
# ==> Ejecutando /init/01-schema.sql
# ==> Ejecutando /init/02-seed.sql
# ==> Base de datos inicializada correctamente
```

Consulta rápida para comprobar los datos:

```bash
docker exec -it mantenimiento-db /opt/mssql-tools18/bin/sqlcmd \
  -S localhost -U mantenimiento_app -P 'App2026!Mant' -d MantenimientoDB -C \
  -Q "SELECT (SELECT COUNT(*) FROM dbo.Usuarios) AS Usuarios, (SELECT COUNT(*) FROM dbo.Contratos) AS Contratos, (SELECT COUNT(*) FROM dbo.Tickets) AS Tickets"
```

Resultado esperado: 6 usuarios, 3 contratos, 15 tickets.

> En Windows con Git Bash, antepón `MSYS_NO_PATHCONV=1` al comando anterior para que no convierta la
> ruta `/opt/...`.

## Estructura del repositorio

```
.
├── docker-compose.yml        # Servicio `db` (SQL Server) + `db-init`. Aquí agregas `backend` y `frontend`.
├── .env.example              # Variables de configuración (copiar a .env solo si quieres cambiar algo)
├── .gitignore / .gitattributes
├── db/
│   └── init/
│       ├── 01-schema.sql     # Base MantenimientoDB, login mantenimiento_app, tablas, índices
│       └── 02-seed.sql       # Datos iniciales (usuarios, contratos, tickets)
├── backend/                  # <- tu API REST (ver backend/README.md)
├── frontend/                 # <- plantilla React (ver frontend/README.md)
├── README.md                 # este archivo (lo reemplazas con el tuyo al entregar)
└── PRUEBA_TECNICA.md         # enunciado completo
```

## Conexión a la base de datos

| Parámetro      | Valor                                                                 |
|----------------|-----------------------------------------------------------------------|
| Host           | `localhost` desde tu máquina · `db` desde otro contenedor del compose |
| Puerto         | `1433`                                                                |
| Base de datos  | `MantenimientoDB`                                                     |
| Usuario de app | `mantenimiento_app` / `App2026!Mant` (**úsalo en tu backend**)        |
| Usuario admin  | `sa` / `Bacros2026!Sql` (solo administración, no lo uses en la API)   |
| Cifrado        | Certificado autofirmado → `TrustServerCertificate=True`               |

Cadena de conexión de ejemplo:

```
Server=db,1433;Database=MantenimientoDB;User Id=mantenimiento_app;Password=App2026!Mant;TrustServerCertificate=True;
```

Los valores por defecto se pueden cambiar creando un `.env` a partir de `.env.example`.

## Usuarios de prueba (login de la aplicación)

Las contraseñas están almacenadas como hash **bcrypt** (`$2a$`, cost 10) en la columna `PasswordHash`.

| Usuario         | Contraseña        | Rol           | Activo |
|-----------------|-------------------|---------------|--------|
| `administrador` | `Admin2026!`      | ADMINISTRADOR | Sí     |
| `supervisor`    | `Supervisor2026!` | SUPERVISOR    | Sí     |
| `tecnico01`     | `Tecnico2026!`    | TECNICO       | Sí     |
| `tecnico02`     | `Tecnico2026!`    | TECNICO       | Sí     |
| `tecnico03`     | `Tecnico2026!`    | TECNICO       | Sí     |
| `tecnico04`     | `Tecnico2026!`    | TECNICO       | **No** (el login debe rechazarlo) |

## Comandos útiles

```bash
docker compose up -d                 # levantar
docker compose logs -f db            # ver logs de SQL Server
docker compose down                  # detener (los datos se conservan en el volumen)
docker compose down -v               # detener y BORRAR los datos (reinicio limpio)
docker compose up -d --build         # cuando ya tengas backend y frontend en el compose
```

Los scripts de `db/init/` son idempotentes: si vuelves a ejecutar `db-init` no se duplican datos.
Para reiniciar desde cero usa `docker compose down -v`.

## Solución de problemas

| Síntoma | Causa / solución |
|---------|------------------|
| `port is already allocated` en 1433 | Otro SQL Server (local o en Docker) usa el puerto. Crea `.env` con `DB_PORT=1434` y conéctate a `localhost,1434`. |
| `db` queda `unhealthy` o reinicia | Memoria insuficiente: SQL Server necesita ≥ 2 GB asignados a Docker. En Docker Desktop: Settings → Resources. |
| `db-init` termina con error de login | La contraseña de `sa` cambió después de crear el volumen. Ejecuta `docker compose down -v` y vuelve a levantar. |
| `all predefined address pools have been fully subnetted` | Demasiadas redes de Docker en tu máquina. Ejecuta `docker network prune` (solo elimina redes sin usar) o define una subred en el compose. |
| Mac con Apple Silicon (M1/M2/M3) | La imagen `mssql/server:2022` es amd64. Activa Rosetta en Docker Desktop (Settings → General → "Use Rosetta") o agrega `platform: linux/amd64` al servicio `db`. |
| Tu backend no conecta desde su contenedor | Usa el host `db`, no `localhost`. Agrega `TrustServerCertificate=True`. Espera al healthcheck con `depends_on: condition: service_healthy`. |
| El frontend en Docker llama a la API y falla | El navegador no resuelve `backend`; la URL de la API debe ser `http://localhost:<puerto>` (o usa el proxy de nginx incluido en `frontend/nginx.conf`). Revisa CORS en tu backend. |
| El login dice que la contraseña es incorrecta con los datos correctos | Verifica que tu librería bcrypt acepta el prefijo `$2a$` y que comparas contra `PasswordHash` sin recortar ni re-hashear. |
