#!/bin/bash

echo "🔧 Iniciando reparación del entorno de despliegue..."

# 1. Generar package-lock.json si no existe
if [ ! -f "package-lock.json" ]; then
    echo "📦 Generando package-lock.json..."
    npm install --package-lock-only
fi

# 2. Actualizar gcloud CLI
echo "🔄 Actualizando gcloud CLI..."
gcloud components update --quiet

# 3. Verificar autenticación
echo "🔑 Verificando autenticación con Google Cloud..."
gcloud auth list

# 4. Verificar configuración del proyecto
echo "⚙️ Verificando configuración del proyecto..."
gcloud config get-value project

# 5. Dar permisos al script de despliegue
echo "📝 Actualizando permisos de scripts..."
chmod +x scripts/deploy.sh

echo "✅ Reparación completada. Ahora puedes ejecutar ./scripts/deploy.sh"
