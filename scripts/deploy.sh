#!/bin/bash

# Variables
PROJECT_ID="lefri-ai"
REGION="us-central1"
SERVICE_NAME="lefri-app"
IMAGE_NAME="us-central1-docker.pkg.dev/$PROJECT_ID/lefri-registry/$SERVICE_NAME"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando despliegue...${NC}"

# Verificar que existe package-lock.json
if [ ! -f "package-lock.json" ]; then
    echo -e "${YELLOW}Generando package-lock.json...${NC}"
    npm install --package-lock-only
fi

# Construir y desplegar
gcloud builds submit --tag $IMAGE_NAME \
    --project $PROJECT_ID \
    --gcs-log-dir="gs://${PROJECT_ID}_cloudbuild/logs" \
    --gcs-source-staging-dir="gs://${PROJECT_ID}_cloudbuild/source" && \
gcloud run deploy $SERVICE_NAME \
    --image=$IMAGE_NAME \
    --platform=managed \
    --region=$REGION \
    --allow-unauthenticated \
    --port=8080 \
    --set-env-vars="NODE_ENV=production" \
    --set-env-vars="MONGODB_URI=$(echo -n $MONGODB_URI_BASE64 | base64 -d)" \
    --set-env-vars="GOOGLE_OAUTH_CLIENT_ID=$(echo -n $GOOGLE_OAUTH_CLIENT_ID_BASE64 | base64 -d)" \
    --set-env-vars="GOOGLE_OAUTH_CLIENT_SECRET=$(echo -n $GOOGLE_OAUTH_CLIENT_SECRET_BASE64 | base64 -d)" \
    --set-env-vars="GOOGLE_OAUTH_REDIRECT_URI=https://lefri-app-98044249097.us-central1.run.app/api/auth/google/callback" \
    --set-env-vars="GEMINI_API_KEY=$(echo -n $GEMINI_API_KEY_BASE64 | base64 -d)"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Despliegue exitoso!${NC}"
    echo -e "URL del servicio: ${YELLOW}https://lefri-app-98044249097.us-central1.run.app${NC}"
    echo -e "Para ver los logs: ${YELLOW}gcloud run services logs read $SERVICE_NAME${NC}"
else
    echo -e "${RED}Error en el despliegue${NC}"
    exit 1
fi
# Desplegar en Cloud Run
SERVICE_NAME="lefri-app"
if [ "$ENV" == "staging" ]; then
    SERVICE_NAME="lefri-app-staging"
fi

echo -e "${YELLOW}Desplegando en Cloud Run: $SERVICE_NAME${NC}"
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
check_error "Error en despliegue a Cloud Run"

# Verificar despliegue
echo -e "${YELLOW}Verificando despliegue...${NC}"
URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region us-central1 --format 'value(status.url)')
check_error "Error obteniendo URL del servicio"

echo -e "${GREEN}¡Despliegue exitoso!${NC}"
echo -e "URL del servicio: ${GREEN}$URL${NC}"
echo -e "Para ver los logs: ${YELLOW}gcloud run services logs read $SERVICE_NAME${NC}"

# Función para desplegar usando Cloud Build
deploy_with_cloud_build() {
    echo -e "${YELLOW}Desplegando con Cloud Build...${NC}"
    gcloud builds submit --tag us-central1-docker.pkg.dev/$GCP_PROJECT_ID/lefri-registry/$SERVICE_NAME && \
    gcloud run deploy $SERVICE_NAME \
        --image=us-central1-docker.pkg.dev/$GCP_PROJECT_ID/lefri-registry/$SERVICE_NAME \
        --platform=managed \
        --region=$GCP_REGION \
        --allow-unauthenticated \
        --port=8080 \
        --set-env-vars="NODE_ENV=production,MONGODB_URI=${MONGODB_URI},GOOGLE_OAUTH_CLIENT_ID=${GOOGLE_OAUTH_CLIENT_ID},GOOGLE_OAUTH_CLIENT_SECRET=${GOOGLE_OAUTH_CLIENT_SECRET},GOOGLE_OAUTH_REDIRECT_URI=${GOOGLE_OAUTH_REDIRECT_URI},GEMINI_API_KEY=${GEMINI_API_KEY}"
    check_error "Error en despliegue con Cloud Build"
}

# Función para desplegar usando Docker
deploy_with_docker() {
    echo -e "${YELLOW}Desplegando con Docker...${NC}"
    docker build -t $IMAGE_NAME .
    check_error "Error en build de Docker"
    docker push $IMAGE_NAME
    check_error "Error subiendo imagen a GCR"

    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME \
        --platform managed \
        --region $GCP_REGION \
        --allow-unauthenticated
    check_error "Error en despliegue con Docker"
}

# Agregar opción de método de despliegue
METHOD=${2:-cloudbuild}  # cloudbuild o docker

if [ "$METHOD" == "cloudbuild" ]; then
    deploy_with_cloud_build
else
    deploy_with_docker
fi
