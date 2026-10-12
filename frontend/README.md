# Frontend – plantilla JavaScript vanilla (sin framework)

Plantilla inicial para que no empieces desde cero. **No tiene dependencias, ni `npm install`, ni paso
de build:** son módulos ES nativos (`<script type="module">`) servidos como archivos estáticos.

Puedes modificar cualquier archivo, cambiar los estilos o agregar un bundler si lo prefieres.

## Ejecutar en desarrollo

Cualquier servidor de archivos estáticos sirve. Por ejemplo:

```bash
cd frontend
npx serve -l 3000 .            # Node
# o:  python -m http.server 3000
# o:  la extensión "Live Server" de VS Code
```

Abre http://localhost:3000. La URL de la API se lee de `config.js` (por defecto
`http://localhost:8080/api`); edítala ahí si tu backend corre en otro puerto. No abras `index.html`
con doble clic (`file://`): los módulos ES requieren un servidor HTTP.

> Como no hay build, la API debe permitir CORS desde el origen del frontend (`http://localhost:3000`).

## Compilar imagen Docker

```bash
docker build -t mantenimiento-frontend .
docker run -p 3000:80 -e API_URL=http://localhost:8080/api mantenimiento-frontend
```

Como no hay build, `config.js` se regenera
**al arrancar el contenedor** a partir de la variable de entorno `API_URL`
(`docker-entrypoint.d/40-app-config.sh`). Servicio para `docker-compose.yml`:

```yaml
  frontend:
    build: ./frontend
    container_name: mantenimiento-frontend
    environment:
      API_URL: http://localhost:8080/api   # la URL que usará el NAVEGADOR
    ports:
      - "3000:80"
    depends_on:
      - backend
```

## Estructura

```
.
├── index.html                 Página única: carga config.js, styles.css y js/main.js
├── config.js                  window.APP_CONFIG.apiUrl (se regenera en Docker con API_URL)
├── styles.css                 Estilos base
├── Dockerfile · nginx.conf    Imagen nginx sin build
├── docker-entrypoint.d/
│   └── 40-app-config.sh       Genera config.js al arrancar el contenedor
└── js/
    ├── main.js                Punto de entrada: rutas, cabecera común, botón Salir
    ├── router.js              Enrutador por hash (#/login, #/, #/contracts/:id) con rutas protegidas
    ├── api.js                 Cliente HTTP: token, errores, una función por endpoint
    ├── session.js             Sesión: auth.user, auth.login(), auth.logout(); cierre automático en 401
    ├── format.js              Catálogos (roles, estatus), etiquetas y formato de fechas
    ├── components.js          Funciones que devuelven HTML: layout, statCard, statusBadge,
    │                          contractList, ticketTable, loading, errorMessage, esc
    └── pages/
        ├── login.js           ✔ Completa
        ├── dashboard.js       ⚠ TODO: contadores de tickets pendientes / en proceso
        └── contractDetail.js  ⚠ TODO: acciones por rol/estatus y llamada a PATCH
```

Rutas: como el enrutador usa el hash de la URL, las pantallas son `#/login`, `#/` y
`#/contracts/:id`. Así la aplicación funciona con cualquier servidor estático sin configurar un
fallback a `index.html`.

## Qué debe implementar el candidato

Cada archivo empieza con un bloque `PARA EL CANDIDATO` que indica si está **COMPLETO** o si
**REQUIERE IMPLEMENTACIÓN**, y describe exactamente qué debe hacerse. Busca `TODO (candidato)`:

| Archivo                    | El candidato debe implementar                                                                                                   |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `js/pages/dashboard.js`    | En `load()`: el cálculo de `ticketsPendientes` y `ticketsEnProceso` para el usuario autenticado (vía `GET /api/dashboard` o contando los tickets de cada contrato). |
| `js/pages/contractDetail.js` | `getAvailableActions(ticket, user)`: qué botones ver según rol y estatus. `handleChangeStatus(ticket, estatus)`: llamar a `PATCH /api/tickets/{id}`, refrescar la tabla y mostrar los errores `403`/`409` del backend. |

Los demás archivos están completos (login, rutas protegidas, cliente HTTP con token, cierre de sesión
en 401, tablas, badges, estados de carga y error) y funcionan contra la API descrita en
`PRUEBA_TECNICA.md`. En `js/api.js` está el listado completo de endpoints que el backend debe
exponer, con cuerpos, respuestas y códigos HTTP.

## Cómo están hechas las páginas

Cada página es una función `render(el, params)` con un objeto `state`, una función `view()` que
pinta el estado completo con `el.innerHTML` y engancha los eventos, y una función `load()` que llama
a la API y vuelve a pintar. Todo valor que viene de la API pasa por `esc()` antes de insertarse en
el HTML.

