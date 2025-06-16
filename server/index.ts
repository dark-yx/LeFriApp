import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Set environment variables if not already set
if (!process.env.GOOGLE_OAUTH_CLIENT_ID) {
  process.env.GOOGLE_OAUTH_CLIENT_ID = "98044249097-nb4uke2c4kqtdpugfh3k7j389lnrpk0u.apps.googleusercontent.com";
}
if (!process.env.GOOGLE_OAUTH_CLIENT_SECRET) {
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = "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";
}
if (!process.env.GOOGLE_OAUTH_REDIRECT_URI) {
  process.env.GOOGLE_OAUTH_REDIRECT_URI = "https://13bdfc0f-2930-480d-ac76-0397ba470571-00-9cq2i952niuv.picard.replit.dev/api/auth/google/callback";
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb+srv://jonnathanyosue:DONEVEK.11jpHH@lefri-ai.vbqbw0d.mongodb.net/?retryWrites=true&w=majority&appName=LeFri-AI";
}
if (!process.env.GEMINI_API_KEY) {
  process.env.GEMINI_API_KEY = "AIzaSyCHPpG55-utIIm063_EzTgD7FRZjfftd0s";
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  log(`Error: ${message}`);
  res.status(status).json({ message });
});

(async () => {
  try {
    const server = await registerRoutes(app);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT || 8080;
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      log(`Servidor iniciado en el puerto ${port}`);
    });

    process.on('SIGTERM', () => {
      log('Recibida señal SIGTERM, cerrando servidor...');
      server.close(() => {
        log('Servidor cerrado');
        process.exit(0);
      });
    });

  } catch (error) {
    log(`Error al iniciar el servidor: ${error}`);
    process.exit(1);
  }
})();
