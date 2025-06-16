#!/bin/bash

# Script para configurar el entorno de desarrollo local
# Este script NO debe subirse al repositorio

# Colores para mensajes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Configurando entorno de desarrollo local...${NC}"

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.${NC}"
    exit 1
fi

# Configurar variables de entorno
export MONGODB_URI="mongodb+srv://jejemplo:EJEMPLO.11jp11@lefri-ai.vbdfdd.mongodb.net/?retryWrites=true&w=majority&appName=LeFri-AI"
export GOOGLE_OAUTH_CLIENT_ID="935434597-nb4uke2c4kqtdejemplonrpk0u.apps.googleusercontent.com"
export GOOGLE_OAUTH_CLIENT_SECRET="GSDSPX-Oc5ejemploYTRRR6l2hlO_YBj-mb"
export GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
export GEMINI_API_KEY="AIzaDFDejemplopG55-utIIm063_EzTfdfgrfftd0s"

# Verificar que las variables se configuraron correctamente
check_env_var() {
    if [ -z "${!1}" ]; then
        echo -e "${RED}Error: La variable $1 no está configurada${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Variable $1 configurada${NC}"
    fi
}

check_env_var "MONGODB_URI"
check_env_var "GOOGLE_OAUTH_CLIENT_ID"
check_env_var "GOOGLE_OAUTH_CLIENT_SECRET"
check_env_var "GOOGLE_OAUTH_REDIRECT_URI"
check_env_var "GEMINI_API_KEY"

echo -e "${GREEN}✓ Entorno local configurado exitosamente${NC}"
echo -e "${YELLOW}Para iniciar el servidor de desarrollo, ejecuta: npm run dev${NC}"
