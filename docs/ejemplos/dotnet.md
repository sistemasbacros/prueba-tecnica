# .NET 8 (Minimal API o Web API)

```bash
cd backend
dotnet new webapi -n Mantenimiento.Api -o . --no-https
dotnet add package Microsoft.Data.SqlClient
dotnet add package BCrypt.Net-Next
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

## Cadena de conexión

```csharp
var cs = $"Server={Env("DB_HOST")},{Env("DB_PORT", "1433")};Database={Env("DB_NAME")};" +
         $"User Id={Env("DB_USER")};Password={Env("DB_PASSWORD")};TrustServerCertificate=True;Encrypt=True;";

static string Env(string key, string? fallback = null) =>
    Environment.GetEnvironmentVariable(key) ?? fallback ?? throw new InvalidOperationException($"Falta {key}");
```

Consulta parametrizada con `Microsoft.Data.SqlClient` (sin ORM):

```csharp
await using var conn = new SqlConnection(cs);
await conn.OpenAsync();
await using var cmd = new SqlCommand(
    "SELECT IdUsuario, NombreUsuario, PasswordHash, Rol, Activo FROM dbo.Usuarios WHERE NombreUsuario = @username", conn);
cmd.Parameters.AddWithValue("@username", username);
await using var reader = await cmd.ExecuteReaderAsync();
```

Si prefieres EF Core: `dotnet add package Microsoft.EntityFrameworkCore.SqlServer` y
`options.UseSqlServer(cs)`. Con 3 tablas y 1:30 horas, SqlClient o Dapper suele ser más rápido.

## Login y JWT (fragmento)

```csharp
if (user is null || !user.Activo || !BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
    return Results.Json(new { error = "INVALID_CREDENTIALS", message = "Usuario o contraseña incorrectos" }, statusCode: 401);

var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Env("JWT_SECRET")));
var token = new JwtSecurityToken(
    claims: new[] {
        new Claim(JwtRegisteredClaimNames.Sub, user.IdUsuario.ToString()),
        new Claim("username", user.NombreUsuario),
        new Claim(ClaimTypes.Role, user.Rol),
    },
    expires: DateTime.UtcNow.AddHours(8),
    signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

return Results.Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token),
                        user = new { id = user.IdUsuario, username = user.NombreUsuario, role = user.Rol } });
```

Registro de autenticación y roles:

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(o =>
    o.TokenValidationParameters = new TokenValidationParameters {
        ValidateIssuer = false, ValidateAudience = false,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Env("JWT_SECRET"))),
    });
builder.Services.AddAuthorization();
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p.WithOrigins(Env("CORS_ORIGIN", "http://localhost:3000")).AllowAnyHeader().AllowAnyMethod()));

// app.MapGet("/api/users", ...).RequireAuthorization(p => p.RequireRole("ADMINISTRADOR", "SUPERVISOR"));
```

## Dockerfile

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY *.csproj ./
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
USER app
EXPOSE 8080
ENTRYPOINT ["dotnet", "Mantenimiento.Api.dll"]
```

`.dockerignore`:

```
bin
obj
.env
```
