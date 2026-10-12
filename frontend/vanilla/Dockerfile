# Sin paso de build: los archivos se sirven tal cual con nginx.
FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Archivos estáticos de la aplicación
COPY index.html config.js styles.css /usr/share/nginx/html/
COPY js /usr/share/nginx/html/js

# Al arrancar, regenera config.js con la variable de entorno API_URL
# (se pasa desde docker-compose con `environment:`).
COPY docker-entrypoint.d/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
RUN chmod +x /docker-entrypoint.d/40-app-config.sh

ENV API_URL=http://localhost:8080/api
EXPOSE 80
