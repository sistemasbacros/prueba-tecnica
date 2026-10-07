# Node.js + Express

```bash
cd backend
npm init -y
npm install express mssql bcryptjs jsonwebtoken cors dotenv
```

## Conexión (`src/db.js`)

```js
const sql = require('mssql');

const pool = new sql.ConnectionPool({
  server: process.env.DB_HOST,            // "db" en Docker, "localhost" en desarrollo
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: { encrypt: true, trustServerCertificate: true },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
});

const poolConnect = pool.connect();

// Consulta parametrizada: NUNCA concatenes valores en el SQL
async function query(text, params = {}) {
  await poolConnect;
  const req = pool.request();
  for (const [name, value] of Object.entries(params)) req.input(name, value);
  const result = await req.query(text);
  return result.recordset;
}

module.exports = { query, sql };
```

Ejemplo de uso:

```js
const rows = await query(
  'SELECT IdUsuario, NombreUsuario, PasswordHash, Rol, Activo FROM dbo.Usuarios WHERE NombreUsuario = @username',
  { username },
);
```

## Login (fragmento)

```js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const user = rows[0];
if (!user || !user.Activo || !(await bcrypt.compare(password, user.PasswordHash))) {
  return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Usuario o contraseña incorrectos' });
}
const token = jwt.sign(
  { sub: user.IdUsuario, username: user.NombreUsuario, role: user.Rol },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN || '8h' },
);
res.json({ token, user: { id: user.IdUsuario, username: user.NombreUsuario, role: user.Rol } });
```

## Middleware de autenticación y roles

```js
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token requerido' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { sub, username, role }
    next();
  } catch {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token inválido o expirado' });
  }
}

const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'FORBIDDEN', message: 'Sin permiso' });

// app.get('/api/users', auth, allow('ADMINISTRADOR', 'SUPERVISOR'), handler);
```

## Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 8080
CMD ["node", "src/index.js"]
```

`.dockerignore`:

```
node_modules
.env
```
