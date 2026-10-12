// Configuración de la aplicación en tiempo de ejecución (no hay paso de build).
//
// Desarrollo local: ajusta apiUrl si tu API no corre en http://localhost:8080/api.
// Docker: este archivo se regenera al arrancar el contenedor a partir de la variable
//         de entorno API_URL (ver docker-entrypoint.d/40-app-config.sh).
window.APP_CONFIG = { apiUrl: 'http://localhost:8080/api' };
