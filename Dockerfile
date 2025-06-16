# Etapa de construcción
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci --legacy-peer-deps

# Copiar el código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Etapa de producción
FROM node:20-alpine

WORKDIR /app

# Copiar archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/public ./dist/public

# Asegurarse de que los directorios necesarios existen
RUN mkdir -p dist/public/assets

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Exponer el puerto
EXPOSE 8080

# Comando para iniciar la aplicación
CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"] 