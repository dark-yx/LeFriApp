# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY client ./client
COPY server ./server
COPY shared ./shared

# Construir la aplicación
ENV NODE_ENV=production
RUN npm run build

# Etapa de producción
FROM node:18-alpine

WORKDIR /app

# Instalar wget para health checks
RUN apk add --no-cache wget

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Configurar permisos
RUN chown -R node:node /app && \
    chmod -R 755 /app/dist

# Cambiar al usuario node
USER node

# Exponer puerto
EXPOSE 8080

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Configurar health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Comando para iniciar la aplicación
CMD ["node", "dist/index.js"] 