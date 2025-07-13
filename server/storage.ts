import { ObjectId } from 'mongodb';
import { connectToDatabase, getCollection } from './services/mongodb';
import type { User, Flavor, Spiciness, Promo, MenuItem, Theme, Hotkey, InsertUser, InsertFlavor, InsertSpiciness, InsertPromo, InsertMenuItem, InsertTheme, InsertHotkey } from '@shared/schema';

// In-memory storage for fallback when MongoDB is not available
const inMemoryStorage = {
  users: [] as User[],
  flavors: [] as Flavor[],
  spiciness: [] as Spiciness[],
  promos: [] as Promo[],
  menuItems: [] as MenuItem[],
  themes: [] as Theme[],
  hotkeys: [] as Hotkey[],
  initialized: false,
};

// Initialize with demo data
function initializeDemoData() {
  if (inMemoryStorage.initialized) return;
  
  // Demo users
  inMemoryStorage.users = [
    {
      _id: "admin-user-1",
      username: "admin",
      password: "$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: admin123
      role: "admin",
      createdAt: new Date(),
    }
  ];

  // Demo spiciness levels
  inMemoryStorage.spiciness = [
    { _id: "spice-1", level: 0, name: "mild", emoji: "😊", translations: { en: "Mild", es: "Suave" }, active: true, createdAt: new Date() },
    { _id: "spice-2", level: 1, name: "medium", emoji: "🌶️", translations: { en: "Medium", es: "Medio" }, active: true, createdAt: new Date() },
    { _id: "spice-3", level: 2, name: "hot", emoji: "🔥", translations: { en: "Hot", es: "Picante" }, active: true, createdAt: new Date() },
    { _id: "spice-4", level: 3, name: "spicy", emoji: "🌋", translations: { en: "Spicy", es: "Muy Picante" }, active: true, createdAt: new Date() },
    { _id: "spice-5", level: 4, name: "extreme", emoji: "💀", translations: { en: "Extreme", es: "Extremo" }, active: true, createdAt: new Date() },
    { _id: "spice-6", level: 5, name: "insane", emoji: "☠️", translations: { en: "Insane", es: "Loco" }, active: true, createdAt: new Date() },
  ];

  // Demo flavors
  inMemoryStorage.flavors = [
    { _id: "flavor-1", name: "sweet", emoji: "🍯", hotkey: "s", translations: { en: "Sweet", es: "Dulce" }, active: true, createdAt: new Date() },
    { _id: "flavor-2", name: "salty", emoji: "🧂", hotkey: "a", translations: { en: "Salty", es: "Salado" }, active: true, createdAt: new Date() },
    { _id: "flavor-3", name: "sour", emoji: "🍋", hotkey: "r", translations: { en: "Sour", es: "Agrio" }, active: true, createdAt: new Date() },
    { _id: "flavor-4", name: "bitter", emoji: "☕", hotkey: "b", translations: { en: "Bitter", es: "Amargo" }, active: true, createdAt: new Date() },
    { _id: "flavor-5", name: "umami", emoji: "🍄", hotkey: "u", translations: { en: "Umami", es: "Umami" }, active: true, createdAt: new Date() },
    { _id: "flavor-6", name: "creamy", emoji: "🥛", hotkey: "c", translations: { en: "Creamy", es: "Cremoso" }, active: true, createdAt: new Date() },
    { _id: "flavor-7", name: "crunchy", emoji: "🥨", hotkey: "x", translations: { en: "Crunchy", es: "Crujiente" }, active: true, createdAt: new Date() },
    { _id: "flavor-8", name: "fresh", emoji: "🌿", hotkey: "f", translations: { en: "Fresh", es: "Fresco" }, active: true, createdAt: new Date() },
  ];

  // Demo themes
  inMemoryStorage.themes = [
    {
      _id: "theme-1",
      name: "default",
      displayName: { en: "Default", es: "Predeterminado" },
      colors: { primary: "#FF6B35", "primary-dark": "#E63946", secondary: "#2D5A27", accent: "#FFD23F", "accent-dark": "#FB8500" },
      active: true,
      isDefault: true,
      createdAt: new Date(),
    },
    {
      _id: "theme-2",
      name: "minty",
      displayName: { en: "Minty", es: "Menta" },
      colors: { primary: "#00C9A7", "primary-dark": "#00B894", secondary: "#2D5A27", accent: "#A8E6CF", "accent-dark": "#00B894" },
      active: true,
      isDefault: false,
      createdAt: new Date(),
    },
    {
      _id: "theme-3",
      name: "sunset",
      displayName: { en: "Sunset", es: "Atardecer" },
      colors: { primary: "#FF8A65", "primary-dark": "#FF7043", secondary: "#2D5A27", accent: "#FFD54F", "accent-dark": "#FF7043" },
      active: true,
      isDefault: false,
      createdAt: new Date(),
    },
    {
      _id: "theme-4",
      name: "inferno",
      displayName: { en: "Inferno", es: "Infierno" },
      colors: { primary: "#D32F2F", "primary-dark": "#C62828", secondary: "#2D5A27", accent: "#FF5722", "accent-dark": "#C62828" },
      active: true,
      isDefault: false,
      createdAt: new Date(),
    },
  ];

  // Demo promos
  inMemoryStorage.promos = [
    {
      _id: "promo-1",
      title: { en: "🍔 Burger Bliss", es: "🍔 Delicia de Hamburguesa" },
      description: { en: "Discover your perfect burger match with AI precision", es: "Descubre tu hamburguesa perfecta con precisión de IA" },
      imageUrl: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      active: true,
      order: 1,
      createdAt: new Date(),
    },
    {
      _id: "promo-2",
      title: { en: "🍣 Sushi Sensations", es: "🍣 Sensaciones de Sushi" },
      description: { en: "Experience authentic flavors tailored to your taste", es: "Experimenta sabores auténticos adaptados a tu gusto" },
      imageUrl: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      active: true,
      order: 2,
      createdAt: new Date(),
    },
    {
      _id: "promo-3",
      title: { en: "🍜 Ramen Revolution", es: "🍜 Revolución del Ramen" },
      description: { en: "Warm your soul with personalized ramen recommendations", es: "Calienta tu alma con recomendaciones personalizadas de ramen" },
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
      active: true,
      order: 3,
      createdAt: new Date(),
    },
  ];

  // Demo menu items
  inMemoryStorage.menuItems = [
    {
      _id: "menu-1",
      name: { en: "Herb-Crusted Steak", es: "Filete con Costra de Hierbas" },
      description: { en: "Perfectly grilled with rosemary and garlic butter", es: "Perfectamente asado con romero y mantequilla de ajo" },
      price: 24.99,
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      spiceLevel: 1,
      flavors: ["flavor-2", "flavor-5"],
      category: "Main Course",
      ingredients: ["beef", "rosemary", "garlic", "butter"],
      rating: 4.8,
      active: true,
      createdAt: new Date(),
    },
    {
      _id: "menu-2",
      name: { en: "Spicy Thai Curry Bowl", es: "Tazón de Curry Tailandés Picante" },
      description: { en: "Aromatic curry with vegetables and jasmine rice", es: "Curry aromático con verduras y arroz jazmín" },
      price: 18.99,
      imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      spiceLevel: 4,
      flavors: ["flavor-6", "flavor-8"],
      category: "Main Course",
      ingredients: ["coconut milk", "curry paste", "vegetables", "rice"],
      rating: 4.6,
      active: true,
      createdAt: new Date(),
    },
    {
      _id: "menu-3",
      name: { en: "Miso Glazed Salmon", es: "Salmón Glaseado con Miso" },
      description: { en: "Fresh salmon with miso glaze and pickled vegetables", es: "Salmón fresco con glaseado de miso y verduras encurtidas" },
      price: 22.99,
      imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      spiceLevel: 2,
      flavors: ["flavor-5", "flavor-2", "flavor-8"],
      category: "Main Course",
      ingredients: ["salmon", "miso", "vegetables", "rice vinegar"],
      rating: 4.7,
      active: true,
      createdAt: new Date(),
    },
    {
      _id: "menu-4",
      name: { en: "Chocolate Lava Cake", es: "Pastel de Lava de Chocolate" },
      description: { en: "Rich chocolate cake with molten center", es: "Pastel de chocolate rico con centro fundido" },
      price: 8.99,
      imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
      spiceLevel: 0,
      flavors: ["flavor-1", "flavor-6"],
      category: "Dessert",
      ingredients: ["chocolate", "butter", "eggs", "sugar"],
      rating: 4.9,
      active: true,
      createdAt: new Date(),
    },
  ];

  // Demo hotkeys
  inMemoryStorage.hotkeys = [
    {
      _id: "hotkey-1",
      key: "ctrl+/",
      action: "open_help",
      description: { en: "Open help menu", es: "Abrir menú de ayuda" },
      active: true,
      createdAt: new Date(),
    },
    {
      _id: "hotkey-2",
      key: "ctrl+shift+s",
      action: "surprise_me",
      description: { en: "Surprise me with a recommendation", es: "Sorpréndeme con una recomendación" },
      active: true,
      createdAt: new Date(),
    },
  ];

  inMemoryStorage.initialized = true;
  console.log('Demo data initialized for in-memory storage');
}

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  
  // Flavor methods
  getFlavors(): Promise<Flavor[]>;
  getFlavor(id: string): Promise<Flavor | null>;
  createFlavor(flavor: InsertFlavor): Promise<Flavor>;
  updateFlavor(id: string, flavor: Partial<InsertFlavor>): Promise<Flavor | null>;
  deleteFlavor(id: string): Promise<boolean>;
  
  // Spiciness methods
  getAllSpiciness(): Promise<Spiciness[]>;
  getSpiciness(id: string): Promise<Spiciness | null>;
  createSpiciness(spiciness: InsertSpiciness): Promise<Spiciness>;
  updateSpiciness(id: string, spiciness: Partial<InsertSpiciness>): Promise<Spiciness | null>;
  deleteSpiciness(id: string): Promise<boolean>;
  
  // Promo methods
  getPromos(): Promise<Promo[]>;
  getPromo(id: string): Promise<Promo | null>;
  createPromo(promo: InsertPromo): Promise<Promo>;
  updatePromo(id: string, promo: Partial<InsertPromo>): Promise<Promo | null>;
  deletePromo(id: string): Promise<boolean>;
  
  // MenuItem methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItem(id: string): Promise<MenuItem | null>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | null>;
  deleteMenuItem(id: string): Promise<boolean>;
  
  // Theme methods
  getThemes(): Promise<Theme[]>;
  getTheme(id: string): Promise<Theme | null>;
  createTheme(theme: InsertTheme): Promise<Theme>;
  updateTheme(id: string, theme: Partial<InsertTheme>): Promise<Theme | null>;
  deleteTheme(id: string): Promise<boolean>;
  
  // Hotkey methods
  getHotkeys(): Promise<Hotkey[]>;
  getHotkey(id: string): Promise<Hotkey | null>;
  createHotkey(hotkey: InsertHotkey): Promise<Hotkey>;
  updateHotkey(id: string, hotkey: Partial<InsertHotkey>): Promise<Hotkey | null>;
  deleteHotkey(id: string): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  private usingFallback = false;
  
  private async ensureConnection() {
    if (this.usingFallback) {
      initializeDemoData();
      return;
    }
    
    try {
      await connectToDatabase();
    } catch (error) {
      console.warn('MongoDB connection failed, falling back to in-memory storage');
      this.usingFallback = true;
      initializeDemoData();
    }
  }

  // User methods
  async getUser(id: string): Promise<User | null> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.users.find(u => u._id === id) || null;
    }
    
    const collection = getCollection<User>('users');
    return await collection.findOne({ _id: id });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.users.find(u => u.username === username) || null;
    }
    
    const collection = getCollection<User>('users');
    return await collection.findOne({ username });
  }

  async createUser(user: InsertUser): Promise<User> {
    await this.ensureConnection();
    
    const newUser = {
      _id: new ObjectId().toString(),
      ...user,
      createdAt: new Date(),
    };
    
    if (this.usingFallback) {
      inMemoryStorage.users.push(newUser);
      return newUser;
    }
    
    const collection = getCollection<User>('users');
    await collection.insertOne(newUser);
    return newUser;
  }

  // Flavor methods
  async getFlavors(): Promise<Flavor[]> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.flavors.filter(f => f.active);
    }
    
    const collection = getCollection<Flavor>('flavors');
    return await collection.find({ active: true }).toArray();
  }

  async getFlavor(id: string): Promise<Flavor | null> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.flavors.find(f => f._id === id) || null;
    }
    
    const collection = getCollection<Flavor>('flavors');
    return await collection.findOne({ _id: id });
  }

  async createFlavor(flavor: InsertFlavor): Promise<Flavor> {
    await this.ensureConnection();
    
    const newFlavor = {
      _id: new ObjectId().toString(),
      ...flavor,
      createdAt: new Date(),
    };
    
    if (this.usingFallback) {
      inMemoryStorage.flavors.push(newFlavor);
      return newFlavor;
    }
    
    const collection = getCollection<Flavor>('flavors');
    await collection.insertOne(newFlavor);
    return newFlavor;
  }

  async updateFlavor(id: string, flavor: Partial<InsertFlavor>): Promise<Flavor | null> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      const index = inMemoryStorage.flavors.findIndex(f => f._id === id);
      if (index !== -1) {
        inMemoryStorage.flavors[index] = { ...inMemoryStorage.flavors[index], ...flavor };
        return inMemoryStorage.flavors[index];
      }
      return null;
    }
    
    const collection = getCollection<Flavor>('flavors');
    await collection.updateOne({ _id: id }, { $set: flavor });
    return await collection.findOne({ _id: id });
  }

  async deleteFlavor(id: string): Promise<boolean> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      const index = inMemoryStorage.flavors.findIndex(f => f._id === id);
      if (index !== -1) {
        inMemoryStorage.flavors[index].active = false;
        return true;
      }
      return false;
    }
    
    const collection = getCollection<Flavor>('flavors');
    const result = await collection.updateOne({ _id: id }, { $set: { active: false } });
    return result.modifiedCount > 0;
  }

  // Spiciness methods
  async getAllSpiciness(): Promise<Spiciness[]> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.spiciness.filter(s => s.active).sort((a, b) => a.level - b.level);
    }
    
    const collection = getCollection<Spiciness>('spiciness');
    return await collection.find({ active: true }).sort({ level: 1 }).toArray();
  }

  async getSpiciness(id: string): Promise<Spiciness | null> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.spiciness.find(s => s._id === id) || null;
    }
    
    const collection = getCollection<Spiciness>('spiciness');
    return await collection.findOne({ _id: id });
  }

  async createSpiciness(spiciness: InsertSpiciness): Promise<Spiciness> {
    await this.ensureConnection();
    const collection = getCollection<Spiciness>('spiciness');
    const newSpiciness = {
      _id: new ObjectId().toString(),
      ...spiciness,
      createdAt: new Date(),
    };
    await collection.insertOne(newSpiciness);
    return newSpiciness;
  }

  async updateSpiciness(id: string, spiciness: Partial<InsertSpiciness>): Promise<Spiciness | null> {
    await this.ensureConnection();
    const collection = getCollection<Spiciness>('spiciness');
    await collection.updateOne({ _id: id }, { $set: spiciness });
    return await collection.findOne({ _id: id });
  }

  async deleteSpiciness(id: string): Promise<boolean> {
    await this.ensureConnection();
    const collection = getCollection<Spiciness>('spiciness');
    const result = await collection.updateOne({ _id: id }, { $set: { active: false } });
    return result.modifiedCount > 0;
  }

  // Promo methods
  async getPromos(): Promise<Promo[]> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.promos.filter(p => p.active).sort((a, b) => a.order - b.order);
    }
    
    const collection = getCollection<Promo>('promos');
    return await collection.find({ active: true }).sort({ order: 1 }).toArray();
  }

  async getPromo(id: string): Promise<Promo | null> {
    await this.ensureConnection();
    const collection = getCollection<Promo>('promos');
    return await collection.findOne({ _id: id });
  }

  async createPromo(promo: InsertPromo): Promise<Promo> {
    await this.ensureConnection();
    const collection = getCollection<Promo>('promos');
    const newPromo = {
      _id: new ObjectId().toString(),
      ...promo,
      createdAt: new Date(),
    };
    await collection.insertOne(newPromo);
    return newPromo;
  }

  async updatePromo(id: string, promo: Partial<InsertPromo>): Promise<Promo | null> {
    await this.ensureConnection();
    const collection = getCollection<Promo>('promos');
    await collection.updateOne({ _id: id }, { $set: promo });
    return await collection.findOne({ _id: id });
  }

  async deletePromo(id: string): Promise<boolean> {
    await this.ensureConnection();
    const collection = getCollection<Promo>('promos');
    const result = await collection.updateOne({ _id: id }, { $set: { active: false } });
    return result.modifiedCount > 0;
  }

  // MenuItem methods
  async getMenuItems(): Promise<MenuItem[]> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.menuItems.filter(m => m.active);
    }
    
    const collection = getCollection<MenuItem>('menuitems');
    return await collection.find({ active: true }).toArray();
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    await this.ensureConnection();
    const collection = getCollection<MenuItem>('menuitems');
    return await collection.findOne({ _id: id });
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    await this.ensureConnection();
    const collection = getCollection<MenuItem>('menuitems');
    const newMenuItem = {
      _id: new ObjectId().toString(),
      ...menuItem,
      createdAt: new Date(),
    };
    await collection.insertOne(newMenuItem);
    return newMenuItem;
  }

  async updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | null> {
    await this.ensureConnection();
    const collection = getCollection<MenuItem>('menuitems');
    await collection.updateOne({ _id: id }, { $set: menuItem });
    return await collection.findOne({ _id: id });
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    await this.ensureConnection();
    const collection = getCollection<MenuItem>('menuitems');
    const result = await collection.updateOne({ _id: id }, { $set: { active: false } });
    return result.modifiedCount > 0;
  }

  // Theme methods
  async getThemes(): Promise<Theme[]> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.themes.filter(t => t.active);
    }
    
    const collection = getCollection<Theme>('themes');
    return await collection.find({ active: true }).toArray();
  }

  async getTheme(id: string): Promise<Theme | null> {
    await this.ensureConnection();
    const collection = getCollection<Theme>('themes');
    return await collection.findOne({ _id: id });
  }

  async createTheme(theme: InsertTheme): Promise<Theme> {
    await this.ensureConnection();
    const collection = getCollection<Theme>('themes');
    const newTheme = {
      _id: new ObjectId().toString(),
      ...theme,
      createdAt: new Date(),
    };
    await collection.insertOne(newTheme);
    return newTheme;
  }

  async updateTheme(id: string, theme: Partial<InsertTheme>): Promise<Theme | null> {
    await this.ensureConnection();
    const collection = getCollection<Theme>('themes');
    await collection.updateOne({ _id: id }, { $set: theme });
    return await collection.findOne({ _id: id });
  }

  async deleteTheme(id: string): Promise<boolean> {
    await this.ensureConnection();
    const collection = getCollection<Theme>('themes');
    const result = await collection.updateOne({ _id: id }, { $set: { active: false } });
    return result.modifiedCount > 0;
  }

  // Hotkey methods
  async getHotkeys(): Promise<Hotkey[]> {
    await this.ensureConnection();
    
    if (this.usingFallback) {
      return inMemoryStorage.hotkeys.filter(h => h.active);
    }
    
    const collection = getCollection<Hotkey>('hotkeys');
    return await collection.find({ active: true }).toArray();
  }

  async getHotkey(id: string): Promise<Hotkey | null> {
    await this.ensureConnection();
    const collection = getCollection<Hotkey>('hotkeys');
    return await collection.findOne({ _id: id });
  }

  async createHotkey(hotkey: InsertHotkey): Promise<Hotkey> {
    await this.ensureConnection();
    const collection = getCollection<Hotkey>('hotkeys');
    const newHotkey = {
      _id: new ObjectId().toString(),
      ...hotkey,
      createdAt: new Date(),
    };
    await collection.insertOne(newHotkey);
    return newHotkey;
  }

  async updateHotkey(id: string, hotkey: Partial<InsertHotkey>): Promise<Hotkey | null> {
    await this.ensureConnection();
    const collection = getCollection<Hotkey>('hotkeys');
    await collection.updateOne({ _id: id }, { $set: hotkey });
    return await collection.findOne({ _id: id });
  }

  async deleteHotkey(id: string): Promise<boolean> {
    await this.ensureConnection();
    const collection = getCollection<Hotkey>('hotkeys');
    const result = await collection.updateOne({ _id: id }, { $set: { active: false } });
    return result.modifiedCount > 0;
  }
}

export const storage = new MongoStorage();
