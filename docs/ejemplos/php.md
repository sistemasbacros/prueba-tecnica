# PHP + Laravel

El driver `pdo_sqlsrv` necesita el ODBC Driver 18 de Microsoft dentro de la imagen. El Dockerfile de
abajo ya lo instala; copiarlo tal cual te ahorra el paso más lento de este stack.

```bash
cd backend
composer create-project laravel/laravel . --no-interaction
composer require firebase/php-jwt
```

## Conexión (`config/database.php` + `.env`)

`.env` del backend:

```env
DB_CONNECTION=sqlsrv
DB_HOST=db
DB_PORT=1433
DB_DATABASE=MantenimientoDB
DB_USERNAME=mantenimiento_app
DB_PASSWORD=App2026!Mant
JWT_SECRET=cambia-este-secreto
```

En `config/database.php`, dentro de `'sqlsrv'`:

```php
'sqlsrv' => [
    'driver'   => 'sqlsrv',
    'host'     => env('DB_HOST', 'localhost'),
    'port'     => env('DB_PORT', '1433'),
    'database' => env('DB_DATABASE'),
    'username' => env('DB_USERNAME'),
    'password' => env('DB_PASSWORD'),
    'charset'  => 'utf8',
    'prefix'   => '',
    'encrypt'  => 'yes',
    'trust_server_certificate' => true,
],
```

Consulta parametrizada (Query Builder ya la parametriza; si usas SQL crudo, usa bindings):

```php
$user = DB::selectOne(
    'SELECT IdUsuario, NombreUsuario, PasswordHash, Rol, Activo FROM dbo.Usuarios WHERE NombreUsuario = ?',
    [$username],
);
```

## Login y JWT (fragmento)

```php
use Firebase\JWT\JWT;

if (!$user || !$user->Activo || !password_verify($password, $user->PasswordHash)) {
    return response()->json(['error' => 'INVALID_CREDENTIALS', 'message' => 'Usuario o contraseña incorrectos'], 401);
}

$token = JWT::encode([
    'sub' => $user->IdUsuario, 'username' => $user->NombreUsuario, 'role' => $user->Rol,
    'exp' => time() + 8 * 3600,
], env('JWT_SECRET'), 'HS256');

return response()->json([
    'token' => $token,
    'user'  => ['id' => $user->IdUsuario, 'username' => $user->NombreUsuario, 'role' => $user->Rol],
]);
```

`password_verify` acepta hashes `$2a$` sin configuración adicional.

## Middleware de autenticación y roles

```php
// app/Http/Middleware/JwtAuth.php
public function handle(Request $request, Closure $next, ...$roles)
{
    $header = $request->header('Authorization', '');
    if (!str_starts_with($header, 'Bearer ')) {
        return response()->json(['error' => 'UNAUTHORIZED', 'message' => 'Token requerido'], 401);
    }
    try {
        $payload = JWT::decode(substr($header, 7), new Key(env('JWT_SECRET'), 'HS256'));
    } catch (\Throwable) {
        return response()->json(['error' => 'UNAUTHORIZED', 'message' => 'Token inválido o expirado'], 401);
    }
    if ($roles && !in_array($payload->role, $roles, true)) {
        return response()->json(['error' => 'FORBIDDEN', 'message' => 'Sin permiso'], 403);
    }
    $request->attributes->set('user', $payload);
    return $next($request);
}

// routes/api.php
// Route::get('/users', ...)->middleware('jwt:ADMINISTRADOR,SUPERVISOR');
```

## Dockerfile

```dockerfile
FROM php:8.3-cli

RUN apt-get update && apt-get install -y --no-install-recommends curl gnupg2 unzip git unixodbc-dev \
 && curl -sSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql.list \
 && apt-get update && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
 && pecl install sqlsrv pdo_sqlsrv \
 && docker-php-ext-enable sqlsrv pdo_sqlsrv \
 && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-interaction --prefer-dist
COPY . .
RUN composer dump-autoload --optimize

EXPOSE 8080
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8080"]
```

`php artisan serve` es suficiente para la prueba. Para algo más cercano a producción usa
`php-fpm` + nginx, pero no se evalúa.

`.dockerignore`:

```
vendor
.env
storage/logs
```
