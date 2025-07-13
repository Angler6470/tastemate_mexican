import { z } from "zod";

// User schema for admin authentication
export const users = z.object({
  _id: z.string(),
  username: z.string(),
  password: z.string(),
  role: z.enum(['admin']).default('admin'),
  createdAt: z.date().default(() => new Date()),
});

export const insertUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(['admin']).default('admin'),
});

export type User = z.infer<typeof users>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Flavor schema
export const flavors = z.object({
  _id: z.string(),
  name: z.string(),
  emoji: z.string(),
  hotkey: z.string().optional(),
  translations: z.object({
    en: z.string(),
    es: z.string(),
  }),
  active: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export const insertFlavorSchema = z.object({
  name: z.string().min(1),
  emoji: z.string().min(1),
  hotkey: z.string().optional(),
  translations: z.object({
    en: z.string(),
    es: z.string(),
  }),
  active: z.boolean().default(true),
});

export type Flavor = z.infer<typeof flavors>;
export type InsertFlavor = z.infer<typeof insertFlavorSchema>;

// Spiciness schema
export const spiciness = z.object({
  _id: z.string(),
  level: z.number().min(0).max(5),
  name: z.string(),
  emoji: z.string(),
  translations: z.object({
    en: z.string(),
    es: z.string(),
  }),
  active: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export const insertSpicinessSchema = z.object({
  level: z.number().min(0).max(5),
  name: z.string(),
  emoji: z.string(),
  translations: z.object({
    en: z.string(),
    es: z.string(),
  }),
  active: z.boolean().default(true),
});

export type Spiciness = z.infer<typeof spiciness>;
export type InsertSpiciness = z.infer<typeof insertSpicinessSchema>;

// Promo schema
export const promos = z.object({
  _id: z.string(),
  title: z.object({
    en: z.string(),
    es: z.string(),
  }),
  description: z.object({
    en: z.string(),
    es: z.string(),
  }),
  imageUrl: z.string().url(),
  active: z.boolean().default(true),
  order: z.number().default(0),
  createdAt: z.date().default(() => new Date()),
});

export const insertPromoSchema = z.object({
  title: z.object({
    en: z.string(),
    es: z.string(),
  }),
  description: z.object({
    en: z.string(),
    es: z.string(),
  }),
  imageUrl: z.string().url(),
  active: z.boolean().default(true),
  order: z.number().default(0),
});

export type Promo = z.infer<typeof promos>;
export type InsertPromo = z.infer<typeof insertPromoSchema>;

// MenuItem schema
export const menuItems = z.object({
  _id: z.string(),
  name: z.object({
    en: z.string(),
    es: z.string(),
  }),
  description: z.object({
    en: z.string(),
    es: z.string(),
  }),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  spiceLevel: z.number().min(0).max(5),
  flavors: z.array(z.string()),
  category: z.string(),
  ingredients: z.array(z.string()),
  rating: z.number().min(0).max(5).default(0),
  active: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export const insertMenuItemSchema = z.object({
  name: z.object({
    en: z.string(),
    es: z.string(),
  }),
  description: z.object({
    en: z.string(),
    es: z.string(),
  }),
  price: z.number().positive(),
  imageUrl: z.string().url(),
  spiceLevel: z.number().min(0).max(5),
  flavors: z.array(z.string()),
  category: z.string(),
  ingredients: z.array(z.string()),
  rating: z.number().min(0).max(5).default(0),
  active: z.boolean().default(true),
});

export type MenuItem = z.infer<typeof menuItems>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// Theme schema
export const themes = z.object({
  _id: z.string(),
  name: z.string(),
  displayName: z.object({
    en: z.string(),
    es: z.string(),
  }),
  colors: z.object({
    primary: z.string(),
    'primary-dark': z.string(),
    secondary: z.string(),
    accent: z.string(),
    'accent-dark': z.string(),
  }),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  createdAt: z.date().default(() => new Date()),
});

export const insertThemeSchema = z.object({
  name: z.string(),
  displayName: z.object({
    en: z.string(),
    es: z.string(),
  }),
  colors: z.object({
    primary: z.string(),
    'primary-dark': z.string(),
    secondary: z.string(),
    accent: z.string(),
    'accent-dark': z.string(),
  }),
  active: z.boolean().default(true),
  isDefault: z.boolean().default(false),
});

export type Theme = z.infer<typeof themes>;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

// Hotkey schema
export const hotkeys = z.object({
  _id: z.string(),
  key: z.string(),
  action: z.string(),
  description: z.object({
    en: z.string(),
    es: z.string(),
  }),
  active: z.boolean().default(true),
  createdAt: z.date().default(() => new Date()),
});

export const insertHotkeySchema = z.object({
  key: z.string(),
  action: z.string(),
  description: z.object({
    en: z.string(),
    es: z.string(),
  }),
  active: z.boolean().default(true),
});

export type Hotkey = z.infer<typeof hotkeys>;
export type InsertHotkey = z.infer<typeof insertHotkeySchema>;

// Chat request schema
export const chatRequestSchema = z.object({
  message: z.string().min(1),
  spiceLevel: z.number().min(0).max(5),
  flavors: z.array(z.string()),
  language: z.enum(['en', 'es']).default('en'),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

// Chat response schema
export const chatResponseSchema = z.object({
  message: z.string(),
  recommendations: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
