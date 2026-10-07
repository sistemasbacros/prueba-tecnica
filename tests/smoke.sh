#!/usr/bin/env bash
# =====================================================================
# Prueba Técnica - Sistema de Mantenimiento
# tests/smoke.sh : verificación automática de la API
#
# Lo usa el candidato para autoevaluarse y el evaluador para calificar.
# Solo necesita bash y curl (en Windows: Git Bash).
#
# Uso:
#   bash tests/smoke.sh                       # API en http://localhost:8080/api
#   API_URL=http://localhost:3001/api bash tests/smoke.sh
#   bash tests/smoke.sh --no-write            # omite los casos que modifican datos
#
# Los casos de escritura (W1-W3) cambian el ticket 107. Para restaurar los datos:
#   docker compose down -v && docker compose up -d
# =====================================================================

API_URL="${API_URL:-http://localhost:8080/api}"
API_URL="${API_URL%/}"
NO_WRITE=0
[ "${1:-}" = "--no-write" ] && NO_WRITE=1

PASS=0; FAIL=0
STATUS=""; BODY=""

# ---- helpers ---------------------------------------------------------
call() { # call METHOD PATH [TOKEN] [JSON_BODY]
  local method="$1" path="$2" token="${3:-}" data="${4:-}"
  local args=(-s -o /tmp/smoke_body.$$ -w '%{http_code}' -X "$method" -H 'Accept: application/json')
  [ -n "$token" ] && args+=(-H "Authorization: Bearer $token")
  [ -n "$data" ]  && args+=(-H 'Content-Type: application/json' --data "$data")
  STATUS=$(curl "${args[@]}" "$API_URL$path" 2>/dev/null || echo "000")
  BODY=$(cat /tmp/smoke_body.$$ 2>/dev/null); rm -f /tmp/smoke_body.$$
}

token_of() { # token_of USERNAME PASSWORD -> imprime el token o vacío
  call POST /auth/login "" "{\"username\":\"$1\",\"password\":\"$2\"}"
  printf '%s' "$BODY" | tr -d '\n ' | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4
}

check() { # check ID "descripción" EXPECTED_STATUS [BODY_MUST_CONTAIN] [BODY_MUST_NOT_CONTAIN]
  local id="$1" desc="$2" expected="$3" must="${4:-}" mustnot="${5:-}" ok=1 why=""
  [ "$STATUS" = "$expected" ] || { ok=0; why="esperado $expected, obtenido $STATUS"; }
  if [ -n "$must" ] && ! printf '%s' "$BODY" | grep -q -- "$must"; then ok=0; why="${why:+$why; }falta '$must' en la respuesta"; fi
  if [ -n "$mustnot" ] && printf '%s' "$BODY" | grep -q -- "$mustnot"; then ok=0; why="${why:+$why; }la respuesta contiene '$mustnot'"; fi
  if [ $ok = 1 ]; then PASS=$((PASS+1)); printf '  PASS  %-4s %s\n' "$id" "$desc"
  else FAIL=$((FAIL+1)); printf '  FAIL  %-4s %s  [%s]\n' "$id" "$desc" "$why"; fi
}

echo "API: $API_URL"
echo

# ---- 1. Autenticación -----------------------------------------------
echo "1. Autenticación"
call POST /auth/login "" '{"username":"administrador","password":"Admin2026!"}'
check A1 "login administrador" 200 '"role":"ADMINISTRADOR"'
call POST /auth/login "" '{"username":"supervisor","password":"Supervisor2026!"}'
check A2 "login supervisor devuelve token y user" 200 '"token"'
call POST /auth/login "" '{"username":"tecnico01","password":"Tecnico2026!"}'
check A3 "login tecnico01" 200 '"role":"TECNICO"'
call POST /auth/login "" '{"username":"tecnico04","password":"Tecnico2026!"}'
check A4 "usuario inactivo (tecnico04) rechazado" 401
call POST /auth/login "" '{"username":"supervisor","password":"incorrecta"}'
check A5 "contraseña incorrecta" 401
call POST /auth/login "" '{"username":"supervisor"}'
check A6 "body incompleto" 400
call POST /auth/login "" "{\"username\":\"' OR 1=1 --\",\"password\":\"x\"}"
if [ "$STATUS" = "401" ] || [ "$STATUS" = "400" ]; then STATUS=401; fi
check A7 "intento de inyección SQL en login no entra" 401
call POST /auth/login "" '{"username":"supervisor","password":"Supervisor2026!"}'
check A8 "el login no expone passwordHash" 200 "" "asswordHash"

ADMIN=$(token_of administrador 'Admin2026!')
SUP=$(token_of supervisor 'Supervisor2026!')
T1=$(token_of tecnico01 'Tecnico2026!')
T2=$(token_of tecnico02 'Tecnico2026!')
if [ -z "$SUP" ] || [ -z "$T1" ] || [ -z "$T2" ]; then
  echo; echo "No se pudo obtener token. Revisa el login antes de continuar."; echo
fi

# ---- 2. Protección de endpoints -------------------------------------
echo; echo "2. Protección de endpoints"
call GET /contracts
check P1 "GET /contracts sin token" 401
call GET /contracts "token.invalido.xyz"
check P2 "GET /contracts con token inválido" 401

# ---- 3. Contratos ----------------------------------------------------
echo; echo "3. Contratos"
call GET /contracts "$SUP"
check C1 "supervisor ve todos los contratos (incluye CON-004)" 200 'CON-004'
call GET /contracts "$ADMIN"
check C2 "administrador ve CON-003 (finalizado)" 200 'CON-003'
call GET /contracts "$T1"
check C3 "tecnico01 NO ve CON-004 (no tiene tickets ahí)" 200 'CON-001' 'CON-004'
call GET /contracts "$T2"
check C4 "tecnico02 sí ve CON-004" 200 'CON-004'
call GET /contracts/4 "$T1"
check C5 "tecnico01 GET /contracts/4 -> 403" 403
call GET /contracts/999 "$SUP"
check C6 "contrato inexistente -> 404" 404
call GET /contracts/1 "$SUP"
check C7 "detalle incluye responsable" 200 '"responsable"'

# ---- 4. Tickets ------------------------------------------------------
echo; echo "4. Tickets"
call GET /contracts/1/tickets "$SUP"
check T1a "supervisor ve el ticket 103 (sin asignar)" 200 '"id":103'
call GET /contracts/1/tickets "$T1"
check T1b "tecnico01 ve su ticket 101" 200 '"id":101'
check T1c "tecnico01 NO ve el ticket 102 (de tecnico02)" 200 '' '"id":102'
call GET /contracts/1/tickets "$SUP"
check T1d "usuarioAsignado null para tickets sin asignar" 200 '"usuarioAsignado":null'
check T1e "los tickets no exponen passwordHash" 200 '' 'asswordHash'

# ---- 5. Reglas del PATCH (sin modificar datos) -----------------------
echo; echo "5. PATCH /tickets/{id}: permisos y reglas (sin cambios en datos)"
call PATCH /tickets/102 "$T1" '{"estatus":"EN_PROCESO"}'
check R1 "tecnico01 modifica ticket ajeno (102) -> 403" 403
call PATCH /tickets/104 "$SUP" '{"estatus":"EN_PROCESO"}'
check R2 "ticket FINALIZADO (104) -> 409" 409
call PATCH /tickets/111 "$SUP" '{"estatus":"EN_PROCESO"}'
check R3 "ticket CANCELADO (111) -> 409" 409
call PATCH /tickets/101 "$SUP" '{"estatus":"INVENTADO"}'
check R4 "estatus fuera de catálogo -> 400" 400
call PATCH /tickets/101 "$SUP" '{"estatus":"FINALIZADO"}'
check R5 "ASIGNADO -> FINALIZADO (salto no permitido) -> 409" 409
call PATCH /tickets/999 "$SUP" '{"estatus":"EN_PROCESO"}'
check R6 "ticket inexistente -> 404" 404
call PATCH /tickets/101 "" '{"estatus":"EN_PROCESO"}'
check R7 "PATCH sin token -> 401" 401

# ---- 6. Escritura real (modifica el ticket 107) ----------------------
if [ $NO_WRITE = 1 ]; then
  echo; echo "6. Escritura: omitida (--no-write)"
else
  echo; echo "6. Escritura real sobre el ticket 107 (tecnico02). Restaurar con: docker compose down -v && docker compose up -d"
  call PATCH /tickets/107 "$T2" '{"estatus":"EN_PROCESO"}'
  check W1 "tecnico02 ASIGNADO -> EN_PROCESO en su ticket" 200 '"estatus":"EN_PROCESO"'
  call PATCH /tickets/107 "$T2" '{"estatus":"FINALIZADO"}'
  check W2 "tecnico02 EN_PROCESO -> FINALIZADO" 200 '"estatus":"FINALIZADO"'
  call PATCH /tickets/107 "$T2" '{"estatus":"EN_PROCESO"}'
  check W3 "ticket ya FINALIZADO no se reabre -> 409" 409
fi

# ---- 7. Deseables (no restan si no existen) --------------------------
echo; echo "7. Endpoints deseables (informativo)"
call GET /dashboard "$SUP"
if [ "$STATUS" = "200" ]; then check D1 "GET /dashboard (supervisor: 3 activos, 6 pendientes, 3 en proceso)" 200 '"ticketsPendientes":6'; else echo "  SKIP  D1   GET /dashboard no implementado ($STATUS)"; fi
call GET "/users?rol=TECNICO" "$T1"
if [ "$STATUS" != "404" ]; then check D2 "GET /users prohibido para técnico -> 403" 403; else echo "  SKIP  D2   GET /users no implementado"; fi
call GET "/users?rol=TECNICO" "$SUP"
if [ "$STATUS" = "200" ]; then check D3 "GET /users no expone passwordHash ni inactivos" 200 'tecnico01' 'tecnico04'; else echo "  SKIP  D3   GET /users no implementado ($STATUS)"; fi
call POST /tickets/103/assign "$T1" '{"idUsuario":4}'
if [ "$STATUS" != "404" ]; then check D4 "assign prohibido para técnico -> 403" 403; else echo "  SKIP  D4   POST /tickets/{id}/assign no implementado"; fi

# ---- Resumen ---------------------------------------------------------
echo
echo "=============================="
echo "  PASS: $PASS   FAIL: $FAIL"
echo "=============================="
[ $FAIL = 0 ]
