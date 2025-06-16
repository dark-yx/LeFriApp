#!/bin/bash

# Script para desplegar la aplicación en Google Cloud Run
# Este script maneja el proceso de construcción y despliegue de la aplicación

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

set -e

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Este script debe ejecutarse desde el directorio raíz del proyecto${NC}"
    exit 1
fi

# Configuración
PROJECT_ID="lefri-ai"
REGION="us-central1"
SERVICE_NAME="lefri-platform"

# Función para verificar variables de entorno
check_env_vars() {
    local required_vars=(
        "MONGODB_URI"
        "GOOGLE_OAUTH_CLIENT_ID"
        "GOOGLE_OAUTH_CLIENT_SECRET"
        "GOOGLE_OAUTH_REDIRECT_URI"
        "GEMINI_API_KEY"
    )

    local missing_vars=()
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -ne 0 ]; then
        printf "${RED}Error: Faltan variables de entorno locales${NC}\n"
        printf "Por favor, configura las siguientes variables:\n"
        printf "%s\n" "${missing_vars[@]}"
        exit 1
    fi
}

# Verificar variables de entorno
check_env_vars

printf "${YELLOW}Iniciando despliegue de $SERVICE_NAME...${NC}\n"

# Limpiar builds anteriores
printf "${YELLOW}Limpiando builds anteriores...${NC}\n"
rm -rf dist/

# Instalar dependencias
printf "${YELLOW}Instalando dependencias...${NC}\n"
npm install

# Construir la aplicación
printf "${YELLOW}Construyendo la aplicación...${NC}\n"
npm run build

# Desplegar usando Cloud Build
printf "${YELLOW}Desplegando en Cloud Run usando Cloud Build...${NC}\n"
gcloud builds submit \
    --config cloudbuild.yaml \
    --substitutions=_TAG=latest,_REGION=$REGION \
    --project $PROJECT_ID

# Verificar el despliegue
printf "${YELLOW}Verificando el despliegue...${NC}\n"
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --format 'value(status.url)')

if [ -n "$SERVICE_URL" ]; then
    printf "${GREEN}Despliegue exitoso!${NC}\n"
    printf "${GREEN}URL del servicio: $SERVICE_URL${NC}\n"
else
    printf "${RED}Error: No se pudo obtener la URL del servicio${NC}\n"
    exit 1
fi 