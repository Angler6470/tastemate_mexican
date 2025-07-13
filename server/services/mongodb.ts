import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import type { User, Flavor, Spiciness, Promo, MenuItem, Theme, Hotkey, InsertUser, InsertFlavor, InsertSpiciness, InsertPromo, InsertMenuItem, InsertTheme, InsertHotkey } from '@shared/schema';

let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  const mongoUri = process.env.MONGODB_URI;
  
  // Check if MongoDB URI is available
  if (!mongoUri) {
    throw new Error('MongoDB URI not configured');
  }
  
  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db();
    
    console.log('Connected to MongoDB');
    
    // Auto-seed data on first run
    await seedDatabase();
    
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
  }
}

async function seedDatabase(): Promise<void> {
  try {
    // Check if data already exists
    const usersCollection = db.collection('users');
    const existingUser = await usersCollection.findOne({});
    
    if (existingUser) {
      console.log('Database already seeded, skipping...');
      return;
    }

    console.log('Seeding database with initial data...');

    // Seed admin user
    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await usersCollection.insertOne({
      _id: new ObjectId().toString(),
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
    });

    // Seed spiciness levels
    const spicinessCollection = db.collection('spiciness');
    const spicinessData = [
      { level: 0, name: 'mild', emoji: '😊', translations: { en: 'Mild', es: 'Suave' } },
      { level: 1, name: 'medium', emoji: '🌶️', translations: { en: 'Medium', es: 'Medio' } },
      { level: 2, name: 'hot', emoji: '🔥', translations: { en: 'Hot', es: 'Picante' } },
      { level: 3, name: 'spicy', emoji: '🌋', translations: { en: 'Spicy', es: 'Muy Picante' } },
      { level: 4, name: 'extreme', emoji: '💀', translations: { en: 'Extreme', es: 'Extremo' } },
      { level: 5, name: 'insane', emoji: '☠️', translations: { en: 'Insane', es: 'Loco' } },
    ];

    for (const spice of spicinessData) {
      await spicinessCollection.insertOne({
        _id: new ObjectId().toString(),
        ...spice,
        active: true,
        createdAt: new Date(),
      });
    }

    // Seed flavors
    const flavorsCollection = db.collection('flavors');
    const flavorsData = [
      { name: 'sweet', emoji: '🍯', hotkey: 's', translations: { en: 'Sweet', es: 'Dulce' } },
      { name: 'salty', emoji: '🧂', hotkey: 'a', translations: { en: 'Salty', es: 'Salado' } },
      { name: 'sour', emoji: '🍋', hotkey: 'r', translations: { en: 'Sour', es: 'Agrio' } },
      { name: 'bitter', emoji: '☕', hotkey: 'b', translations: { en: 'Bitter', es: 'Amargo' } },
      { name: 'umami', emoji: '🍄', hotkey: 'u', translations: { en: 'Umami', es: 'Umami' } },
      { name: 'creamy', emoji: '🥛', hotkey: 'c', translations: { en: 'Creamy', es: 'Cremoso' } },
      { name: 'crunchy', emoji: '🥨', hotkey: 'x', translations: { en: 'Crunchy', es: 'Crujiente' } },
      { name: 'fresh', emoji: '🌿', hotkey: 'f', translations: { en: 'Fresh', es: 'Fresco' } },
    ];

    for (const flavor of flavorsData) {
      await flavorsCollection.insertOne({
        _id: new ObjectId().toString(),
        ...flavor,
        active: true,
        createdAt: new Date(),
      });
    }

    // Seed themes
    const themesCollection = db.collection('themes');
    const themesData = [
      {
        name: 'default',
        displayName: { en: 'Default', es: 'Predeterminado' },
        colors: {
          primary: '#FF6B35',
          'primary-dark': '#E63946',
          secondary: '#2D5A27',
          accent: '#FFD23F',
          'accent-dark': '#FB8500',
        },
        isDefault: true,
      },
      {
        name: 'minty',
        displayName: { en: 'Minty', es: 'Menta' },
        colors: {
          primary: '#00C9A7',
          'primary-dark': '#00B894',
          secondary: '#2D5A27',
          accent: '#A8E6CF',
          'accent-dark': '#00B894',
        },
        isDefault: false,
      },
      {
        name: 'sunset',
        displayName: { en: 'Sunset', es: 'Atardecer' },
        colors: {
          primary: '#FF8A65',
          'primary-dark': '#FF7043',
          secondary: '#2D5A27',
          accent: '#FFD54F',
          'accent-dark': '#FF7043',
        },
        isDefault: false,
      },
      {
        name: 'inferno',
        displayName: { en: 'Inferno', es: 'Infierno' },
        colors: {
          primary: '#D32F2F',
          'primary-dark': '#C62828',
          secondary: '#2D5A27',
          accent: '#FF5722',
          'accent-dark': '#C62828',
        },
        isDefault: false,
      },
    ];

    for (const theme of themesData) {
      await themesCollection.insertOne({
        _id: new ObjectId().toString(),
        ...theme,
        active: true,
        createdAt: new Date(),
      });
    }

    // Seed promos
    const promosCollection = db.collection('promos');
    const promosData = [
      {
        title: { en: '🍔 Burger Bliss', es: '🍔 Delicia de Hamburguesa' },
        description: { en: 'Discover your perfect burger match with AI precision', es: 'Descubre tu hamburguesa perfecta con precisión de IA' },
        imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
        order: 1,
      },
      {
        title: { en: '🍣 Sushi Sensations', es: '🍣 Sensaciones de Sushi' },
        description: { en: 'Experience authentic flavors tailored to your taste', es: 'Experimenta sabores auténticos adaptados a tu gusto' },
        imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
        order: 2,
      },
      {
        title: { en: '🍜 Ramen Revolution', es: '🍜 Revolución del Ramen' },
        description: { en: 'Warm your soul with personalized ramen recommendations', es: 'Calienta tu alma con recomendaciones personalizadas de ramen' },
        imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600',
        order: 3,
      },
    ];

    for (const promo of promosData) {
      await promosCollection.insertOne({
        _id: new ObjectId().toString(),
        ...promo,
        active: true,
        createdAt: new Date(),
      });
    }

    // Seed sample menu items
    const menuItemsCollection = db.collection('menuitems');
    const menuItemsData = [
      {
        name: { en: 'Herb-Crusted Steak', es: 'Filete con Costra de Hierbas' },
        description: { en: 'Perfectly grilled with rosemary and garlic butter', es: 'Perfectamente asado con romero y mantequilla de ajo' },
        price: 24.99,
        imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 1,
        flavors: ['salty', 'umami'],
        category: 'Main Course',
        ingredients: ['beef', 'rosemary', 'garlic', 'butter'],
        rating: 4.8,
      },
      {
        name: { en: 'Spicy Thai Curry Bowl', es: 'Tazón de Curry Tailandés Picante' },
        description: { en: 'Aromatic curry with vegetables and jasmine rice', es: 'Curry aromático con verduras y arroz jazmín' },
        price: 18.99,
        imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 4,
        flavors: ['spicy', 'creamy', 'fresh'],
        category: 'Main Course',
        ingredients: ['coconut milk', 'curry paste', 'vegetables', 'rice'],
        rating: 4.6,
      },
      {
        name: { en: 'Miso Glazed Salmon', es: 'Salmón Glaseado con Miso' },
        description: { en: 'Fresh salmon with miso glaze and pickled vegetables', es: 'Salmón fresco con glaseado de miso y verduras encurtidas' },
        price: 22.99,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
        spiceLevel: 2,
        flavors: ['umami', 'salty', 'fresh'],
        category: 'Main Course',
        ingredients: ['salmon', 'miso', 'vegetables', 'rice vinegar'],
        rating: 4.7,
      },
    ];

    for (const menuItem of menuItemsData) {
      await menuItemsCollection.insertOne({
        _id: new ObjectId().toString(),
        ...menuItem,
        active: true,
        createdAt: new Date(),
      });
    }

    // Seed hotkeys
    const hotkeysCollection = db.collection('hotkeys');
    const hotkeysData = [
      {
        key: 'ctrl+/',
        action: 'open_help',
        description: { en: 'Open help menu', es: 'Abrir menú de ayuda' },
      },
      {
        key: 'ctrl+shift+s',
        action: 'surprise_me',
        description: { en: 'Surprise me with a recommendation', es: 'Sorpréndeme con una recomendación' },
      },
    ];

    for (const hotkey of hotkeysData) {
      await hotkeysCollection.insertOne({
        _id: new ObjectId().toString(),
        ...hotkey,
        active: true,
        createdAt: new Date(),
      });
    }

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export function getCollection<T>(name: string): Collection<T> {
  return db.collection<T>(name);
}
