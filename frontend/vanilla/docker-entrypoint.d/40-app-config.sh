#!/bin/sh
# Genera /usr/share/nginx/html/config.js con la URL de la API al arrancar el contenedor.
# La imagen oficial de nginx ejecuta automáticamente los scripts de /docker-entrypoint.d/.
set -e
: "${API_URL:=http://localhost:8080/api}"
cat > /usr/share/nginx/html/config.js <<JS
// Generado al arrancar el contenedor a partir de la variable de entorno API_URL.
window.APP_CONFIG = { apiUrl: "${API_URL}" };
JS
echo "config.js generado con API_URL=${API_URL}"
