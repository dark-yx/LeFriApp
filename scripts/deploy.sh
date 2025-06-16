#!/bin/bash

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Función para manejar errores
handle_error() {
    echo -e "${RED}Error: $1${NC}"
    exit 1
}

# Verificar si existe el archivo .env.deploy
if [ -f .env.deploy ]; then
    echo -e "${YELLOW}Cargando variables de entorno desde .env.deploy...${NC}"
    source .env.deploy
else
    echo -e "${YELLOW}No se encontró .env.deploy. Ejecutando setup-env.sh...${NC}"
    ./scripts/setup-env.sh || handle_error "Error al configurar variables de entorno"
fi

# Verificar variables de entorno necesarias
[ -z "$MONGODB_URI_BASE64" ] && handle_error "MONGODB_URI_BASE64 no está configurada. Ejecuta ./scripts/setup-env.sh"
[ -z "$GOOGLE_OAUTH_CLIENT_ID_BASE64" ] && handle_error "GOOGLE_OAUTH_CLIENT_ID_BASE64 no está configurada. Ejecuta ./scripts/setup-env.sh"
[ -z "$GOOGLE_OAUTH_CLIENT_SECRET_BASE64" ] && handle_error "GOOGLE_OAUTH_CLIENT_SECRET_BASE64 no está configurada. Ejecuta ./scripts/setup-env.sh"
[ -z "$GEMINI_API_KEY_BASE64" ] && handle_error "GEMINI_API_KEY_BASE64 no está configurada. Ejecuta ./scripts/setup-env.sh"
[ -z "$GOOGLE_OAUTH_REDIRECT_URI" ] && handle_error "GOOGLE_OAUTH_REDIRECT_URI no está configurada. Ejecuta ./scripts/setup-env.sh"

# Configuración del proyecto
PROJECT_ID="lefri-ai"
REGION="us-central1"
SERVICE_NAME="lefri-app"
IMAGE_NAME="us-central1-docker.pkg.dev/${PROJECT_ID}/lefri-registry/${SERVICE_NAME}"

echo -e "${YELLOW}Construyendo la aplicación...${NC}"
npm run build || handle_error "Error al construir la aplicación"

echo -e "${YELLOW}Construyendo y subiendo la imagen Docker...${NC}"
gcloud builds submit --tag ${IMAGE_NAME} || handle_error "Error al construir y subir la imagen Docker"

echo -e "${YELLOW}Desplegando en Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --platform=managed \
  --region=${REGION} \
  --image=${IMAGE_NAME} \
  --allow-unauthenticated \
  --port=8080 \
  --set-env-vars="NODE_ENV=production,MONGODB_URI=$(echo $MONGODB_URI_BASE64 | base64 -d),GOOGLE_OAUTH_CLIENT_ID=$(echo $GOOGLE_OAUTH_CLIENT_ID_BASE64 | base64 -d),GOOGLE_OAUTH_CLIENT_SECRET=$(echo $GOOGLE_OAUTH_CLIENT_SECRET_BASE64 | base64 -d),GEMINI_API_KEY=$(echo $GEMINI_API_KEY_BASE64 | base64 -d),GOOGLE_OAUTH_REDIRECT_URI=${GOOGLE_OAUTH_REDIRECT_URI}" \
  --timeout=300 \
  --memory=512Mi \
  --cpu=1 \
  || handle_error "Error al desplegar en Cloud Run"

echo -e "${GREEN}Despliegue completado exitosamente!${NC}"
echo -e "${YELLOW}Verificando el servicio...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --platform managed --region ${REGION} --format 'value(status.url)')
echo -e "${GREEN}El servicio está disponible en: ${SERVICE_URL}${NC}"
