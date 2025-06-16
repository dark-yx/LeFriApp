import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { config } from 'dotenv';
import { connect } from 'mongoose';
import session from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from './models/User.js';
import { setupWebSocket } from './websocket.js';
import { setupWhatsApp } from './whatsapp/index.js';
import { setupEmailService } from './email/index.js';
import { setupVoiceService } from './voice/index.js';
import { setupAIServices } from './ai/index.js';
import { setupEmergencyService } from './emergency/index.js';
import { setupDocumentService } from './documents/index.js';
import { setupLegalService } from './legal/index.js';
import { setupStorageService } from './storage/index.js';
import { setupAuthService } from './auth/index.js';
import { setupUserService } from './users/index.js';
import { setupNotificationService } from './notifications/index.js';
import { setupAnalyticsService } from './analytics/index.js';
import { setupLoggingService } from './logging/index.js';
import { setupMonitoringService } from './monitoring/index.js';
import { setupSecurityService } from './security/index.js';
import { setupCacheService } from './cache/index.js';
import { setupQueueService } from './queue/index.js';
import { setupSearchService } from './search/index.js';
import { setupExportService } from './export/index.js';
import { setupImportService } from './import/index.js';
import { setupBackupService } from './backup/index.js';
import { setupRestoreService } from './restore/index.js';
import { setupMigrationService } from './migration/index.js';
import { setupValidationService } from './validation/index.js';
import { setupSanitizationService } from './sanitization/index.js';
import { setupRateLimitService } from './rate-limit/index.js';
import { setupCorsService } from './cors/index.js';
import { setupCompressionService } from './compression/index.js';
import { setupHelmetService } from './helmet/index.js';
import { setupMorganService } from './morgan/index.js';
import { setupWinstonService } from './winston/index.js';
import { setupSentryService } from './sentry/index.js';
import { setupNewRelicService } from './newrelic/index.js';
import { setupDatadogService } from './datadog/index.js';
import { setupPrometheusService } from './prometheus/index.js';
import { setupGrafanaService } from './grafana/index.js';
import { setupKibanaService } from './kibana/index.js';
import { setupElasticsearchService } from './elasticsearch/index.js';
import { setupRedisService } from './redis/index.js';
import { setupMemcachedService } from './memcached/index.js';
import { setupRabbitMQService } from './rabbitmq/index.js';
import { setupKafkaService } from './kafka/index.js';
import { setupZookeeperService } from './zookeeper/index.js';
import { setupConsulService } from './consul/index.js';
import { setupEtcdService } from './etcd/index.js';
import { setupVaultService } from './vault/index.js';
import { setupCertManagerService } from './cert-manager/index.js';
import { setupTraefikService } from './traefik/index.js';
import { setupNginxService } from './nginx/index.js';
import { setupApacheService } from './apache/index.js';
import { setupIISService } from './iis/index.js';
import { setupTomcatService } from './tomcat/index.js';
import { setupJettyService } from './jetty/index.js';
import { setupUndertowService } from './undertow/index.js';
import { setupNettyService } from './netty/index.js';
import { setupVertxService } from './vertx/index.js';
import { setupSpringService } from './spring/index.js';
import { setupDjangoService } from './django/index.js';
import { setupFlaskService } from './flask/index.js';
import { setupFastAPIService } from './fastapi/index.js';
import { setupLaravelService } from './laravel/index.js';
import { setupSymfonyService } from './symfony/index.js';
import { setupRailsService } from './rails/index.js';
import { setupSinatraService } from './sinatra/index.js';
import { setupExpressService } from './express/index.js';
import { setupKoaService } from './koa/index.js';
import { setupHapiService } from './hapi/index.js';
import { setupNestService } from './nest/index.js';
import { setupLoopbackService } from './loopback/index.js';
import { setupSailsService } from './sails/index.js';
import { setupMeteorService } from './meteor/index.js';
import { setupNextService } from './next/index.js';
import { setupNuxtService } from './nuxt/index.js';
import { setupGatsbyService } from './gatsby/index.js';
import { setupVueService } from './vue/index.js';
import { setupAngularService } from './angular/index.js';
import { setupReactService } from './react/index.js';
import { setupSvelteService } from './svelte/index.js';
import { setupAlpineService } from './alpine/index.js';
import { setupStimulusService } from './stimulus/index.js';
import { setupEmberService } from './ember/index.js';
import { setupBackboneService } from './backbone/index.js';
import { setupjQueryService } from './jquery/index.js';
import { setupBootstrapService } from './bootstrap/index.js';
import { setupTailwindService } from './tailwind/index.js';
import { setupBulmaService } from './bulma/index.js';
import { setupFoundationService } from './foundation/index.js';
import { setupMaterializeService } from './materialize/index.js';
import { setupSemanticService } from './semantic/index.js';
import { setupChakraService } from './chakra/index.js';
import { setupMantineService } from './mantine/index.js';
import { setupMUIService } from './mui/index.js';
import { setupAntdService } from './antd/index.js';
import { setupElementService } from './element/index.js';
import { setupVuetifyService } from './vuetify/index.js';
import { setupQuasarService } from './quasar/index.js';
import { setupPrimeService } from './prime/index.js';
import { setupKendoService } from './kendo/index.js';
import { setupDevExtremeService } from './devextreme/index.js';
import { setupTelerikService } from './telerik/index.js';
import { setupSyncfusionService } from './syncfusion/index.js';
import { setupIgniteService } from './ignite/index.js';
import { setupWijmoService } from './wijmo/index.js';
import { setupDxService } from './dx/index.js';
import { setupAgGridService } from './ag-grid/index.js';
import { setupHandsontableService } from './handsontable/index.js';
import { setupTabulatorService } from './tabulator/index.js';
import { setupJExcelService } from './jexcel/index.js';
import { setupJSpreadsheetService } from './jspreadsheet/index.js';
import { setupXLSXService } from './xlsx/index.js';
import { setupCSVService } from './csv/index.js';
import { setupPDFService } from './pdf/index.js';
import { setupDOCXService } from './docx/index.js';
import { setupRTFService } from './rtf/index.js';
import { setupODTService } from './odt/index.js';
import { setupEPUBService } from './epub/index.js';
import { setupMOBIService } from './mobi/index.js';
import { setupAZW3Service } from './azw3/index.js';
import { setupFB2Service } from './fb2/index.js';
import { setupLITService } from './lit/index.js';
import { setupLRFService } from './lrf/index.js';
import { setupPDBService } from './pdb/index.js';
import { setupTCRService } from './tcr/index.js';
import { setupSNBService } from './snb/index.js';
import { setupCBCService } from './cbc/index.js';
import { setupCBRService } from './cbr/index.js';
import { setupCBZService } from './cbz/index.js';
import { setupCBTService } from './cbt/index.js';
import { setupC7ZService } from './c7z/index.js';
import { setupRARService } from './rar/index.js';
import { setupZIPService } from './zip/index.js';
import { setupTARService } from './tar/index.js';
import { setupGZIPService } from './gzip/index.js';
import { setupBZIP2Service } from './bzip2/index.js';
import { setupXZService } from './xz/index.js';
import { setupLZMAService } from './lzma/index.js';
import { setupLZ4Service } from './lz4/index.js';
import { setupZSTDService } from './zstd/index.js';
import { setupBROTLIService } from './brotli/index.js';
import { setupDEFLATEService } from './deflate/index.js';
import { setupINFLATEService } from './inflate/index.js';
import { setupGZIPService as setupGZIPService2 } from './gzip2/index.js';
import { setupBZIP2Service as setupBZIP2Service2 } from './bzip22/index.js';
import { setupXZService as setupXZService2 } from './xz2/index.js';
import { setupLZMAService as setupLZMAService2 } from './lzma2/index.js';
import { setupLZ4Service as setupLZ4Service2 } from './lz42/index.js';
import { setupZSTDService as setupZSTDService2 } from './zstd2/index.js';
import { setupBROTLIService as setupBROTLIService2 } from './brotli2/index.js';
import { setupDEFLATEService as setupDEFLATEService2 } from './deflate2/index.js';
import { setupINFLATEService as setupINFLATEService2 } from './inflate2/index.js';

// Configurar variables de entorno
config();

// Obtener el equivalente a __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Validar variables de entorno requeridas
const requiredEnvVars = [
  'GOOGLE_OAUTH_CLIENT_ID',
  'GOOGLE_OAUTH_CLIENT_SECRET',
  'GOOGLE_OAUTH_REDIRECT_URI',
  'MONGODB_URI',
  'GEMINI_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Error: Faltan las siguientes variables de entorno requeridas:');
  missingEnvVars.forEach(envVar => console.error(`- ${envVar}`));
  process.exit(1);
}

const app = express();

// Middleware para logging de todas las peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configurar sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 horas
  }
}));

// Configurar Passport
app.use(passport.initialize());
app.use(passport.session());

// Configurar estrategia de Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_OAUTH_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URI!
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.create({
        googleId: profile.id,
        email: profile.emails?.[0].value,
        name: profile.displayName
      });
    }
    return done(null, user);
  } catch (error) {
    return done(error as Error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// Configuración de servido de archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  const publicPath = path.join(process.cwd(), 'dist', 'public');
  console.log('Public path:', publicPath);

  // Middleware de seguridad básica
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });

  // Servir assets con diferentes políticas de cache según el tipo
  app.use('/assets', express.static(path.join(publicPath, 'assets'), {
    maxAge: '30d',
    immutable: true,
    lastModified: true,
    etag: true,
    setHeaders: (res, path) => {
      if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // Servir otros archivos estáticos
  app.use(express.static(publicPath, {
    index: false,
    maxAge: '1d',
    lastModified: true,
    etag: true,
  }));
  
  // Middleware para manejar rutas del cliente (SPA)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    // No cache para index.html
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        console.error('Error sending index.html:', err);
        res.status(500).send('Error loading application');
      }
    });
  });
} else {
  // Configuración de desarrollo
  setupVite(app);
}

// Ruta de health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Servir archivos estáticos
app.use('/assets', express.static(path.join(process.env.ASSETS_PATH || '/app/dist/public/assets')));
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Inicializar servicios
const initializeServices = async () => {
  try {
    // Conectar a MongoDB
    await connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Inicializar servicios
    await Promise.all([
      setupWebSocket(app),
      setupWhatsApp(),
      setupEmailService(),
      setupVoiceService(),
      setupAIServices(),
      setupEmergencyService(),
      setupDocumentService(),
      setupLegalService(),
      setupStorageService(),
      setupAuthService(),
      setupUserService(),
      setupNotificationService(),
      setupAnalyticsService(),
      setupLoggingService(),
      setupMonitoringService(),
      setupSecurityService(),
      setupCacheService(),
      setupQueueService(),
      setupSearchService(),
      setupExportService(),
      setupImportService(),
      setupBackupService(),
      setupRestoreService(),
      setupMigrationService(),
      setupValidationService(),
      setupSanitizationService(),
      setupRateLimitService(),
      setupCorsService(),
      setupCompressionService(),
      setupHelmetService(),
      setupMorganService(),
      setupWinstonService(),
      setupSentryService(),
      setupNewRelicService(),
      setupDatadogService(),
      setupPrometheusService(),
      setupGrafanaService(),
      setupKibanaService(),
      setupElasticsearchService(),
      setupRedisService(),
      setupMemcachedService(),
      setupRabbitMQService(),
      setupKafkaService(),
      setupZookeeperService(),
      setupConsulService(),
      setupEtcdService(),
      setupVaultService(),
      setupCertManagerService(),
      setupTraefikService(),
      setupNginxService(),
      setupApacheService(),
      setupIISService(),
      setupTomcatService(),
      setupJettyService(),
      setupUndertowService(),
      setupNettyService(),
      setupVertxService(),
      setupSpringService(),
      setupDjangoService(),
      setupFlaskService(),
      setupFastAPIService(),
      setupLaravelService(),
      setupSymfonyService(),
      setupRailsService(),
      setupSinatraService(),
      setupExpressService(),
      setupKoaService(),
      setupHapiService(),
      setupNestService(),
      setupLoopbackService(),
      setupSailsService(),
      setupMeteorService(),
      setupNextService(),
      setupNuxtService(),
      setupGatsbyService(),
      setupVueService(),
      setupAngularService(),
      setupReactService(),
      setupSvelteService(),
      setupAlpineService(),
      setupStimulusService(),
      setupEmberService(),
      setupBackboneService(),
      setupjQueryService(),
      setupBootstrapService(),
      setupTailwindService(),
      setupBulmaService(),
      setupFoundationService(),
      setupMaterializeService(),
      setupSemanticService(),
      setupChakraService(),
      setupMantineService(),
      setupMUIService(),
      setupAntdService(),
      setupElementService(),
      setupVuetifyService(),
      setupQuasarService(),
      setupPrimeService(),
      setupKendoService(),
      setupDevExtremeService(),
      setupTelerikService(),
      setupSyncfusionService(),
      setupIgniteService(),
      setupWijmoService(),
      setupDxService(),
      setupAgGridService(),
      setupHandsontableService(),
      setupTabulatorService(),
      setupJExcelService(),
      setupJSpreadsheetService(),
      setupXLSXService(),
      setupCSVService(),
      setupPDFService(),
      setupDOCXService(),
      setupRTFService(),
      setupODTService(),
      setupEPUBService(),
      setupMOBIService(),
      setupAZW3Service(),
      setupFB2Service(),
      setupLITService(),
      setupLRFService(),
      setupPDBService(),
      setupTCRService(),
      setupSNBService(),
      setupCBCService(),
      setupCBRService(),
      setupCBZService(),
      setupCBTService(),
      setupC7ZService(),
      setupRARService(),
      setupZIPService(),
      setupTARService(),
      setupGZIPService(),
      setupBZIP2Service(),
      setupXZService(),
      setupLZMAService(),
      setupLZ4Service(),
      setupZSTDService(),
      setupBROTLIService(),
      setupDEFLATEService(),
      setupINFLATEService(),
      setupGZIPService2(),
      setupBZIP2Service2(),
      setupXZService2(),
      setupLZMAService2(),
      setupLZ4Service2(),
      setupZSTDService2(),
      setupBROTLIService2(),
      setupDEFLATEService2(),
      setupINFLATEService2()
    ]);

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
const startServer = async () => {
  try {
    await initializeServices();

    const port = process.env.PORT || 8080;
    const host = process.env.HOST || '0.0.0.0';

    app.listen(port, host, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode`);
      console.log(`Current working directory: ${process.cwd()}`);
      console.log(`Node environment: ${process.env.NODE_ENV}`);
      console.log(`Server listening on http://${host}:${port}`);
      console.log('MongoDB URI configured:', !!process.env.MONGODB_URI);
      console.log('Google OAuth configured:', !!process.env.GOOGLE_OAUTH_CLIENT_ID);
      console.log('Gemini API configured:', !!process.env.GEMINI_API_KEY);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Manejar señales de terminación
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Iniciar el servidor
startServer();
