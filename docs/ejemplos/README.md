# Ejemplos por stack

Fragmentos listos para copiar y no perder tiempo en lo que no se evalúa: la conexión a SQL Server
desde un contenedor, el `Dockerfile` del backend y el servicio en `docker-compose.yml`.

Son **orientativos**. Puedes usar otro lenguaje, otro framework u otra forma de organizar el código.

| Stack | Archivo | Driver SQL Server | bcrypt | JWT |
|-------|---------|-------------------|--------|-----|
| Node.js (Express) | [node.md](./node.md) | `mssql` | `bcryptjs` | `jsonwebtoken` |
| .NET 8 (Minimal API) | [dotnet.md](./dotnet.md) | `Microsoft.Data.SqlClient` | `BCrypt.Net-Next` | `Microsoft.AspNetCore.Authentication.JwtBearer` |
| Python (FastAPI) | [python.md](./python.md) | `pymssql` | `bcrypt` | `PyJWT` |
| PHP (Laravel) | [php.md](./php.md) | `pdo_sqlsrv` + ODBC 18 | `password_verify` | `firebase/php-jwt` |

Todos los ejemplos usan las mismas variables de entorno, que debes declarar en `backend/.env.example`:

```env
DB_HOST=db
DB_PORT=1433
DB_NAME=MantenimientoDB
DB_USER=mantenimiento_app
DB_PASSWORD=App2026!Mant
JWT_SECRET=cambia-este-secreto
JWT_EXPIRES_IN=8h
PORT=8080
CORS_ORIGIN=http://localhost:3000
```

Y el mismo servicio en `docker-compose.yml`:

```yaml
  backend:
    build: ./backend
    container_name: mantenimiento-backend
    env_file: ./backend/.env.example      # o environment: con cada variable
    ports:
      - "8080:8080"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped
```

Recordatorios comunes a todos los stacks:

- Desde el contenedor el host es `db`; desde tu máquina es `localhost`.
- SQL Server usa certificado autofirmado: siempre `TrustServerCertificate=True` (o equivalente).
- Los hashes son bcrypt con prefijo `$2a$`. Todas las librerías de la tabla lo aceptan.
- Aunque uses `depends_on` con healthcheck, reintenta la conexión al arrancar (2 o 3 intentos).
