/* =====================================================================
 * PARA EL CANDIDATO
 * Estado del archivo: COMPLETO. No es necesario modificarlo.
 *
 * El candidato debe implementar en esta sección: nada en el frontend.
 * Lo que sí debe hacer es implementar EN SU BACKEND los endpoints listados
 * más abajo, con exactamente esas rutas, cuerpos y respuestas, porque las
 * funciones de `api` ya los consumen tal cual.
 *
 * Solo debe modificar este archivo si:
 *   - Su API no corre en http://localhost:8080/api → cambiar VITE_API_URL
 *     en frontend/.env (desarrollo) y en docker-compose.yml (build arg).
 *   - Usa autenticación por cookie en lugar de token → agregar
 *     `credentials: 'include'` al fetch y quitar el header Authorization.
 *   - Implementa los endpoints deseables con otra ruta → ajustar `api.*`.
 * ===================================================================== */

/**
 * Cliente HTTP centralizado.
 *
 * - Agrega el header Authorization: Bearer <token> a todas las peticiones.
 * - Convierte las respuestas de error de la API en instancias de ApiError.
 * - Si la API responde 401 emite el evento `auth:unauthorized` para que
 *   AuthContext cierre la sesión y redirija al login.
 *
 * La URL base viene de la variable de entorno VITE_API_URL (ver .env.example).
 *
 * =====================================================================
 * ENDPOINTS QUE DEBE EXPONER TU BACKEND (detalle en PRUEBA_TECNICA.md §6)
 * =====================================================================
 * Todas las rutas van bajo VITE_API_URL (por defecto http://localhost:8080/api).
 * Salvo el login, todas requieren `Authorization: Bearer <token>`.
 * Errores siempre con el formato { "error": "CODIGO", "message": "texto" }.
 *
 * --- OBLIGATORIOS ----------------------------------------------------
 *
 * 1) POST /auth/login                                  → api.login()
 *    Body:     { "username": "supervisor", "password": "Supervisor2026!" }
 *    200:      { "token": "...", "user": { "id": 2, "username": "supervisor", "role": "SUPERVISOR" } }
 *    400:      falta username o password
 *    401:      credenciales incorrectas o usuario inactivo (Activo = 0)
 *
 * 2) GET /contracts                                    → api.getContracts()
 *    Devuelve los contratos visibles para el usuario:
 *      ADMINISTRADOR / SUPERVISOR → todos
 *      TECNICO                    → solo contratos con al menos un ticket asignado a él
 *    200: [ { "id": 1, "numero": "CON-001", "nombre": "Mantenimiento Planta Norte",
 *             "fechaInicio": "2026-01-01", "fechaFin": "2026-12-31", "estatus": "ACTIVO",
 *             "responsable": { "id": 2, "nombre": "supervisor" } }, ... ]
 *
 * 3) GET /contracts/{id}                               → api.getContract(id)
 *    200: el mismo objeto que en la lista
 *    403: el técnico no tiene tickets en ese contrato
 *    404: no existe
 *
 * 4) GET /contracts/{id}/tickets                       → api.getContractTickets(id)
 *    Devuelve los tickets del contrato visibles para el usuario
 *    (TECNICO → solo los asignados a él).
 *    200: [ { "id": 101, "tipo": "PREVENTIVO", "descripcion": "Revisión de motor principal línea 1",
 *             "fechaSolicitud": "2026-09-01T08:30:00", "estatus": "ASIGNADO",
 *             "usuarioAsignado": { "id": 3, "nombre": "tecnico01" } },      // o null si no está asignado
 *           ... ]
 *    403 / 404: igual que en 3)
 *
 * 5) PATCH /tickets/{id}                               → api.updateTicketStatus(id, estatus)
 *    Body:     { "estatus": "EN_PROCESO" }
 *    200:      el ticket actualizado (misma forma que en 4)
 *    400:      estatus fuera de catálogo (PENDIENTE, ASIGNADO, EN_PROCESO, FINALIZADO, CANCELADO)
 *    403:      TECNICO intentando modificar un ticket que no es suyo
 *    404:      el ticket no existe
 *    409:      ticket FINALIZADO/CANCELADO, transición no permitida o contrato no ACTIVO
 *    Transiciones válidas: PENDIENTE|ASIGNADO → EN_PROCESO ; EN_PROCESO → FINALIZADO ;
 *                          cualquiera no final → CANCELADO
 *
 * --- DESEABLES (solo si sobra tiempo) --------------------------------
 *
 * 6) GET /dashboard                                    → api.getDashboard()
 *    200: { "contratosActivos": 2, "ticketsPendientes": 5, "ticketsEnProceso": 3 }
 *    (calculado para el usuario autenticado; alternativa a contar en el frontend)
 *
 * 7) POST /tickets/{id}/assign                         → api.assignTicket(id, idUsuario)
 *    Solo ADMINISTRADOR / SUPERVISOR (403 para TECNICO)
 *    Body:     { "idUsuario": 4 }
 *    200:      el ticket actualizado; si estaba PENDIENTE pasa a ASIGNADO
 *    400:      idUsuario no es un TECNICO activo
 *    409:      ticket cerrado o contrato no ACTIVO
 *
 * 8) GET /users?rol=TECNICO                            → api.getUsers(rol)
 *    Solo ADMINISTRADOR / SUPERVISOR (403 para TECNICO)
 *    200: [ { "id": 3, "nombre": "tecnico01", "correo": "tecnico1@empresa.com", "rol": "TECNICO" }, ... ]
 *    (solo usuarios activos; NUNCA devolver passwordHash)
 *
 * --- CÓDIGOS HTTP ----------------------------------------------------
 *   200 OK · 400 body inválido · 401 sin token / token inválido / login fallido
 *   403 sin permiso · 404 no existe · 409 conflicto de estado · 500 error no controlado
 */

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api').replace(/\/$/, '');
const TOKEN_KEY = 'mantenimiento.token';
const USER_KEY = 'mantenimiento.user';

export const session = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  save: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Realiza una petición a la API.
 * @param {string} path   Ruta relativa a API_URL, por ejemplo "/contracts".
 * @param {object} [opts]
 * @param {string} [opts.method="GET"]
 * @param {object} [opts.body]        Se serializa como JSON.
 * @param {boolean} [opts.auth=true]  Si es false no se envía el token (login).
 */
export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = session.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', 'No se pudo conectar con la API');
  }

  const text = await response.text();
  const data = text ? safeJson(text) : null;

  if (!response.ok) {
    if (response.status === 401 && auth) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    throw new ApiError(
      response.status,
      data?.error ?? 'HTTP_ERROR',
      data?.message ?? `Error ${response.status}`,
    );
  }

  return data;
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Funciones de alto nivel: una por endpoint del enunciado. */
export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password }, auth: false }),

  getContracts: () => request('/contracts'),
  getContract: (id) => request(`/contracts/${id}`),
  getContractTickets: (id) => request(`/contracts/${id}/tickets`),

  updateTicketStatus: (id, estatus) =>
    request(`/tickets/${id}`, { method: 'PATCH', body: { estatus } }),

  // Opcionales (ver PRUEBA_TECNICA.md §6.7)
  getDashboard: () => request('/dashboard'),
  assignTicket: (id, idUsuario) =>
    request(`/tickets/${id}/assign`, { method: 'POST', body: { idUsuario } }),
  getUsers: (rol) => request(`/users${rol ? `?rol=${encodeURIComponent(rol)}` : ''}`),
};
