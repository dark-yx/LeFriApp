// Comprehensive translation system for LeFriAI - English first
export const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    consultation: "Consultation",
    process: "Process",
    emergency: "Emergency",
    profile: "Profile",
    logout: "Logout",

    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    createAccount: "Create Account",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    continueWithGoogle: "Continue with Google",
    orContinueWith: "or continue with",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    byCreating: "By creating an account, you agree to our",
    and: "and",
    signingIn: "Signing in...",
    creatingAccount: "Creating account...",
    authenticating: "Authenticating...",

    // Dashboard
    welcomeTitle: "Welcome to LeFriAI",
    welcomeSubtitle: "Your intelligent legal assistant",
    recentConsultations: "Recent Consultations",
    activeProcesses: "Active Processes",
    emergencyContacts: "Emergency Contacts",
    quickActions: "Quick Actions",
    askQuestion: "Ask Question",
    startProcess: "Start Process",
    addContact: "Add Contact",
    viewAll: "View All",
    noConsultations: "No recent consultations",
    noProcesses: "No active processes",
    noContacts: "No emergency contacts",

    // Consultation
    legalAssistant: "Legal Assistant",
    askLegalQuestion: "Hello! I'm your legal assistant",
    typeQuestion: "Type your legal question...",
    quickQuestions: "Quick Questions",
    thinking: "Thinking...",
    confidence: "Confidence",
    sources: "Sources",
    relevance: "Relevance",

    // Process
    legalProcesses: "Legal Processes",
    processTitle: "Process Title",
    processDescription: "Process Description",
    currentStep: "Current Step",
    totalSteps: "Total Steps",
    status: "Status",
    startNewProcess: "Start New Process",
    continueProcess: "Continue Process",

    // Emergency
    emergencyAlert: "Emergency Alert",
    emergencyDescription: "Activate an emergency alert that will notify your contacts",
    activateEmergency: "Activate Emergency",
    emergencyActivated: "Emergency Activated",
    location: "Location",
    contacts: "Contacts",

    // Profile
    personalInfo: "Personal Information",
    language: "Language",
    country: "Country",
    saveChanges: "Save Changes",
    changesSaved: "Changes saved successfully",

    // Common
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    remove: "Remove",
    back: "Back",
    next: "Next",
    previous: "Previous",
    close: "Close",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    refresh: "Refresh"
  },

  es: {
    // Navigation
    dashboard: "Panel de Control",
    consultation: "Consulta",
    process: "Proceso",
    emergency: "Emergencia",
    profile: "Perfil",
    logout: "Cerrar Sesión",

    // Auth
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Correo Electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar Contraseña",
    fullName: "Nombre Completo",
    createAccount: "Crear Cuenta",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    dontHaveAccount: "¿No tienes una cuenta?",
    continueWithGoogle: "Continuar con Google",
    orContinueWith: "o continuar con",
    termsOfService: "Términos de Servicio",
    privacyPolicy: "Política de Privacidad",
    byCreating: "Al crear una cuenta, aceptas nuestros",
    and: "y",
    signingIn: "Iniciando sesión...",
    creatingAccount: "Creando cuenta...",
    authenticating: "Autenticando...",

    // Dashboard
    welcomeTitle: "Bienvenido a LeFriAI",
    welcomeSubtitle: "Tu asistente legal inteligente",
    recentConsultations: "Consultas Recientes",
    activeProcesses: "Procesos Activos",
    emergencyContacts: "Contactos de Emergencia",
    quickActions: "Acciones Rápidas",
    askQuestion: "Hacer Pregunta",
    startProcess: "Iniciar Proceso",
    addContact: "Agregar Contacto",
    viewAll: "Ver Todo",
    noConsultations: "No hay consultas recientes",
    noProcesses: "No hay procesos activos",
    noContacts: "No hay contactos de emergencia",

    // Consultation
    legalAssistant: "Asistente Legal",
    askLegalQuestion: "¡Hola! Soy tu asistente legal",
    typeQuestion: "Escribe tu pregunta legal...",
    quickQuestions: "Preguntas Rápidas",
    thinking: "Pensando...",
    confidence: "Confianza",
    sources: "Fuentes",
    relevance: "Relevancia",

    // Process
    legalProcesses: "Procesos Legales",
    processTitle: "Título del Proceso",
    processDescription: "Descripción del Proceso",
    currentStep: "Paso Actual",
    totalSteps: "Total de Pasos",
    status: "Estado",
    startNewProcess: "Iniciar Nuevo Proceso",
    continueProcess: "Continuar Proceso",

    // Emergency
    emergencyAlert: "Alerta de Emergencia",
    emergencyDescription: "Activa una alerta de emergencia que notificará a tus contactos",
    activateEmergency: "Activar Emergencia",
    emergencyActivated: "Emergencia Activada",
    location: "Ubicación",
    contacts: "Contactos",

    // Profile
    personalInfo: "Información Personal",
    language: "Idioma",
    country: "País",
    saveChanges: "Guardar Cambios",
    changesSaved: "Cambios guardados exitosamente",

    // Common
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Agregar",
    remove: "Remover",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    close: "Cerrar",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    refresh: "Actualizar"
  }
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

// Hook to use translations - English as default
export function useTranslations(language: string = 'en') {
  return translations[language as Language] || translations.en;
}

export function getTranslation(key: TranslationKey, language: string = 'en'): string {
  const t = translations[language as Language] || translations.en;
  return t[key] || key;
}

export default translations;