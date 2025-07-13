import { nanoid } from 'nanoid';
import { eq } from 'drizzle-orm';
import { db } from './db';
import {
  User, InsertUser, Flavor, InsertFlavor, Spiciness, InsertSpiciness,
  Promo, InsertPromo, MenuItem, InsertMenuItem, Theme, InsertTheme,
  Hotkey, InsertHotkey, users, flavors, spiciness, promos, menuItems, themes, hotkeys
} from '@shared/schema';

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

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser = {
      id: nanoid(),
      ...user,
    };
    
    const [created] = await db.insert(users).values(newUser).returning();
    return created;
  }

  async getFlavors(): Promise<Flavor[]> {
    return await db.select().from(flavors).where(eq(flavors.active, true));
  }

  async getFlavor(id: string): Promise<Flavor | null> {
    const [flavor] = await db.select().from(flavors).where(eq(flavors.id, id));
    return flavor || null;
  }

  async createFlavor(flavor: InsertFlavor): Promise<Flavor> {
    const newFlavor = {
      id: nanoid(),
      ...flavor,
    };
    
    const [created] = await db.insert(flavors).values(newFlavor).returning();
    return created;
  }

  async updateFlavor(id: string, flavor: Partial<InsertFlavor>): Promise<Flavor | null> {
    const [updated] = await db.update(flavors).set(flavor).where(eq(flavors.id, id)).returning();
    return updated || null;
  }

  async deleteFlavor(id: string): Promise<boolean> {
    const result = await db.delete(flavors).where(eq(flavors.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getAllSpiciness(): Promise<Spiciness[]> {
    return await db.select().from(spiciness).where(eq(spiciness.active, true));
  }

  async getSpiciness(id: string): Promise<Spiciness | null> {
    const [spice] = await db.select().from(spiciness).where(eq(spiciness.id, id));
    return spice || null;
  }

  async createSpiciness(spice: InsertSpiciness): Promise<Spiciness> {
    const newSpiciness = {
      id: nanoid(),
      ...spice,
    };
    
    const [created] = await db.insert(spiciness).values(newSpiciness).returning();
    return created;
  }

  async updateSpiciness(id: string, spice: Partial<InsertSpiciness>): Promise<Spiciness | null> {
    const [updated] = await db.update(spiciness).set(spice).where(eq(spiciness.id, id)).returning();
    return updated || null;
  }

  async deleteSpiciness(id: string): Promise<boolean> {
    const result = await db.delete(spiciness).where(eq(spiciness.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getPromos(): Promise<Promo[]> {
    return await db.select().from(promos).where(eq(promos.active, true));
  }

  async getPromo(id: string): Promise<Promo | null> {
    const [promo] = await db.select().from(promos).where(eq(promos.id, id));
    return promo || null;
  }

  async createPromo(promo: InsertPromo): Promise<Promo> {
    const newPromo = {
      id: nanoid(),
      ...promo,
    };
    
    const [created] = await db.insert(promos).values(newPromo).returning();
    return created;
  }

  async updatePromo(id: string, promo: Partial<InsertPromo>): Promise<Promo | null> {
    const [updated] = await db.update(promos).set(promo).where(eq(promos.id, id)).returning();
    return updated || null;
  }

  async deletePromo(id: string): Promise<boolean> {
    const result = await db.delete(promos).where(eq(promos.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return await db.select().from(menuItems).where(eq(menuItems.active, true));
  }

  async getMenuItem(id: string): Promise<MenuItem | null> {
    const [menuItem] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return menuItem || null;
  }

  async createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem> {
    const newMenuItem = {
      id: nanoid(),
      ...menuItem,
      flavors: menuItem.flavors as string[],
    };
    
    const [created] = await db.insert(menuItems).values([newMenuItem]).returning();
    return created;
  }

  async updateMenuItem(id: string, menuItem: Partial<InsertMenuItem>): Promise<MenuItem | null> {
    const [updated] = await db.update(menuItems).set(menuItem as any).where(eq(menuItems.id, id)).returning();
    return updated || null;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const result = await db.delete(menuItems).where(eq(menuItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getThemes(): Promise<Theme[]> {
    return await db.select().from(themes).where(eq(themes.active, true));
  }

  async getTheme(id: string): Promise<Theme | null> {
    const [theme] = await db.select().from(themes).where(eq(themes.id, id));
    return theme || null;
  }

  async createTheme(theme: InsertTheme): Promise<Theme> {
    const newTheme = {
      id: nanoid(),
      ...theme,
    };
    
    const [created] = await db.insert(themes).values(newTheme).returning();
    return created;
  }

  async updateTheme(id: string, theme: Partial<InsertTheme>): Promise<Theme | null> {
    const [updated] = await db.update(themes).set(theme).where(eq(themes.id, id)).returning();
    return updated || null;
  }

  async deleteTheme(id: string): Promise<boolean> {
    const result = await db.delete(themes).where(eq(themes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getHotkeys(): Promise<Hotkey[]> {
    return await db.select().from(hotkeys).where(eq(hotkeys.active, true));
  }

  async getHotkey(id: string): Promise<Hotkey | null> {
    const [hotkey] = await db.select().from(hotkeys).where(eq(hotkeys.id, id));
    return hotkey || null;
  }

  async createHotkey(hotkey: InsertHotkey): Promise<Hotkey> {
    const newHotkey = {
      id: nanoid(),
      ...hotkey,
    };
    
    const [created] = await db.insert(hotkeys).values(newHotkey).returning();
    return created;
  }

  async updateHotkey(id: string, hotkey: Partial<InsertHotkey>): Promise<Hotkey | null> {
    const [updated] = await db.update(hotkeys).set(hotkey).where(eq(hotkeys.id, id)).returning();
    return updated || null;
  }

  async deleteHotkey(id: string): Promise<boolean> {
    const result = await db.delete(hotkeys).where(eq(hotkeys.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

// Seed the database with initial data
async function seedDatabase() {
  console.log('Seeding database with initial data...');
  
  try {
    // Check if data already exists
    // Clear existing data for fresh seed
    await db.delete(menuItems);
    await db.delete(promos);
    await db.delete(themes);
    await db.delete(hotkeys);
    await db.delete(flavors);
    await db.delete(spiciness);
    await db.delete(users);

    // Demo admin user
    await db.insert(users).values({
      id: 'admin-1',
      username: 'admin',
      passwordHash: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password = 'password'
      role: 'admin',
    });

    // Demo spiciness levels (Mexican restaurant theme) - 5 levels (0-4)
    await db.insert(spiciness).values([
      { id: 'spice-1', level: 0, name: 'no_heat', emoji: '❄️', translations: { en: 'No Heat', es: 'Sin Picante' }, active: true },
      { id: 'spice-2', level: 1, name: 'mild', emoji: '🌶️', translations: { en: 'Mild', es: 'Suave' }, active: true },
      { id: 'spice-3', level: 2, name: 'medium', emoji: '🌶️🌶️', translations: { en: 'Medium', es: 'Medio' }, active: true },
      { id: 'spice-4', level: 3, name: 'hot', emoji: '🌶️🌶️🌶️', translations: { en: 'Hot', es: 'Picante' }, active: true },
      { id: 'spice-5', level: 4, name: 'fire', emoji: '🔥🌶️', translations: { en: 'Fire', es: 'Fuego' }, active: true },
    ]);

    // Demo flavors (Mexican restaurant theme)
    await db.insert(flavors).values([
      { id: 'flavor-1', name: 'spicy', emoji: '🌶️', hotkey: 's', translations: { en: 'Spicy', es: 'Picante' }, active: true },
      { id: 'flavor-2', name: 'cheesy', emoji: '🧀', hotkey: 'c', translations: { en: 'Cheesy', es: 'Con Queso' }, active: true },
      { id: 'flavor-3', name: 'crunchy', emoji: '🌮', hotkey: 'x', translations: { en: 'Crunchy', es: 'Crujiente' }, active: true },
      { id: 'flavor-4', name: 'creamy', emoji: '🥑', hotkey: 'r', translations: { en: 'Creamy', es: 'Cremoso' }, active: true },
      { id: 'flavor-5', name: 'tangy', emoji: '🍋', hotkey: 't', translations: { en: 'Tangy', es: 'Ácido' }, active: true },
      { id: 'flavor-6', name: 'fresh', emoji: '🌿', hotkey: 'f', translations: { en: 'Fresh', es: 'Fresco' }, active: true },
      { id: 'flavor-7', name: 'savory', emoji: '🌽', hotkey: 'v', translations: { en: 'Savory', es: 'Sabroso' }, active: true },
      { id: 'flavor-8', name: 'smoky', emoji: '🔥', hotkey: 'm', translations: { en: 'Smoky', es: 'Ahumado' }, active: true },
    ]);

    // Demo themes
    await db.insert(themes).values([
      {
        id: 'theme-1',
        name: 'ocean',
        displayName: { en: 'Ocean', es: 'Océano' },
        colors: {
          primary: '#0891b2',
          secondary: '#0e7490',
          accent: '#67e8f9',
        },
        active: true,
      },
      {
        id: 'theme-2',
        name: 'minty',
        displayName: { en: 'Minty Fresh', es: 'Fresco Menta' },
        colors: {
          primary: '#2DD4C7',
          secondary: '#1A5D1A',
          accent: '#7BF3A0',
        },
        active: true,
      },
      {
        id: 'theme-3',
        name: 'sunset',
        displayName: { en: 'Sunset Orange', es: 'Naranja Atardecer' },
        colors: {
          primary: '#E85D04',
          secondary: '#370617',
          accent: '#FFB627',
        },
        active: true,
      },
      {
        id: 'theme-4',
        name: 'crimson',
        displayName: { en: 'Crimson Red', es: 'Rojo Carmesí' },
        colors: {
          primary: '#DC2626',
          secondary: '#450A0A',
          accent: '#F59E0B',
        },
        active: true,
      },
    ]);

    // Demo promos
    await db.insert(promos).values([
      {
        id: 'promo-1',
        title: { en: '🌮 Taco Tuesday', es: '🌮 Martes de Tacos' },
        description: { en: 'Get 2 tacos for the price of 1!', es: '¡Obtén 2 tacos por el precio de 1!' },
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
        active: true,
      },
      {
        id: 'promo-2',
        title: { en: '🌶️ Spicy Special', es: '🌶️ Especial Picante' },
        description: { en: 'Free churros with any spicy meal!', es: '¡Churros gratis con cualquier comida picante!' },
        imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
        active: true,
      },
      {
        id: 'promo-3',
        title: { en: '🥑 Guacamole Goodness', es: '🥑 Bondad del Guacamole' },
        description: { en: 'Fresh guacamole made daily!', es: '¡Guacamole fresco hecho diariamente!' },
        imageUrl: 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400',
        active: true,
      },
    ]);

    // Demo menu items (Mexican restaurant theme)
    await db.insert(menuItems).values([
      {
        id: 'menu-1',
        name: { en: 'Carnitas Tacos', es: 'Tacos de Carnitas' },
        description: { en: 'Slow-cooked pork with onions, cilantro, and lime', es: 'Cerdo cocido lentamente con cebolla, cilantro y limón' },
        price: 12.99,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 1,
        flavors: ['flavor-6', 'flavor-7'],
        category: 'Main Course',
        ingredients: ['pork', 'onions', 'cilantro', 'lime', 'tortillas'],
        rating: 4.8,
        active: true,
      },
      {
        id: 'menu-2',
        name: { en: 'Spicy Chicken Quesadilla', es: 'Quesadilla de Pollo Picante' },
        description: { en: 'Grilled chicken with jalapeños, cheese, and spices', es: 'Pollo a la parrilla con jalapeños, queso y especias' },
        price: 14.99,
        imageUrl: 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 3,
        flavors: ['flavor-1', 'flavor-2', 'flavor-3'],
        category: 'Main Course',
        ingredients: ['chicken', 'jalapeños', 'cheese', 'tortillas', 'spices'],
        rating: 4.6,
        active: true,
      },
      {
        id: 'menu-3',
        name: { en: 'Carne Asada Burrito', es: 'Burrito de Carne Asada' },
        description: { en: 'Grilled steak with rice, beans, guacamole, and salsa', es: 'Bistec a la parrilla con arroz, frijoles, guacamole y salsa' },
        price: 16.99,
        imageUrl: 'https://images.unsplash.com/photo-1566740933430-b5e70b06d2d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 2,
        flavors: ['flavor-4', 'flavor-6', 'flavor-7'],
        category: 'Main Course',
        ingredients: ['steak', 'rice', 'beans', 'guacamole', 'salsa', 'tortilla'],
        rating: 4.7,
        active: true,
      },
      {
        id: 'menu-4',
        name: { en: 'Churros con Chocolate', es: 'Churros con Chocolate' },
        description: { en: 'Crispy fried pastry with cinnamon sugar and chocolate sauce', es: 'Pastelería frita crujiente con azúcar canela y salsa de chocolate' },
        price: 8.99,
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 0,
        flavors: ['flavor-3'],
        category: 'Dessert',
        ingredients: ['flour', 'sugar', 'cinnamon', 'chocolate', 'oil'],
        rating: 4.9,
        active: true,
      },
      {
        id: 'menu-5',
        name: { en: 'Elote (Mexican Street Corn)', es: 'Elote (Elote Mexicano)' },
        description: { en: 'Grilled corn with mayo, cotija cheese, chili powder, and lime', es: 'Maíz asado con mayonesa, queso cotija, chile en polvo y limón' },
        price: 6.99,
        imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 2,
        flavors: ['flavor-2', 'flavor-4', 'flavor-5'],
        category: 'Appetizer',
        ingredients: ['corn', 'mayo', 'cotija cheese', 'chili powder', 'lime'],
        rating: 4.5,
        active: true,
      },
      {
        id: 'menu-6',
        name: { en: 'Smoky Chipotle Bowl', es: 'Tazón Chipotle Ahumado' },
        description: { en: 'Rice bowl with smoky chipotle chicken, black beans, and avocado', es: 'Tazón de arroz con pollo chipotle ahumado, frijoles negros y aguacate' },
        price: 15.99,
        imageUrl: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 3,
        flavors: ['flavor-8', 'flavor-4', 'flavor-6'],
        category: 'Main Course',
        ingredients: ['chicken', 'chipotle', 'rice', 'black beans', 'avocado'],
        rating: 4.8,
        active: true,
      },
    ]);

    // Demo hotkeys
    await db.insert(hotkeys).values([
      {
        id: 'hotkey-1',
        key: 'ctrl+s',
        action: 'save',
        description: { en: 'Save current item', es: 'Guardar elemento actual' },
        active: true,
      },
      {
        id: 'hotkey-2',
        key: 'ctrl+n',
        action: 'new',
        description: { en: 'Create new item', es: 'Crear nuevo elemento' },
        active: true,
      },
    ]);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export const storage = new DatabaseStorage();

// Initialize the database with seed data
seedDatabase().catch(console.error);