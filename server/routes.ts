import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { 
  generateLogoVariations, 
  generateLogoImage, 
  analyzeLogoReference,
  generateLogoModifications 
} from "./openai";
import { insertLogoProjectSchema, insertCreditTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Object storage routes for file uploads
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Logo project routes
  app.post("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const projectData = insertLogoProjectSchema.parse({
        ...req.body,
        userId,
      });

      const project = await storage.createLogoProject(projectData);
      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid project data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create project" });
    }
  });

  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const projects = await storage.getUserLogoProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const project = await storage.getLogoProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      if (project.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  // Logo generation routes
  app.post("/api/generate-logos", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.credits || 0) < 1) {
        return res.status(400).json({ error: "Insufficient credits" });
      }

      const { businessName, description, style, industry, colors } = req.body;
      
      // Generate logo variations using OpenAI
      const variations = await generateLogoVariations({
        businessName,
        description,
        style,
        industry,
        colors,
      });

      // Generate images for each variation
      const generatedLogos = await Promise.all(
        variations.map(async (variation) => {
          try {
            const imageResult = await generateLogoImage(variation);
            return {
              ...variation,
              imageUrl: imageResult.url,
              generated: true,
            };
          } catch (error) {
            console.error(`Error generating image for variation ${variation.id}:`, error);
            return {
              ...variation,
              imageUrl: null,
              generated: false,
              error: "Failed to generate image",
            };
          }
        })
      );

      // Deduct credit
      await storage.updateUserCredits(userId, (user.credits || 0) - 1);
      await storage.createCreditTransaction({
        userId,
        type: "usage",
        amount: -1,
        description: "Logo generation",
      });

      res.json({ logos: generatedLogos });
    } catch (error) {
      console.error("Error generating logos:", error);
      res.status(500).json({ error: "Failed to generate logos" });
    }
  });

  app.post("/api/analyze-reference", isAuthenticated, async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: "Image data required" });
      }

      const analysis = await analyzeLogoReference(imageBase64);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing reference:", error);
      res.status(500).json({ error: "Failed to analyze reference image" });
    }
  });

  app.post("/api/modify-logo", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.credits || 0) < 1) {
        return res.status(400).json({ error: "Insufficient credits" });
      }

      const { originalConcept, modifications } = req.body;
      
      const modifiedLogo = await generateLogoModifications(originalConcept, modifications);
      
      // Generate image for modified logo
      const imageResult = await generateLogoImage(modifiedLogo);
      
      // Deduct credit
      await storage.updateUserCredits(userId, (user.credits || 0) - 1);
      await storage.createCreditTransaction({
        userId,
        type: "usage",
        amount: -1,
        description: "Logo modification",
      });

      res.json({
        ...modifiedLogo,
        imageUrl: imageResult.url,
      });
    } catch (error) {
      console.error("Error modifying logo:", error);
      res.status(500).json({ error: "Failed to modify logo" });
    }
  });

  // Credit and export routes
  app.post("/api/export-logo", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.credits || 0) < 3) {
        return res.status(400).json({ error: "Insufficient credits (3 required)" });
      }

      const { logoData, projectId } = req.body;

      // In a real implementation, this would generate high-res files
      // For now, we'll simulate the export process
      const exportData = {
        logoId: logoData.id,
        formats: ['PNG', 'SVG', 'PDF', 'JPG'],
        resolutions: ['256x256', '512x512', '1024x1024', '2048x2048'],
        exportedAt: new Date().toISOString(),
      };

      // Deduct credits
      await storage.updateUserCredits(userId, (user.credits || 0) - 3);
      await storage.createCreditTransaction({
        userId,
        type: "usage",
        amount: -3,
        description: "Logo export",
        relatedProjectId: projectId,
      });

      res.json({
        success: true,
        export: exportData,
        message: "Logo exported successfully",
      });
    } catch (error) {
      console.error("Error exporting logo:", error);
      res.status(500).json({ error: "Failed to export logo" });
    }
  });

  app.get("/api/credits", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);
      const transactions = await storage.getUserCreditTransactions(userId);
      
      res.json({
        currentCredits: user?.credits || 0,
        transactions: transactions.slice(0, 10), // Last 10 transactions
      });
    } catch (error) {
      console.error("Error fetching credits:", error);
      res.status(500).json({ error: "Failed to fetch credits" });
    }
  });

  // Asset upload handling
  app.put("/api/logo-assets", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { assetURL, projectId, type, fileName, mimeType, fileSize } = req.body;

      if (!assetURL || !projectId || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        assetURL,
        {
          owner: userId,
          visibility: "private",
        },
      );

      const asset = await storage.createLogoAsset({
        projectId,
        userId,
        type,
        filePath: objectPath,
        fileName: fileName || "uploaded-asset",
        mimeType: mimeType || "image/png",
        fileSize: fileSize || 0,
        isPublic: false,
      });

      res.json({ asset, objectPath });
    } catch (error) {
      console.error("Error handling asset upload:", error);
      res.status(500).json({ error: "Failed to process asset upload" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
