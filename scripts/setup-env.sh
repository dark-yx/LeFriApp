#!/bin/bash

# Script para configurar el entorno de producción
# Este script se usa en el pipeline de CI/CD

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Configurando entorno de producción...${NC}"

# Verificar variables de entorno críticas
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}Error: La variable $1 no está definida${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Variable $1 configurada${NC}"
    fi
}

# Verificar variables requeridas
check_env_var "GCP_SERVICE_ACCOUNT_KEY"
check_env_var "MONGODB_URI_BASE64"
check_env_var "GOOGLE_OAUTH_CLIENT_ID_BASE64"
check_env_var "GOOGLE_OAUTH_CLIENT_SECRET_BASE64"
check_env_var "GOOGLE_OAUTH_REDIRECT_URI"
check_env_var "GEMINI_API_KEY_BASE64"

# Decodificar variables base64
echo -e "${YELLOW}Decodificando variables de entorno...${NC}"
export MONGODB_URI=$(echo $MONGODB_URI_BASE64 | base64 -d)
export GOOGLE_OAUTH_CLIENT_ID=$(echo $GOOGLE_OAUTH_CLIENT_ID_BASE64 | base64 -d)
export GOOGLE_OAUTH_CLIENT_SECRET=$(echo $GOOGLE_OAUTH_CLIENT_SECRET_BASE64 | base64 -d)
export GEMINI_API_KEY=$(echo $GEMINI_API_KEY_BASE64 | base64 -d)

# Configurar Google Cloud
echo -e "${YELLOW}Configurando Google Cloud...${NC}"
echo $GCP_SERVICE_ACCOUNT_KEY | base64 -d > /tmp/gcp-key.json
gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
gcloud config set project $GCP_PROJECT_ID

# Limpiar archivos sensibles
echo -e "${YELLOW}Limpiando archivos sensibles...${NC}"
rm -f /tmp/gcp-key.json

echo -e "${GREEN}✓ Entorno de producción configurado exitosamente${NC}"
