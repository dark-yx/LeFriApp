import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertEmergencyContactSchema, insertLegalProcessSchema, insertConsultationSchema, insertEmergencyAlertSchema } from "@shared/schema";
import { geminiService } from "./services/gemini";
import { constituteService } from "./services/constitute";
import { whatsAppService } from "./services/whatsapp";
import { emailService } from "./services/email";
import { voiceService } from "./services/voice";
import { multiAgentService } from "./services/multi-agent";
import { googleAuthService } from "./services/google-auth";
import { connectToDatabase } from "./db";
import multer from 'multer';
import puppeteer from 'puppeteer';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to MongoDB
  await connectToDatabase();

  // Session configuration
  app.use(session({
    secret: process.env.SESSION_SECRET || 'lefri-ai-session-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/lefri-ai',
    }),
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }));

  // Configure multer for file uploads
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  });

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    req.userId = req.session.userId;
    next();
  };

  // Authentication endpoints
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: 'Authorization code required' });
      }

      // Get user info from Google
      const googleUser = await googleAuthService.getUserInfo(code);
      
      let user = await storage.getUserByGoogleId(googleUser.id);
      if (!user) {
        user = await storage.getUserByEmail(googleUser.email);
        if (!user) {
          user = await storage.createUser({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.id,
            language: "es",
            country: "EC"
          });
        } else {
          // Update existing user with Google ID
          user = await storage.updateUser(user.id, { googleId: googleUser.id });
        }
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });
      
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // Google OAuth URL endpoint
  app.get("/api/auth/google/url", (req, res) => {
    try {
      const authUrl = googleAuthService.getAuthUrl();
      res.json({ authUrl });
    } catch (error) {
      console.error('Error generating Google OAuth URL:', error);
      res.status(500).json({ error: 'Failed to generate OAuth URL' });
    }
  });

  // Manual login endpoint
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // In a real app, verify password hash here
      // For now, we'll accept any password for demo purposes
      
      // Set session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });
      
      res.json({ user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // Manual registration endpoint
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, country = "EC", language = "es" } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists' });
      }

      // Create new user
      const user = await storage.createUser({
        email,
        name,
        language,
        country,
        // In a real app, hash the password here
      });
      
      // Set session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
        }
      });
      
      res.json({ user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  // Google OAuth callback handler
  app.get("/api/auth/google/callback", async (req, res) => {
    try {
      const { code } = req.query;
      
      if (!code) {
        return res.redirect('/login?error=no_code');
      }

      // Get user info from Google
      const googleUser = await googleAuthService.getUserInfo(code as string);
      
      let user = await storage.getUserByGoogleId(googleUser.id);
      if (!user) {
        user = await storage.getUserByEmail(googleUser.email);
        if (!user) {
          user = await storage.createUser({
            email: googleUser.email,
            name: googleUser.name,
            googleId: googleUser.id,
            language: "es",
            country: "EC"
          });
        } else {
          // Update existing user with Google ID
          user = await storage.updateUser(user.id, { googleId: googleUser.id });
        }
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.redirect('/login?error=session');
        }
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // Legal consultation endpoints with streaming
  app.post("/api/ask", requireAuth, async (req: any, res) => {
    try {
      const { query, country, language } = req.body;
      
      // Set headers for Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      // Get relevant constitutional articles
      const constitutionalArticles = await constituteService.getRelevantArticles({
        query,
        country,
        language: language || "es",
        limit: 3
      });

      // Create citations from constitutional articles
      const citations = constitutionalArticles.map((article, index) => ({
        title: `Artículo Constitucional ${index + 1}`,
        url: `#article-${index + 1}`,
        relevance: Math.max(95 - index * 5, 75)
      }));

      // Add fallback citations if no constitutional articles found
      if (citations.length === 0) {
        citations.push(
          { title: "Constitución Nacional", url: "#", relevance: 90 },
          { title: "Código Civil", url: "#", relevance: 85 }
        );
      }

      // Send initial data
      res.write(`data: ${JSON.stringify({ 
        type: 'citations', 
        data: { citations, constitutionalArticles: constitutionalArticles.slice(0, 2) }
      })}\n\n`);

      // Generate AI response with streaming
      const aiResponse = await geminiService.generateLegalResponseStream({
        query,
        country: country || "EC",
        language: language || "es",
        constitutionalArticles,
        onChunk: (chunk: string) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', data: chunk })}\n\n`);
        }
      });
      
      // Save consultation
      await storage.createConsultation({
        userId: req.userId,
        query,
        response: aiResponse.text,
        country: country || "EC",
        language: language || "es"
      });

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        type: 'complete', 
        data: { 
          confidence: aiResponse.error ? 0.5 : 0.92
        } 
      })}\n\n`);
      
      res.end();
    } catch (error) {
      console.error('Consultation error:', error);
      res.write(`data: ${JSON.stringify({ 
        type: 'error', 
        data: { error: "Failed to process consultation" }
      })}\n\n`);
      res.end();
    }
  });

  // Emergency endpoints
  app.post("/api/emergency", requireAuth, async (req: any, res) => {
    try {
      const { latitude, longitude, address } = req.body;
      
      // Get user and contacts
      const user = await storage.getUser(req.userId);
      const contacts = await storage.getEmergencyContacts(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate emergency message with AI
      const emergencyMessage = await geminiService.generateEmergencyMessage({
        userName: user.name,
        location: { latitude, longitude, address },
        language: user.language
      });

      // Send WhatsApp alerts
      const whatsappContacts = contacts.filter(contact => contact.whatsappEnabled);
      const whatsappResults = await whatsAppService.sendEmergencyAlert({
        contacts: whatsappContacts.map(c => ({ phone: c.phone, name: c.name })),
        message: emergencyMessage.text,
        location: { latitude, longitude }
      });

      // Send email alerts to all contacts
      const emailResults = [];
      for (const contact of contacts) {
        if (contact.phone.includes('@')) { // Assuming email format
          const emailResult = await emailService.sendEmergencyEmail({
            to: contact.phone,
            userName: user.name,
            message: emergencyMessage.text,
            location: { latitude, longitude, address }
          });
          emailResults.push({
            phone: contact.phone,
            name: contact.name,
            success: emailResult.success,
            error: emailResult.error
          });
        }
      }

      // Combine results
      const allResults = [...whatsappResults, ...emailResults];
      const contactsNotified = allResults.map(result => ({
        id: Date.now() + Math.random(),
        name: result.name,
        phone: result.phone,
        status: result.success ? "sent" : "failed",
        sentAt: new Date().toISOString(),
        error: result.error
      }));
      
      // Save emergency alert
      await storage.createEmergencyAlert({
        userId: req.userId,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
        address,
        contactsNotified,
        status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed"
      });
      
      res.json({
        status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed",
        contactsNotified,
        location: { latitude, longitude, address },
        message: emergencyMessage.text
      });
    } catch (error) {
      console.error('Emergency alert error:', error);
      res.status(500).json({ error: "Failed to send emergency alert" });
    }
  });

  // Emergency contacts endpoints
  app.get("/api/emergency-contacts", requireAuth, async (req: any, res) => {
    try {
      const contacts = await storage.getEmergencyContacts(req.userId);
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to get emergency contacts" });
    }
  });

  app.post("/api/emergency-contacts", requireAuth, async (req: any, res) => {
    try {
      const data = insertEmergencyContactSchema.parse({
        ...req.body,
        userId: req.userId
      });
      const contact = await storage.createEmergencyContact(data);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });

  app.put("/api/emergency-contacts/:id", requireAuth, async (req: any, res) => {
    try {
      const contact = await storage.updateEmergencyContact(req.params.id, req.body);
      res.json(contact);
    } catch (error) {
      res.status(500).json({ error: "Failed to update contact" });
    }
  });

  app.delete("/api/emergency-contacts/:id", requireAuth, async (req: any, res) => {
    try {
      await storage.deleteEmergencyContact(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });

  // Legal processes endpoints
  app.get("/api/processes", requireAuth, async (req: any, res) => {
    try {
      const processes = await storage.getLegalProcesses(req.userId);
      res.json(processes);
    } catch (error) {
      res.status(500).json({ error: "Failed to get processes" });
    }
  });

  app.post("/api/processes", requireAuth, async (req: any, res) => {
    try {
      const { title, type, description, priority, deadline } = req.body;
      
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Generate initial process structure with AI
      const processSteps = await geminiService.generateProcessStep({
        processType: type,
        currentStep: 0,
        userData: {
          title,
          description,
          priority,
          deadline
        },
        language: user.language || "es"
      });

      // Create default steps based on process type
      const defaultSteps = [
        {
          id: "1",
          title: "Análisis inicial del caso",
          description: "Revisar documentación y evaluar viabilidad legal",
          completed: false,
          documents: ["Identificación", "Documentos relevantes al caso"],
          requirements: ["Recopilar toda la documentación necesaria", "Analizar fundamentos legales"]
        },
        {
          id: "2", 
          title: "Preparación de documentos",
          description: "Elaborar escritos y formularios necesarios",
          completed: false,
          documents: ["Demanda", "Poderes", "Anexos"],
          requirements: ["Redactar demanda principal", "Obtener poderes notariales"]
        },
        {
          id: "3",
          title: "Presentación formal",
          description: "Radicar documentos ante autoridad competente",
          completed: false,
          documents: ["Constancia de radicación"],
          requirements: ["Presentar en término legal", "Pagar tasas judiciales"]
        },
        {
          id: "4",
          title: "Seguimiento procesal",
          description: "Monitorear avances y cumplir términos",
          completed: false,
          documents: ["Notificaciones", "Providencias"],
          requirements: ["Revisar términos procesales", "Responder requerimientos"]
        },
        {
          id: "5",
          title: "Finalización",
          description: "Obtener resolución y ejecutar si es necesario",
          completed: false,
          documents: ["Sentencia", "Liquidación"],
          requirements: ["Evaluar resultado", "Ejecutar si procede"]
        }
      ];

      // Get constitutional articles
      const constitutionalArticles = await constituteService.getRelevantArticles({
        query: description || title,
        country: user.country || "EC",
        language: user.language || "es",
        limit: 3
      });

      const processData = {
        userId: req.userId,
        title,
        type,
        description: description || "",
        status: "pending",
        progress: 0,
        currentStep: 0,
        totalSteps: 5,
        steps: defaultSteps,
        requiredDocuments: [
          "Documento de identidad",
          "Documentos que soporten la pretensión",
          "Poderes (si aplica)",
          "Pruebas documentales"
        ],
        legalBasis: processSteps.text || `Proceso de ${type} conforme a la normativa vigente`,
        constitutionalArticles: constitutionalArticles.slice(0, 3),
        timeline: "El proceso puede tomar entre 6 meses y 2 años dependiendo de la complejidad",
        metadata: {
          priority: priority || 'medium',
          deadline: deadline || '',
          caseNumber: '',
          court: '',
          judge: '',
          opposingParty: '',
          amount: ''
        }
      };

      const process = await storage.createLegalProcess(processData);
      res.json(process);
    } catch (error) {
      console.error('Process creation error:', error);
      res.status(500).json({ error: "Failed to create process" });
    }
  });

  app.get("/api/processes/:id", requireAuth, async (req: any, res) => {
    try {
      const process = await storage.getLegalProcess(req.params.id);
      if (!process) {
        return res.status(404).json({ error: "Process not found" });
      }
      res.json(process);
    } catch (error) {
      res.status(500).json({ error: "Failed to get process" });
    }
  });

  app.patch("/api/processes/:id", requireAuth, async (req: any, res) => {
    try {
      const updates = req.body;
      const process = await storage.updateLegalProcess(req.params.id, updates);
      res.json(process);
    } catch (error) {
      res.status(500).json({ error: "Failed to update process" });
    }
  });

  app.post("/api/processes/:id/generate-document", requireAuth, async (req: any, res) => {
    try {
      const { country } = req.body;
      const process = await storage.getLegalProcess(req.params.id);
      
      if (!process) {
        return res.status(404).json({ error: "Process not found" });
      }

      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get constitutional articles related to the process
      const constitutionalArticles = await constituteService.getRelevantArticles({
        query: process.description || process.title,
        country: country || user.country,
        language: user.language || "es",
        limit: 5
      });

      // Generate comprehensive legal document with AI
      const documentContent = await geminiService.generateProcessStep({
        processType: process.type,
        currentStep: process.currentStep,
        userData: {
          title: process.title,
          description: process.description || "",
          totalSteps: process.totalSteps,
          constitutionalArticles,
          metadata: process.metadata
        },
        language: user.language || "es"
      });

      // Create PDF-like content (in a real app, you'd use a PDF library)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${process.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h2 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .metadata { background-color: #f5f5f5; padding: 15px; border-radius: 5px; }
            .legal-basis { background-color: #e8f4f8; padding: 15px; border-left: 4px solid #007acc; }
            .steps { list-style-type: decimal; }
            .steps li { margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${process.title}</h1>
            <p>Documento Legal Generado - ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2>Información del Proceso</h2>
            <div class="metadata">
              <p><strong>Tipo:</strong> ${process.type}</p>
              <p><strong>Estado:</strong> ${process.status}</p>
              <p><strong>Progreso:</strong> ${process.currentStep}/${process.totalSteps} pasos</p>
              ${process.metadata?.caseNumber ? `<p><strong>Número de Caso:</strong> ${process.metadata.caseNumber}</p>` : ''}
              ${process.metadata?.court ? `<p><strong>Tribunal:</strong> ${process.metadata.court}</p>` : ''}
              ${process.metadata?.judge ? `<p><strong>Juez:</strong> ${process.metadata.judge}</p>` : ''}
            </div>
          </div>

          <div class="section">
            <h2>Descripción del Caso</h2>
            <p>${process.description || 'Sin descripción disponible'}</p>
          </div>

          <div class="section">
            <h2>Fundamento Legal y Constitucional</h2>
            <div class="legal-basis">
              ${documentContent.text}
            </div>
          </div>

          <div class="section">
            <h2>Artículos Constitucionales Relevantes</h2>
            ${constitutionalArticles.map((article, index) => `
              <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #ddd;">
                <h4>Artículo ${index + 1}</h4>
                <p>${article}</p>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Plan de Acción Recomendado</h2>
            <ol class="steps">
              <li>Recopilación de documentación necesaria</li>
              <li>Preparación de escritos legales</li>
              <li>Presentación ante autoridad competente</li>
              <li>Seguimiento del proceso</li>
              <li>Ejecución de resolución</li>
            </ol>
          </div>

          <div class="section">
            <h2>Recomendaciones</h2>
            <ul>
              <li>Mantener toda la documentación organizada</li>
              <li>Cumplir estrictamente con los plazos legales</li>
              <li>Consultar con abogado especializado si es necesario</li>
              <li>Documentar todas las comunicaciones</li>
            </ul>
          </div>
        </body>
        </html>
      `;

      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
      });
      
      await browser.close();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${process.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf"`);
      res.send(pdfBuffer);
      
    } catch (error) {
      console.error('Document generation error:', error);
      res.status(500).json({ error: "Failed to generate document" });
    }
  });

  // User profile endpoints
  app.put("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const updates = req.body;
      const user = await storage.updateUser(req.userId, updates);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // Activity endpoints
  app.get("/api/consultations", requireAuth, async (req: any, res) => {
    try {
      const consultations = await storage.getConsultations(req.userId);
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ error: "Failed to get consultations" });
    }
  });

  // Voice recording endpoints
  app.post("/api/voice/upload", requireAuth, upload.single('audio'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      const { type = 'emergency' } = req.body;
      const recording = await voiceService.saveVoiceRecording({
        userId: req.userId,
        audioBuffer: req.file.buffer,
        type,
        originalName: req.file.originalname
      });

      res.json({
        id: recording.id,
        url: voiceService.getVoiceRecordingUrl(recording.id),
        filename: recording.filename
      });
    } catch (error) {
      console.error('Voice upload error:', error);
      res.status(500).json({ error: "Failed to save voice recording" });
    }
  });

  app.get("/api/voice/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const audioBuffer = await voiceService.getVoiceRecording(id);
      
      if (!audioBuffer) {
        return res.status(404).json({ error: "Voice recording not found" });
      }

      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Content-Disposition', `inline; filename="${id}.mp3"`);
      res.send(audioBuffer);
    } catch (error) {
      console.error('Voice retrieval error:', error);
      res.status(500).json({ error: "Failed to retrieve voice recording" });
    }
  });

  // Process-specific chat endpoint with multi-agent AI
  app.post("/api/processes/:id/chat", requireAuth, async (req: any, res) => {
    try {
      const { query } = req.body;
      const processId = req.params.id;
      
      const process = await storage.getLegalProcess(processId);
      if (!process) {
        return res.status(404).json({ error: "Process not found" });
      }

      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const context = {
        processId: process.id,
        title: process.title,
        type: process.type,
        description: process.description || "",
        currentStep: process.currentStep || 0,
        totalSteps: process.totalSteps || 5,
        metadata: process.metadata,
        country: user.country || "EC",
        language: user.language || "es"
      };

      const response = await multiAgentService.processChat(query, context);
      
      res.json({
        response: response.text,
        confidence: response.confidence,
        citations: response.citations,
        nextSteps: response.nextSteps,
        error: response.error
      });
    } catch (error) {
      console.error('Process chat error:', error);
      res.status(500).json({ error: "Failed to process chat" });
    }
  });

  // Enhanced emergency endpoint with voice recording
  app.post("/api/emergency/with-voice", upload.single('voiceNote'), async (req: any, res) => {
    try {
      const { latitude, longitude, address } = req.body;
      const userId = req.headers['x-user-id'] || req.body.userId || '66a1b2c3d4e5f6789abc1234';
      
      // Get user and contacts
      const user = await storage.getUser(userId);
      const contacts = await storage.getEmergencyContacts(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Save voice recording if provided
      let voiceRecording = null;
      if (req.file) {
        voiceRecording = await voiceService.saveVoiceRecording({
          userId: userId,
          audioBuffer: req.file.buffer,
          type: 'emergency',
          originalName: req.file.originalname
        });
      }

      // Generate emergency message
      const emergencyMessage = await geminiService.generateEmergencyMessage({
        userName: user.name,
        location: { latitude, longitude, address },
        language: user.language
      });

      // Send WhatsApp alerts with voice note
      const whatsappContacts = contacts.filter(contact => contact.whatsappEnabled);
      const voiceUrl = voiceRecording ? `${process.env.APP_URL || 'http://localhost:5000'}${voiceService.getVoiceRecordingUrl(voiceRecording.id)}` : undefined;
      
      const whatsappResults = await whatsAppService.sendEmergencyAlert({
        contacts: whatsappContacts.map(c => ({ phone: c.phone, name: c.name })),
        message: emergencyMessage.text,
        location: { latitude, longitude },
        voiceNoteUrl: voiceUrl
      });

      // Send email alerts with voice attachment
      const emailResults = [];
      for (const contact of contacts) {
        if (contact.phone.includes('@')) {
          const emailResult = await emailService.sendEmergencyEmail({
            to: contact.phone,
            userName: user.name,
            message: emergencyMessage.text,
            location: { latitude, longitude, address },
            voiceNoteAttachment: voiceRecording ? {
              filename: voiceRecording.filename,
              content: await voiceService.getVoiceRecording(voiceRecording.id) || Buffer.alloc(0)
            } : undefined
          });
          emailResults.push({
            phone: contact.phone,
            name: contact.name,
            success: emailResult.success,
            error: emailResult.error
          });
        }
      }

      // Combine results
      const allResults = [...whatsappResults, ...emailResults];
      const contactsNotified = allResults.map(result => ({
        id: Date.now() + Math.random(),
        name: result.name,
        phone: result.phone,
        status: result.success ? "sent" : "failed",
        sentAt: new Date().toISOString(),
        error: result.error
      }));
      
      // Save emergency alert
      await storage.createEmergencyAlert({
        userId: req.userId,
        latitude: latitude?.toString(),
        longitude: longitude?.toString(),
        address,
        contactsNotified,
        status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed"
      });
      
      res.json({
        status: contactsNotified.some(c => c.status === "sent") ? "sent" : "failed",
        contactsNotified,
        location: { latitude, longitude, address },
        message: emergencyMessage.text,
        voiceRecording: voiceRecording ? {
          id: voiceRecording.id,
          url: voiceService.getVoiceRecordingUrl(voiceRecording.id)
        } : null
      });
    } catch (error) {
      console.error('Emergency with voice error:', error);
      res.status(500).json({ error: "Failed to send emergency alert with voice" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
