#!/bin/bash

# Script para preparar el entorno de despliegue
# Este script se ejecuta antes del despliegue para asegurar que todas las variables
# de entorno necesarias estén configuradas correctamente

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Iniciando preparación del entorno de despliegue...${NC}"

# Verificar si estamos en un entorno de CI/CD
if [ -n "$CI" ]; then
    echo -e "${YELLOW}Ejecutando en entorno de CI/CD${NC}"
    
    # Función para verificar y decodificar variables base64
    check_and_decode_var() {
        local var_name=$1
        local is_base64=$2
        
        if [ -z "${!var_name}" ]; then
            echo -e "${RED}Error: La variable $var_name no está definida${NC}"
            exit 1
        fi
        
        if [ "$is_base64" = true ]; then
            # Decodificar la variable base64
            local decoded_value=$(echo "${!var_name}" | base64 -d)
            if [ $? -ne 0 ]; then
                echo -e "${RED}Error: No se pudo decodificar la variable $var_name${NC}"
                exit 1
            fi
            # Exportar la variable decodificada
            export "${var_name%_BASE64}"="$decoded_value"
            echo -e "${GREEN}✓ Variable ${var_name%_BASE64} configurada (decodificada)${NC}"
        else
            echo -e "${GREEN}✓ Variable $var_name configurada${NC}"
        fi
    }

    # Verificar y decodificar variables requeridas
    check_and_decode_var "GCP_SERVICE_ACCOUNT_KEY" true
    check_and_decode_var "MONGODB_URI_BASE64" true
    check_and_decode_var "GOOGLE_OAUTH_CLIENT_ID_BASE64" true
    check_and_decode_var "GOOGLE_OAUTH_CLIENT_SECRET_BASE64" true
    check_and_decode_var "GOOGLE_OAUTH_REDIRECT_URI" false
    check_and_decode_var "GEMINI_API_KEY_BASE64" true

    # Decodificar la clave de servicio de Google Cloud
    echo -e "${YELLOW}Configurando credenciales de Google Cloud...${NC}"
    echo $GCP_SERVICE_ACCOUNT_KEY | base64 -d > /tmp/gcp-key.json

    # Verificar que el archivo se creó correctamente
    if [ ! -f "/tmp/gcp-key.json" ]; then
        echo -e "${RED}Error: No se pudo crear el archivo gcp-key.json${NC}"
        exit 1
    fi

    # Configurar Google Cloud SDK
    echo -e "${YELLOW}Configurando Google Cloud SDK...${NC}"
    gcloud auth activate-service-account --key-file=/tmp/gcp-key.json
    gcloud config set project lefri-ai

    # Verificar la conexión a MongoDB
    echo -e "${YELLOW}Verificando conexión a MongoDB...${NC}"
    if mongosh $MONGODB_URI --eval "db.runCommand({ping: 1})" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Conexión a MongoDB exitosa${NC}"
    else
        echo -e "${RED}Error: No se pudo conectar a MongoDB${NC}"
        exit 1
    fi

    # Limpiar archivos sensibles
    echo -e "${YELLOW}Limpiando archivos sensibles...${NC}"
    rm -f /tmp/gcp-key.json
else
    echo -e "${YELLOW}Ejecutando en entorno local${NC}"
    
    # Verificar variables locales
    if [ -z "$MONGODB_URI" ] || [ -z "$GOOGLE_OAUTH_CLIENT_ID" ] || [ -z "$GOOGLE_OAUTH_CLIENT_SECRET" ] || [ -z "$GOOGLE_OAUTH_REDIRECT_URI" ] || [ -z "$GEMINI_API_KEY" ]; then
        echo -e "${RED}Error: Faltan variables de entorno locales${NC}"
        echo -e "Por favor, configura las siguientes variables:"
        echo -e "MONGODB_URI"
        echo -e "GOOGLE_OAUTH_CLIENT_ID"
        echo -e "GOOGLE_OAUTH_CLIENT_SECRET"
        echo -e "GOOGLE_OAUTH_REDIRECT_URI"
        echo -e "GEMINI_API_KEY"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Variables de entorno locales configuradas${NC}"
fi

echo -e "${GREEN}✓ Preparación del entorno completada exitosamente${NC}" 