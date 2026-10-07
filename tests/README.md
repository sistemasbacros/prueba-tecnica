# Verificación de la API

Dos herramientas para comprobar que tu backend cumple el contrato. **El evaluador usa exactamente
este script para calificar**, así que si pasa aquí, pasa en la evaluación.

## `smoke.sh` (automático)

Requiere `bash` y `curl`. En Windows usa Git Bash.

```bash
docker compose up -d --build            # o tu backend corriendo donde sea
bash tests/smoke.sh                     # API en http://localhost:8080/api
API_URL=http://localhost:3001/api bash tests/smoke.sh
bash tests/smoke.sh --no-write          # omite los 3 casos que modifican el ticket 107
```

Salida esperada:

```
1. Autenticación
  PASS  A1   login administrador
  PASS  A2   login supervisor devuelve token y user
  ...
==============================
  PASS: 32   FAIL: 0
==============================
```

Con solo los endpoints obligatorios se obtienen 32 PASS y 4 SKIP. Con los deseables implementados, 36 PASS.

Los casos **W1 a W3** modifican el ticket 107 (ASIGNADO → EN_PROCESO → FINALIZADO). Para volver al
estado inicial:

```bash
docker compose down -v && docker compose up -d
```

Los casos de la sección 7 (dashboard, users, assign) son **deseables**: si no existen se marcan
`SKIP` y no cuentan como fallo.

## `api.http` (manual)

Peticiones listas para la extensión **REST Client** de VS Code. Ejecuta los login, pega los tokens
en las variables de la cabecera y lanza el resto. También se pueden importar en Postman o Insomnia.

## Qué cubre

| Sección | Casos | Qué demuestra |
|---------|-------|---------------|
| 1 | A1–A8 | bcrypt, usuario inactivo, 400 vs 401, inyección SQL, no se expone `passwordHash` |
| 2 | P1–P2 | todos los endpoints exigen token válido |
| 3 | C1–C7 | filtrado de contratos por rol, 403 y 404 correctos |
| 4 | T1a–T1e | filtrado de tickets por rol, `usuarioAsignado: null` |
| 5 | R1–R7 | permisos y reglas de transición del PATCH sin tocar datos |
| 6 | W1–W3 | el PATCH escribe de verdad y respeta el ciclo de vida |
| 7 | D1–D4 | endpoints deseables, solo si existen |
