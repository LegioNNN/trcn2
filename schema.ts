import { pgTable, text, serial, integer, boolean, doublePrecision, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  region: text("region"),
  experience: integer("experience"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Field model
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  size: doublePrecision("size"),
  unit: text("unit").default("dönüm"),
  coordinates: jsonb("coordinates").notNull(),
  currentCropId: integer("current_crop_id"),
  color: text("color").default("#4CAF50"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  createdAt: true,
});

// Crop model
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  growingPeriod: integer("growing_period"),
  optimalTemperature: jsonb("optimal_temperature"),
  optimalHumidity: jsonb("optimal_humidity"),
  plantingSeason: text("planting_season"),
  harvestSeason: text("harvest_season"),
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
});

// Task model
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fieldId: integer("field_id"),
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull(), // e.g., watering, fertilizing, harvesting
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("normal"),
  createdAt: timestamp("created_at").defaultNow(),
  season: text("season"), // Current growing season (e.g., "2023", "Summer 2023")
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Field Health model
export const fieldHealth = pgTable("field_health", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  temperature: doublePrecision("temperature"),
  humidity: doublePrecision("humidity"),
  soilMoisture: doublePrecision("soil_moisture"),
  plantHealth: text("plant_health"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertFieldHealthSchema = createInsertSchema(fieldHealth).omit({
  id: true,
  timestamp: true,
});

// Weather History model
export const weatherHistory = pgTable("weather_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  location: text("location").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertWeatherHistorySchema = createInsertSchema(weatherHistory).omit({
  id: true,
  timestamp: true,
});

// Harvest Records model
export const harvestRecords = pgTable("harvest_records", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  cropId: integer("crop_id").notNull(),
  userId: integer("user_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  unit: text("unit").default("kg"),
  harvestDate: date("harvest_date").notNull(),
  season: text("season").notNull(), // e.g., "2023", "Summer 2023"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHarvestRecordSchema = createInsertSchema(harvestRecords).omit({
  id: true,
  createdAt: true,
});

// User Feedback model
export const userFeedback = pgTable("user_feedback", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  rating: integer("rating"),
  feedback: text("feedback").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true, 
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Field = typeof fields.$inferSelect;
export type InsertField = z.infer<typeof insertFieldSchema>;

export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type FieldHealth = typeof fieldHealth.$inferSelect;
export type InsertFieldHealth = z.infer<typeof insertFieldHealthSchema>;

export type WeatherHistory = typeof weatherHistory.$inferSelect;
export type InsertWeatherHistory = z.infer<typeof insertWeatherHistorySchema>;

export type HarvestRecord = typeof harvestRecords.$inferSelect;
export type InsertHarvestRecord = z.infer<typeof insertHarvestRecordSchema>;

export type UserFeedback = typeof userFeedback.$inferSelect;
export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
