import { z } from "zod";
import { pgTable, text, timestamp, integer, real, boolean, json } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('admin'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Flavors table
export const flavors = pgTable('flavors', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  hotkey: text('hotkey'),
  translations: json('translations').$type<{
    en: string;
    es: string;
  }>().notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertFlavorSchema = createInsertSchema(flavors).omit({
  id: true,
  createdAt: true,
});

export type Flavor = typeof flavors.$inferSelect;
export type InsertFlavor = z.infer<typeof insertFlavorSchema>;

// Spiciness table
export const spiciness = pgTable('spiciness', {
  id: text('id').primaryKey(),
  level: integer('level').notNull(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  translations: json('translations').$type<{
    en: string;
    es: string;
  }>().notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertSpicinessSchema = createInsertSchema(spiciness).omit({
  id: true,
  createdAt: true,
});

export type Spiciness = typeof spiciness.$inferSelect;
export type InsertSpiciness = z.infer<typeof insertSpicinessSchema>;

// Promos table
export const promos = pgTable('promos', {
  id: text('id').primaryKey(),
  title: json('title').$type<{
    en: string;
    es: string;
  }>().notNull(),
  description: json('description').$type<{
    en: string;
    es: string;
  }>().notNull(),
  imageUrl: text('image_url').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertPromoSchema = createInsertSchema(promos).omit({
  id: true,
  createdAt: true,
});

export type Promo = typeof promos.$inferSelect;
export type InsertPromo = z.infer<typeof insertPromoSchema>;

// Menu Items table
export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey(),
  name: json('name').$type<{
    en: string;
    es: string;
  }>().notNull(),
  description: json('description').$type<{
    en: string;
    es: string;
  }>().notNull(),
  price: real('price').notNull(),
  imageUrl: text('image_url').notNull(),
  spiceLevel: integer('spice_level').notNull(),
  flavors: json('flavors').$type<string[]>().notNull(),
  category: text('category').notNull(),
  ingredients: json('ingredients').$type<string[]>().notNull(),
  rating: real('rating').notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
});

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;

// Themes table
export const themes = pgTable('themes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  displayName: json('display_name').$type<{
    en: string;
    es: string;
  }>().notNull(),
  colors: json('colors').$type<{
    primary: string;
    secondary: string;
    accent: string;
  }>().notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertThemeSchema = createInsertSchema(themes).omit({
  id: true,
  createdAt: true,
});

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = z.infer<typeof insertThemeSchema>;

// Hotkeys table
export const hotkeys = pgTable('hotkeys', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  action: text('action').notNull(),
  description: json('description').$type<{
    en: string;
    es: string;
  }>().notNull(),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const insertHotkeySchema = createInsertSchema(hotkeys).omit({
  id: true,
  createdAt: true,
});

export type Hotkey = typeof hotkeys.$inferSelect;
export type InsertHotkey = z.infer<typeof insertHotkeySchema>;

// Chat Request/Response schemas (for API)
export const chatRequestSchema = z.object({
  message: z.string().min(1),
  spiceLevel: z.number().min(0).max(5),
  flavors: z.array(z.string()),
  language: z.enum(['en', 'es']).default('en'),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;

export const chatResponseSchema = z.object({
  message: z.string(),
  recommendations: z.array(z.string()),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;