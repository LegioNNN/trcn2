var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";
import session from "express-session";

// server/routes.ts
import { createServer } from "http";

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  crops: () => crops,
  fieldHealth: () => fieldHealth,
  fields: () => fields,
  insertCropSchema: () => insertCropSchema,
  insertFieldHealthSchema: () => insertFieldHealthSchema,
  insertFieldSchema: () => insertFieldSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertUserSchema: () => insertUserSchema,
  insertWeatherHistorySchema: () => insertWeatherHistorySchema,
  tasks: () => tasks,
  users: () => users,
  weatherHistory: () => weatherHistory
});
import { pgTable, text, serial, integer, boolean, doublePrecision, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true
});
var fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  size: doublePrecision("size"),
  unit: text("unit").default("d\xF6n\xFCm"),
  coordinates: jsonb("coordinates").notNull(),
  currentCropId: integer("current_crop_id"),
  color: text("color").default("#4CAF50"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  createdAt: true
});
var crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  growingPeriod: integer("growing_period"),
  optimalTemperature: jsonb("optimal_temperature"),
  optimalHumidity: jsonb("optimal_humidity"),
  plantingSeason: text("planting_season"),
  harvestSeason: text("harvest_season")
});
var insertCropSchema = createInsertSchema(crops).omit({
  id: true
});
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  fieldId: integer("field_id"),
  title: text("title").notNull(),
  description: text("description"),
  taskType: text("task_type").notNull(),
  // e.g., watering, fertilizing, harvesting
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  completed: boolean("completed").default(false),
  priority: text("priority").default("normal"),
  createdAt: timestamp("created_at").defaultNow()
});
var insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true
});
var fieldHealth = pgTable("field_health", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  temperature: doublePrecision("temperature"),
  humidity: doublePrecision("humidity"),
  soilMoisture: doublePrecision("soil_moisture"),
  plantHealth: text("plant_health"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertFieldHealthSchema = createInsertSchema(fieldHealth).omit({
  id: true,
  timestamp: true
});
var weatherHistory = pgTable("weather_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  location: text("location").notNull(),
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow()
});
var insertWeatherHistorySchema = createInsertSchema(weatherHistory).omit({
  id: true,
  timestamp: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  constructor() {
    this.initializeDatabase();
  }
  // Initialize database and seed data if needed
  async initializeDatabase() {
    try {
      const userCount = await db.select().from(users);
      if (userCount.length === 0) {
        await this.seedData();
      }
    } catch (error) {
      console.error("Database initialization error:", error);
    }
  }
  // User operations
  async getUser(id) {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }
  async getUserByPhone(phone) {
    const result = await db.select().from(users).where(eq(users.phone, phone));
    return result[0];
  }
  async createUser(userData) {
    const result = await db.insert(users).values({
      ...userData,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  // Field operations
  async getAllFields() {
    return await db.select().from(fields);
  }
  async getField(id) {
    const result = await db.select().from(fields).where(eq(fields.id, id));
    return result[0];
  }
  async getFieldsByUserId(userId) {
    return await db.select().from(fields).where(eq(fields.userId, userId));
  }
  async createField(fieldData) {
    const result = await db.insert(fields).values({
      ...fieldData,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  async updateField(id, fieldData) {
    const result = await db.update(fields).set(fieldData).where(eq(fields.id, id)).returning();
    return result[0];
  }
  async deleteField(id) {
    const result = await db.delete(fields).where(eq(fields.id, id)).returning();
    return result.length > 0;
  }
  // Crop operations
  async getAllCrops() {
    return await db.select().from(crops);
  }
  async getCrop(id) {
    const result = await db.select().from(crops).where(eq(crops.id, id));
    return result[0];
  }
  async createCrop(cropData) {
    const result = await db.insert(crops).values(cropData).returning();
    return result[0];
  }
  // Task operations
  async getAllTasks() {
    return await db.select().from(tasks);
  }
  async getTask(id) {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  async getTasksByUserId(userId) {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }
  async getTasksByFieldId(fieldId) {
    return await db.select().from(tasks).where(eq(tasks.fieldId, fieldId));
  }
  async createTask(taskData) {
    const result = await db.insert(tasks).values({
      ...taskData,
      createdAt: /* @__PURE__ */ new Date(),
      endDate: taskData.endDate || null,
      completed: taskData.completed || false,
      priority: taskData.priority || "normal"
    }).returning();
    return result[0];
  }
  async updateTask(id, taskData) {
    const result = await db.update(tasks).set(taskData).where(eq(tasks.id, id)).returning();
    return result[0];
  }
  async deleteTask(id) {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }
  // Field health operations
  async getAllFieldsHealth() {
    const result = {};
    const healthData = await db.select().from(fieldHealth);
    healthData.forEach((health) => {
      result[health.fieldId] = health;
    });
    return result;
  }
  async getFieldHealth(fieldId) {
    const result = await db.select().from(fieldHealth).where(eq(fieldHealth.fieldId, fieldId));
    return result[0];
  }
  async createFieldHealth(healthData) {
    const result = await db.insert(fieldHealth).values({
      ...healthData,
      timestamp: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  // Weather operations
  async getWeatherHistory(userId) {
    return await db.select().from(weatherHistory).where(eq(weatherHistory.userId, userId)).orderBy(weatherHistory.timestamp);
  }
  async createWeatherHistory(weatherData) {
    const result = await db.insert(weatherHistory).values({
      ...weatherData,
      timestamp: /* @__PURE__ */ new Date()
    }).returning();
    return result[0];
  }
  // Seed initial data for demo purposes
  async seedData() {
    try {
      const [user] = await db.insert(users).values({
        name: "Demo \xC7ift\xE7i",
        phone: "05554443322",
        password: "password123",
        createdAt: /* @__PURE__ */ new Date()
      }).returning();
      const cropData = [
        {
          name: "Bu\u011Fday",
          imageUrl: "https://cdn.pixabay.com/photo/2016/09/21/04/46/wheat-field-1684052_1280.jpg",
          description: "Ekmeklik bu\u011Fday, T\xFCrkiye'nin en \xF6nemli tah\u0131l \xFCr\xFCnlerinden biridir.",
          growingPeriod: 240,
          optimalTemperature: JSON.stringify({ min: 15, max: 25 }),
          optimalHumidity: JSON.stringify({ min: 50, max: 70 }),
          plantingSeason: "Sonbahar",
          harvestSeason: "Haziran-Temmuz"
        },
        {
          name: "Arpa",
          imageUrl: "https://cdn.pixabay.com/photo/2018/06/03/13/28/field-3450609_1280.jpg",
          description: "Arpa, hayvan yemi ve bira \xFCretiminde kullan\u0131lan \xF6nemli bir tah\u0131l \xFCr\xFCn\xFCd\xFCr.",
          growingPeriod: 120,
          optimalTemperature: JSON.stringify({ min: 15, max: 25 }),
          optimalHumidity: JSON.stringify({ min: 50, max: 70 }),
          plantingSeason: "Sonbahar-\u0130lkbahar",
          harvestSeason: "Haziran"
        },
        {
          name: "M\u0131s\u0131r",
          imageUrl: "https://cdn.pixabay.com/photo/2014/11/22/22/58/corn-field-542898_1280.jpg",
          description: "M\u0131s\u0131r, hem hayvan yemi hem de insan g\u0131das\u0131 olarak kullan\u0131lan \xF6nemli bir tah\u0131l \xFCr\xFCn\xFCd\xFCr.",
          growingPeriod: 120,
          optimalTemperature: JSON.stringify({ min: 20, max: 30 }),
          optimalHumidity: JSON.stringify({ min: 60, max: 80 }),
          plantingSeason: "\u0130lkbahar",
          harvestSeason: "Sonbahar"
        }
      ];
      const seededCrops = await db.insert(crops).values(cropData).returning();
      const fieldData = [
        {
          userId: user.id,
          name: "Merkez Tarla",
          location: "Konya, Merkez",
          size: 12,
          unit: "d\xF6n\xFCm",
          coordinates: JSON.stringify({
            type: "Polygon",
            coordinates: [
              [
                [32.4813, 37.8679],
                [32.4843, 37.8679],
                [32.4843, 37.8709],
                [32.4813, 37.8709],
                [32.4813, 37.8679]
              ]
            ]
          }),
          currentCropId: seededCrops[0].id,
          color: "#F8B600",
          notes: "Ana tarla, bu\u011Fday ekimi yap\u0131l\u0131yor.",
          createdAt: /* @__PURE__ */ new Date()
        },
        {
          userId: user.id,
          name: "Do\u011Fu Tarla",
          location: "Konya, Karatay",
          size: 8,
          unit: "d\xF6n\xFCm",
          coordinates: JSON.stringify({
            type: "Polygon",
            coordinates: [
              [
                [32.4853, 37.8659],
                [32.4883, 37.8659],
                [32.4883, 37.8689],
                [32.4853, 37.8689],
                [32.4853, 37.8659]
              ]
            ]
          }),
          currentCropId: seededCrops[1].id,
          color: "#3A7E4F",
          notes: "Arpa ekimi yap\u0131lan ikinci tarla.",
          createdAt: /* @__PURE__ */ new Date()
        }
      ];
      const seededFields = await db.insert(fields).values(fieldData).returning();
      const now = /* @__PURE__ */ new Date();
      const tomorrow = /* @__PURE__ */ new Date();
      tomorrow.setDate(now.getDate() + 1);
      const nextWeek = /* @__PURE__ */ new Date();
      nextWeek.setDate(now.getDate() + 7);
      const taskData = [
        {
          userId: user.id,
          fieldId: seededFields[0].id,
          title: "Merkez Tarla Sulama",
          description: "Bu\u011Fday tarlas\u0131 sulama i\u015Flemi.",
          taskType: "watering",
          startDate: now.toISOString().split("T")[0],
          endDate: now.toISOString().split("T")[0],
          startTime: "08:00",
          endTime: "10:00",
          completed: false,
          priority: "high",
          createdAt: /* @__PURE__ */ new Date()
        },
        {
          userId: user.id,
          fieldId: seededFields[1].id,
          title: "Do\u011Fu Tarla G\xFCbreleme",
          description: "Arpa tarlas\u0131 g\xFCbreleme i\u015Flemi.",
          taskType: "fertilizing",
          startDate: tomorrow.toISOString().split("T")[0],
          endDate: tomorrow.toISOString().split("T")[0],
          startTime: "09:30",
          endTime: "11:30",
          completed: false,
          priority: "medium",
          createdAt: /* @__PURE__ */ new Date()
        },
        {
          userId: user.id,
          fieldId: seededFields[0].id,
          title: "Merkez Tarla Hasat Haz\u0131rl\u0131\u011F\u0131",
          description: "Hasat \xF6ncesi genel kontrol.",
          taskType: "harvesting",
          startDate: nextWeek.toISOString().split("T")[0],
          endDate: nextWeek.toISOString().split("T")[0],
          startTime: "10:00",
          endTime: "16:00",
          completed: false,
          priority: "normal",
          createdAt: /* @__PURE__ */ new Date()
        }
      ];
      const seededTasks = await db.insert(tasks).values(taskData).returning();
      const healthData = [
        {
          fieldId: seededFields[0].id,
          temperature: 26,
          humidity: 55,
          soilMoisture: 65,
          plantHealth: "good",
          notes: "Bitki geli\u015Fimi normal seyrediyor.",
          timestamp: /* @__PURE__ */ new Date()
        },
        {
          fieldId: seededFields[1].id,
          temperature: 27,
          humidity: 48,
          soilMoisture: 28,
          plantHealth: "medium",
          notes: "Nem d\xFC\u015F\xFCk, sulama gerekiyor.",
          timestamp: /* @__PURE__ */ new Date()
        }
      ];
      await db.insert(fieldHealth).values(healthData).returning();
      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Error seeding database:", error);
    }
  }
};
var storage = new DatabaseStorage();

// server/services/weatherService.ts
var conditions = [
  "clear-day",
  "clear-night",
  "partly-cloudy-day",
  "partly-cloudy-night",
  "cloudy",
  "rain",
  "showers",
  "fog",
  "snow",
  "thunderstorm",
  "wind"
];
async function getWeatherData(lat, lon) {
  try {
    const apiKey = process.env.WEATHER_API_KEY;
    if (apiKey) {
      return getMockWeatherData(lat, lon);
    } else {
      return getMockWeatherData(lat, lon);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw new Error("Failed to retrieve weather data");
  }
}
function getMockWeatherData(lat, lon) {
  let location = "Konya, Merkez";
  if (lat >= 37.8 && lat <= 38 && lon >= 32.4 && lon <= 32.6) {
    location = "Konya, Merkez";
  } else if (lat >= 39.9 && lat <= 40 && lon >= 32.8 && lon <= 32.9) {
    location = "Ankara, Merkez";
  } else if (lat >= 41 && lat <= 41.1 && lon >= 28.9 && lon <= 29) {
    location = "\u0130stanbul, Merkez";
  }
  const currentDate = /* @__PURE__ */ new Date();
  const month = currentDate.getMonth();
  let tempMin, tempMax;
  if (month >= 2 && month <= 4) {
    tempMin = 15;
    tempMax = 25;
  } else if (month >= 5 && month <= 7) {
    tempMin = 25;
    tempMax = 35;
  } else if (month >= 8 && month <= 10) {
    tempMin = 15;
    tempMax = 25;
  } else {
    tempMin = 0;
    tempMax = 15;
  }
  const currentTemp = tempMin + Math.random() * (tempMax - tempMin);
  const forecast = [];
  for (let i = 0; i < 4; i++) {
    const variation = Math.random() * 6 - 3;
    forecast.push({
      day: getDayNumber(i),
      icon: getRandomWeatherIcon(),
      temperature: Math.round(currentTemp + variation),
      condition: "Partly cloudy"
    });
  }
  return {
    location,
    current: {
      temperature: Math.round(currentTemp),
      icon: "clear-day",
      condition: "Clear",
      humidity: Math.round(40 + Math.random() * 40),
      // 40-80%
      windSpeed: Math.round(5 + Math.random() * 20)
      // 5-25 km/h
    },
    forecast
  };
}
function getDayNumber(daysFromNow) {
  const date2 = /* @__PURE__ */ new Date();
  date2.setDate(date2.getDate() + daysFromNow);
  return date2.getDay().toString();
}
function getRandomWeatherIcon() {
  return conditions[Math.floor(Math.random() * conditions.length)];
}

// server/middleware/auth.ts
import "express-session";
var isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    req.user = req.session.user;
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};
var setUserSession = (req, user) => {
  if (req.session) {
    console.log("Setting user session, sessionID:", req.sessionID);
    req.session.user = user;
    req.session.save((err) => {
      if (err) {
        console.error("Error saving session:", err);
      } else {
        console.log("Session saved successfully");
      }
    });
  } else {
    console.error("No session object found when trying to set user session");
  }
};
var clearUserSession = (req) => {
  if (req.session) {
    delete req.session.user;
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  const httpServer = createServer(app2);
  app2.options("/api/auth/register", (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  });
  app2.options("/api/auth/register", (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { name, phone, password } = req.body;
      console.log(`Registration attempt: name=${name}, phone=${phone}, password=****`);
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        console.log(`Registration failed: Phone ${phone} already exists`);
        return res.status(409).json({ message: "User with this phone number already exists" });
      }
      const user = await storage.createUser({ name, phone, password });
      console.log(`User created successfully: id=${user.id}, phone=${phone}`);
      const { password: _, ...userWithoutPassword } = user;
      setUserSession(req, userWithoutPassword);
      console.log(`Registration successful: user.id=${user.id}, sessionID=${req.sessionID}`);
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });
  app2.options("/api/auth/login", (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { phone, password } = req.body;
      console.log(`Login attempt: phone=${phone}, password=****`);
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        console.log(`Login failed: User with phone ${phone} not found`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (user.password !== password) {
        console.log(`Login failed: Invalid password for user ${phone}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { password: _, ...userWithoutPassword } = user;
      setUserSession(req, userWithoutPassword);
      console.log(`Login successful: user.id=${user.id}, sessionID=${req.sessionID}`);
      console.log(`Session data:`, req.session);
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.options("/api/auth/logout", (req, res) => {
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  });
  app2.post("/api/auth/logout", (req, res) => {
    clearUserSession(req);
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  app2.options("/api/auth/me", (req, res) => {
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.sendStatus(200);
  });
  app2.get("/api/auth/me", (req, res) => {
    console.log("GET /api/auth/me - Session:", req.session?.id);
    console.log("GET /api/auth/me - User:", req.session?.user ? "Exists" : "Missing");
    if (req.session && req.session.user) {
      return res.status(200).json(req.session.user);
    }
    res.status(401).json({ message: "Unauthorized" });
  });
  app2.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });
  app2.get("/api/fields", isAuthenticated, async (req, res) => {
    try {
      const fields2 = await storage.getAllFields();
      res.status(200).json(fields2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get fields" });
    }
  });
  app2.get("/api/fields/:id", isAuthenticated, async (req, res) => {
    try {
      const field = await storage.getField(parseInt(req.params.id));
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      res.status(200).json(field);
    } catch (error) {
      res.status(500).json({ message: "Failed to get field" });
    }
  });
  app2.post("/api/fields", isAuthenticated, async (req, res) => {
    try {
      const fieldData = {
        ...req.body,
        userId: req.user.id
      };
      const field = await storage.createField(fieldData);
      res.status(201).json(field);
    } catch (error) {
      res.status(500).json({ message: "Failed to create field" });
    }
  });
  app2.put("/api/fields/:id", isAuthenticated, async (req, res) => {
    try {
      const fieldId = parseInt(req.params.id);
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this field" });
      }
      const updatedField = await storage.updateField(fieldId, req.body);
      res.status(200).json(updatedField);
    } catch (error) {
      res.status(500).json({ message: "Failed to update field" });
    }
  });
  app2.delete("/api/fields/:id", isAuthenticated, async (req, res) => {
    try {
      const fieldId = parseInt(req.params.id);
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this field" });
      }
      const success = await storage.deleteField(fieldId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete field" });
    }
  });
  app2.get("/api/crops", isAuthenticated, async (req, res) => {
    try {
      const crops2 = await storage.getAllCrops();
      res.status(200).json(crops2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get crops" });
    }
  });
  app2.get("/api/crops/:id", isAuthenticated, async (req, res) => {
    try {
      const crop = await storage.getCrop(parseInt(req.params.id));
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      res.status(200).json(crop);
    } catch (error) {
      res.status(500).json({ message: "Failed to get crop" });
    }
  });
  app2.post("/api/crops", isAuthenticated, async (req, res) => {
    try {
      const crop = await storage.createCrop(req.body);
      res.status(201).json(crop);
    } catch (error) {
      res.status(500).json({ message: "Failed to create crop" });
    }
  });
  app2.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const tasks2 = await storage.getTasksByUserId(req.user.id);
      res.status(200).json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });
  app2.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view this task" });
      }
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to get task" });
    }
  });
  app2.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      const taskData = {
        ...req.body,
        userId: req.user.id
      };
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  app2.patch("/api/tasks/:id/complete", isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this task" });
      }
      const updatedTask = await storage.updateTask(taskId, { completed: true });
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: "Failed to update task" });
    }
  });
  app2.get("/api/fields/:id/tasks", isAuthenticated, async (req, res) => {
    try {
      const fieldId = parseInt(req.params.id);
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view tasks for this field" });
      }
      const tasks2 = await storage.getTasksByFieldId(fieldId);
      res.status(200).json(tasks2);
    } catch (error) {
      res.status(500).json({ message: "Failed to get field tasks" });
    }
  });
  app2.get("/api/fields/health", isAuthenticated, async (req, res) => {
    try {
      const healthData = await storage.getAllFieldsHealth();
      res.status(200).json(healthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get fields health data" });
    }
  });
  app2.get("/api/fields/:id/health", isAuthenticated, async (req, res) => {
    try {
      const fieldId = parseInt(req.params.id);
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to view health data for this field" });
      }
      const healthData = await storage.getFieldHealth(fieldId);
      if (!healthData) {
        return res.status(404).json({ message: "Field health data not found" });
      }
      res.status(200).json(healthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get field health data" });
    }
  });
  app2.post("/api/fields/:id/health", isAuthenticated, async (req, res) => {
    try {
      const fieldId = parseInt(req.params.id);
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to add health data for this field" });
      }
      const healthData = await storage.createFieldHealth({ ...req.body, fieldId });
      res.status(201).json(healthData);
    } catch (error) {
      res.status(500).json({ message: "Failed to create field health data" });
    }
  });
  app2.get("/api/weather", isAuthenticated, async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      const weatherData = await getWeatherData(
        parseFloat(lat),
        parseFloat(lon)
      );
      await storage.createWeatherHistory({
        userId: req.user.id,
        location: `${lat},${lon}`,
        data: JSON.stringify(weatherData)
      });
      res.status(200).json(weatherData);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ message: "Failed to get weather data" });
    }
  });
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import connectPg from "connect-pg-simple";
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
var PostgresStore = connectPg(session);
app.use(session({
  store: new PostgresStore({
    pool,
    tableName: "session",
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || "tarcan-farm-secret",
  resave: true,
  // Changed to true to ensure session is saved
  saveUninitialized: true,
  // Changed to true to ensure new sessions are saved
  name: "tarcan.sid",
  cookie: {
    secure: false,
    // Set to false to allow cookies over HTTP in development
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1e3,
    // 1 week
    sameSite: "lax",
    path: "/"
  }
}));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "*");
  }
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
