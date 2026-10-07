# Python + FastAPI

Se recomienda `pymssql` porque no necesita instalar el driver ODBC en la imagen. Si prefieres
`pyodbc`, al final hay el bloque de Dockerfile que instala `msodbcsql18`.

`requirements.txt`:

```
fastapi==0.115.*
uvicorn[standard]==0.30.*
pymssql==2.3.*
bcrypt==4.2.*
PyJWT==2.9.*
python-dotenv==1.0.*
```

## Conexión (`app/db.py`)

```python
import os
import pymssql

def get_conn():
    return pymssql.connect(
        server=os.environ["DB_HOST"],          # "db" en Docker, "localhost" en desarrollo
        port=int(os.environ.get("DB_PORT", 1433)),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.environ["DB_NAME"],
        as_dict=True,
    )

def query(sql: str, params: tuple = ()):
    # Consulta parametrizada con %s: NUNCA formatees valores dentro del SQL
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            return cur.fetchall()

# query("SELECT IdUsuario, NombreUsuario, PasswordHash, Rol, Activo FROM dbo.Usuarios WHERE NombreUsuario = %s", (username,))
```

## Login y JWT (fragmento)

```python
import bcrypt, jwt, os
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException

user = rows[0] if rows else None
if not user or not user["Activo"] or not bcrypt.checkpw(password.encode(), user["PasswordHash"].encode()):
    raise HTTPException(401, {"error": "INVALID_CREDENTIALS", "message": "Usuario o contraseña incorrectos"})

token = jwt.encode(
    {"sub": str(user["IdUsuario"]), "username": user["NombreUsuario"], "role": user["Rol"],
     "exp": datetime.now(timezone.utc) + timedelta(hours=8)},
    os.environ["JWT_SECRET"], algorithm="HS256",
)
return {"token": token, "user": {"id": user["IdUsuario"], "username": user["NombreUsuario"], "role": user["Rol"]}}
```

## Dependencia de autenticación y roles

```python
from fastapi import Depends, Header, HTTPException

def current_user(authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Token requerido"})
    try:
        return jwt.decode(authorization[7:], os.environ["JWT_SECRET"], algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, {"error": "UNAUTHORIZED", "message": "Token inválido o expirado"})

def require_roles(*roles):
    def dep(user=Depends(current_user)):
        if user["role"] not in roles:
            raise HTTPException(403, {"error": "FORBIDDEN", "message": "Sin permiso"})
        return user
    return dep

# @app.get("/api/users", dependencies=[Depends(require_roles("ADMINISTRADOR", "SUPERVISOR"))])
```

Para que los errores salgan con el formato `{ "error", "message" }` en lugar de `{ "detail": ... }`,
registra un `exception_handler` para `HTTPException` que devuelva `exc.detail` directamente.

## Dockerfile (pymssql)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -m appuser
USER appuser
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

## Alternativa con pyodbc

Cadena: `DRIVER={ODBC Driver 18 for SQL Server};SERVER=db,1433;DATABASE=MantenimientoDB;UID=mantenimiento_app;PWD=App2026!Mant;TrustServerCertificate=yes;`

Agrega al Dockerfile, antes de `pip install`:

```dockerfile
RUN apt-get update && apt-get install -y --no-install-recommends curl gnupg2 unixodbc-dev \
 && curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql.list \
 && apt-get update && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
 && rm -rf /var/lib/apt/lists/*
```
