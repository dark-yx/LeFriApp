#!/bin/bash

# Variables locales
MONGODB_URI="mongodb+srv://jejemplo:EJEMPLO.11jp11@lefri-ai.vbdfdd.mongodb.net/?retryWrites=true&w=majority&appName=LeFri-AI"
GOOGLE_OAUTH_CLIENT_ID="935434597-nb4uke2c4kqtdejemplonrpk0u.apps.googleusercontent.com"
GOOGLE_OAUTH_CLIENT_SECRET="GSDSPX-Oc5ejemploYTRRR6l2hlO_YBj-mb"
GOOGLE_OAUTH_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
GEMINI_API_KEY="AIzaDFDejemplopG55-utIIm063_EzTfdfgrfftd0s"

# Generar variables base64
echo "Generando variables base64 para el despliegue..."
echo "MONGODB_URI_BASE64=$(echo -n "$MONGODB_URI" | base64)"
echo "GOOGLE_OAUTH_CLIENT_ID_BASE64=$(echo -n "$GOOGLE_OAUTH_CLIENT_ID" | base64)"
echo "GOOGLE_OAUTH_CLIENT_SECRET_BASE64=$(echo -n "$GOOGLE_OAUTH_CLIENT_SECRET" | base64)"
echo "GOOGLE_OAUTH_REDIRECT_URI=$GOOGLE_OAUTH_REDIRECT_URI"
echo "GEMINI_API_KEY_BASE64=$(echo -n "$GEMINI_API_KEY" | base64)"

echo "Variables generadas. Copia y pega estas variables en la configuración de GitHub Actions." 