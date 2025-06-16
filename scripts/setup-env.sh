#!/bin/bash

# Script para configurar el entorno de producción
# Este script se usa en el pipeline de CI/CD

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Configurando entorno de producción...${NC}"

# Verificar si ya existe el archivo .env.deploy
if [ -f .env.deploy ]; then
    echo -e "${YELLOW}El archivo .env.deploy ya existe. ¿Deseas sobrescribirlo? (s/n)${NC}"
    read -r respuesta
    if [ "$respuesta" != "s" ]; then
        echo -e "${GREEN}Operación cancelada.${NC}"
        exit 0
    fi
fi

# Función para verificar si una variable está definida
check_var() {
    if [ -n "${!1}" ]; then
        return 0
    else
        return 1
    fi
}

# Verificar si estamos en CI/CD de GitLab
if [ -n "$CI" ]; then
    echo -e "${YELLOW}Detectado entorno CI/CD de GitLab${NC}"
    
    # Verificar variables de CI/CD
    if [ -z "$MONGODB_URI_BASE64" ] || [ -z "$GOOGLE_OAUTH_CLIENT_ID_BASE64" ] || \
       [ -z "$GOOGLE_OAUTH_CLIENT_SECRET_BASE64" ] || [ -z "$GEMINI_API_KEY_BASE64" ]; then
        echo -e "${RED}Error: Faltan variables de CI/CD necesarias${NC}"
        exit 1
    fi
    
    # Crear .env.deploy con las variables de CI/CD
    cat > .env.deploy << EOF
MONGODB_URI_BASE64=$MONGODB_URI_BASE64
GOOGLE_OAUTH_CLIENT_ID_BASE64=$GOOGLE_OAUTH_CLIENT_ID_BASE64
GOOGLE_OAUTH_CLIENT_SECRET_BASE64=$GOOGLE_OAUTH_CLIENT_SECRET_BASE64
GEMINI_API_KEY_BASE64=$GEMINI_API_KEY_BASE64
EOF
else
    # Verificar si las variables ya están exportadas
    if check_var "MONGODB_URI" && check_var "GOOGLE_OAUTH_CLIENT_ID" && \
       check_var "GOOGLE_OAUTH_CLIENT_SECRET" && check_var "GEMINI_API_KEY"; then
        echo -e "${YELLOW}Detectadas variables de entorno exportadas${NC}"
        
        # Codificar variables en base64
        MONGODB_URI_BASE64=$(echo -n "$MONGODB_URI" | base64)
        GOOGLE_OAUTH_CLIENT_ID_BASE64=$(echo -n "$GOOGLE_OAUTH_CLIENT_ID" | base64)
        GOOGLE_OAUTH_CLIENT_SECRET_BASE64=$(echo -n "$GOOGLE_OAUTH_CLIENT_SECRET" | base64)
        GEMINI_API_KEY_BASE64=$(echo -n "$GEMINI_API_KEY" | base64)

        # Guardar variables en archivo .env.deploy
        cat > .env.deploy << EOF
MONGODB_URI_BASE64=$MONGODB_URI_BASE64
GOOGLE_OAUTH_CLIENT_ID_BASE64=$GOOGLE_OAUTH_CLIENT_ID_BASE64
GOOGLE_OAUTH_CLIENT_SECRET_BASE64=$GOOGLE_OAUTH_CLIENT_SECRET_BASE64
GEMINI_API_KEY_BASE64=$GEMINI_API_KEY_BASE64
EOF
    else
        # Modo interactivo para desarrollo local
        echo -e "${YELLOW}Modo interactivo para desarrollo local${NC}"
        
        # Solicitar variables de entorno
        echo -e "${YELLOW}Ingresa la URI de MongoDB:${NC}"
        read -r mongodb_uri
        echo -e "${YELLOW}Ingresa el Client ID de Google OAuth:${NC}"
        read -r google_client_id
        echo -e "${YELLOW}Ingresa el Client Secret de Google OAuth:${NC}"
        read -r google_client_secret
        echo -e "${YELLOW}Ingresa la API Key de Gemini:${NC}"
        read -r gemini_api_key

        # Codificar variables en base64
        MONGODB_URI_BASE64=$(echo -n "$mongodb_uri" | base64)
        GOOGLE_OAUTH_CLIENT_ID_BASE64=$(echo -n "$google_client_id" | base64)
        GOOGLE_OAUTH_CLIENT_SECRET_BASE64=$(echo -n "$google_client_secret" | base64)
        GEMINI_API_KEY_BASE64=$(echo -n "$gemini_api_key" | base64)

        # Guardar variables en archivo .env.deploy
        cat > .env.deploy << EOF
MONGODB_URI_BASE64=$MONGODB_URI_BASE64
GOOGLE_OAUTH_CLIENT_ID_BASE64=$GOOGLE_OAUTH_CLIENT_ID_BASE64
GOOGLE_OAUTH_CLIENT_SECRET_BASE64=$GOOGLE_OAUTH_CLIENT_SECRET_BASE64
GEMINI_API_KEY_BASE64=$GEMINI_API_KEY_BASE64
EOF
    fi
fi

echo -e "${GREEN}Variables de entorno configuradas correctamente en .env.deploy${NC}"
