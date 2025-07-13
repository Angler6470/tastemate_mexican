import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { protectRoute, adminOnly, comparePassword, generateToken, hashPassword } from "./middleware/auth";
import { generateFoodRecommendations, generateSurpriseRecommendation } from "./services/openai";
import { insertUserSchema, insertFlavorSchema, insertSpicinessSchema, insertPromoSchema, insertMenuItemSchema, insertThemeSchema, insertHotkeySchema, chatRequestSchema } from "@shared/schema";
import type { AuthenticatedRequest } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user);
      res.json({ token, user: { _id: user._id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Public routes
  app.get("/api/flavors", async (req, res) => {
    try {
      const flavors = await storage.getFlavors();
      res.json(flavors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flavors" });
    }
  });

  app.get("/api/spiciness", async (req, res) => {
    try {
      const spiciness = await storage.getAllSpiciness();
      res.json(spiciness);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch spiciness levels" });
    }
  });

  app.get("/api/promos", async (req, res) => {
    try {
      const promos = await storage.getPromos();
      res.json(promos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch promos" });
    }
  });

  app.get("/api/menuitems", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.get("/api/themes", async (req, res) => {
    try {
      const themes = await storage.getThemes();
      res.json(themes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch themes" });
    }
  });

  app.get("/api/hotkeys", async (req, res) => {
    try {
      const hotkeys = await storage.getHotkeys();
      res.json(hotkeys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch hotkeys" });
    }
  });

  // Chat route
  app.post("/api/chat", async (req, res) => {
    try {
      const chatRequest = chatRequestSchema.parse(req.body);
      const menuItems = await storage.getMenuItems();
      const response = await generateFoodRecommendations(chatRequest, menuItems);
      res.json(response);
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat request" });
    }
  });

  // Surprise route
  app.post("/api/surprise", async (req, res) => {
    try {
      const { spiceLevel, flavors, language } = req.body;
      const menuItems = await storage.getMenuItems();
      const response = await generateSurpriseRecommendation(spiceLevel, flavors, language, menuItems);
      res.json(response);
    } catch (error) {
      console.error("Surprise error:", error);
      res.status(500).json({ message: "Failed to process surprise request" });
    }
  });

  // Protected admin routes
  app.use("/api/admin", protectRoute);
  app.use("/api/admin", adminOnly);

  // Admin flavor routes
  app.get("/api/admin/flavors", async (req: AuthenticatedRequest, res) => {
    try {
      const flavors = await storage.getFlavors();
      res.json(flavors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch flavors" });
    }
  });

  app.post("/api/admin/flavors", async (req: AuthenticatedRequest, res) => {
    try {
      const flavorData = insertFlavorSchema.parse(req.body);
      const flavor = await storage.createFlavor(flavorData);
      res.status(201).json(flavor);
    } catch (error) {
      res.status(400).json({ message: "Invalid flavor data" });
    }
  });

  app.put("/api/admin/flavors/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const flavorData = insertFlavorSchema.partial().parse(req.body);
      const flavor = await storage.updateFlavor(req.params.id, flavorData);
      if (!flavor) {
        return res.status(404).json({ message: "Flavor not found" });
      }
      res.json(flavor);
    } catch (error) {
      res.status(400).json({ message: "Invalid flavor data" });
    }
  });

  app.delete("/api/admin/flavors/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteFlavor(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Flavor not found" });
      }
      res.json({ message: "Flavor deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete flavor" });
    }
  });

  // Admin menu item routes
  app.post("/api/admin/menuitems", async (req: AuthenticatedRequest, res) => {
    try {
      const menuItemData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(menuItemData);
      res.status(201).json(menuItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data" });
    }
  });

  app.put("/api/admin/menuitems/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const menuItemData = insertMenuItemSchema.partial().parse(req.body);
      const menuItem = await storage.updateMenuItem(req.params.id, menuItemData);
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json(menuItem);
    } catch (error) {
      res.status(400).json({ message: "Invalid menu item data" });
    }
  });

  app.delete("/api/admin/menuitems/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteMenuItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Admin promo routes
  app.post("/api/admin/promos", async (req: AuthenticatedRequest, res) => {
    try {
      const promoData = insertPromoSchema.parse(req.body);
      const promo = await storage.createPromo(promoData);
      res.status(201).json(promo);
    } catch (error) {
      res.status(400).json({ message: "Invalid promo data" });
    }
  });

  app.put("/api/admin/promos/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const promoData = insertPromoSchema.partial().parse(req.body);
      const promo = await storage.updatePromo(req.params.id, promoData);
      if (!promo) {
        return res.status(404).json({ message: "Promo not found" });
      }
      res.json(promo);
    } catch (error) {
      res.status(400).json({ message: "Invalid promo data" });
    }
  });

  app.delete("/api/admin/promos/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deletePromo(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Promo not found" });
      }
      res.json({ message: "Promo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete promo" });
    }
  });

  // Admin theme routes
  app.post("/api/admin/themes", async (req: AuthenticatedRequest, res) => {
    try {
      const themeData = insertThemeSchema.parse(req.body);
      const theme = await storage.createTheme(themeData);
      res.status(201).json(theme);
    } catch (error) {
      res.status(400).json({ message: "Invalid theme data" });
    }
  });

  app.put("/api/admin/themes/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const themeData = insertThemeSchema.partial().parse(req.body);
      const theme = await storage.updateTheme(req.params.id, themeData);
      if (!theme) {
        return res.status(404).json({ message: "Theme not found" });
      }
      res.json(theme);
    } catch (error) {
      res.status(400).json({ message: "Invalid theme data" });
    }
  });

  app.delete("/api/admin/themes/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteTheme(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Theme not found" });
      }
      res.json({ message: "Theme deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete theme" });
    }
  });

  // Admin hotkey routes
  app.post("/api/admin/hotkeys", async (req: AuthenticatedRequest, res) => {
    try {
      const hotkeyData = insertHotkeySchema.parse(req.body);
      const hotkey = await storage.createHotkey(hotkeyData);
      res.status(201).json(hotkey);
    } catch (error) {
      res.status(400).json({ message: "Invalid hotkey data" });
    }
  });

  app.put("/api/admin/hotkeys/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const hotkeyData = insertHotkeySchema.partial().parse(req.body);
      const hotkey = await storage.updateHotkey(req.params.id, hotkeyData);
      if (!hotkey) {
        return res.status(404).json({ message: "Hotkey not found" });
      }
      res.json(hotkey);
    } catch (error) {
      res.status(400).json({ message: "Invalid hotkey data" });
    }
  });

  app.delete("/api/admin/hotkeys/:id", async (req: AuthenticatedRequest, res) => {
    try {
      const success = await storage.deleteHotkey(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Hotkey not found" });
      }
      res.json({ message: "Hotkey deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete hotkey" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
