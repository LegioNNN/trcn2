import { 
  User, 
  InsertUser, 
  Field, 
  InsertField, 
  Crop, 
  InsertCrop,
  Task,
  InsertTask,
  FieldHealth,
  InsertFieldHealth,
  WeatherHistory,
  InsertWeatherHistory
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, fields, crops, tasks, fieldHealth, weatherHistory } from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Field operations
  getAllFields(): Promise<Field[]>;
  getField(id: number): Promise<Field | undefined>;
  getFieldsByUserId(userId: number): Promise<Field[]>;
  createField(field: InsertField): Promise<Field>;
  updateField(id: number, field: Partial<Field>): Promise<Field | undefined>;
  deleteField(id: number): Promise<boolean>;

  // Crop operations
  getAllCrops(): Promise<Crop[]>;
  getCrop(id: number): Promise<Crop | undefined>;
  createCrop(crop: InsertCrop): Promise<Crop>;

  // Task operations
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  getTasksByUserId(userId: number): Promise<Task[]>;
  getTasksByFieldId(fieldId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Field health operations
  getAllFieldsHealth(): Promise<Record<number, FieldHealth>>;
  getFieldHealth(fieldId: number): Promise<FieldHealth | undefined>;
  createFieldHealth(healthData: InsertFieldHealth): Promise<FieldHealth>;

  // Weather operations
  getWeatherHistory(userId: number): Promise<WeatherHistory[]>;
  createWeatherHistory(weatherData: InsertWeatherHistory): Promise<WeatherHistory>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // In-memory fallback storage
  private inMemoryUsers: User[] = [];
  private inMemoryFields: Field[] = [];
  private inMemoryCrops: Crop[] = [];
  private inMemoryTasks: Task[] = [];
  private inMemoryFieldHealth: Record<number, FieldHealth> = {};
  private inMemoryWeatherHistory: WeatherHistory[] = [];
  private inMemoryHarvestRecords: HarvestRecord[] = [];
  private inMemoryFeedback: UserFeedback[] = [];
  private useInMemory: boolean = false;

  constructor() {
    // Initialize database
    this.initializeDatabase();
  }

  // Initialize database and seed data if needed
  private async initializeDatabase() {
    try {
      if (db) {
        // Check if user table exists and seed data if empty
        try {
          const userCount = await db.select().from(users);
          if (userCount.length === 0) {
            // Seed some initial data
            await this.seedData();
          }
        } catch (dbError) {
          console.error('Database query error:', dbError);
          // If database operations fail, fall back to in-memory
          console.log('Falling back to in-memory storage for this session');
          this.useInMemory = true;
          this.setupInMemoryData();
        }
      } else {
        console.log('Database not available, using in-memory storage');
        this.useInMemory = true;
        this.setupInMemoryData();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      console.log('Falling back to in-memory storage due to error');
      this.useInMemory = true;
      this.setupInMemoryData();
    }
  }

  // Setup in-memory data with demo content
  private setupInMemoryData() {
    console.log('Setting up in-memory data');
    // In-memory storage setup here
    this.inMemoryUsers = [
      {
        id: 1,
        name: 'Demo Çiftçi',
        phone: '05554443322',
        passwordHash: 'hashed_demo',
        createdAt: new Date()
      },
      {
        id: 2,
        name: 'Yeni Kullanıcı',
        phone: '05551712526',
        password: '12345',
        createdAt: new Date()
      }
    ];

    this.inMemoryFields = [{
      id: 1,
      userId: 1,
      name: 'Merkez Tarla',
      location: 'Konya Merkez',
      size: 250,
      cropId: 1,
      soilType: 'clay',
      plantDate: new Date('2025-03-15'),
      harvestDate: new Date('2025-08-15'),
      status: 'active',
      createdAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      name: 'Doğu Tarla',
      location: 'Konya Doğu',
      size: 180,
      cropId: 2,
      soilType: 'loam',
      plantDate: new Date('2025-03-20'),
      harvestDate: new Date('2025-09-01'),
      status: 'active',
      createdAt: new Date()
    }];

    this.inMemoryCrops = [{
      id: 1,
      name: 'Buğday',
      growthDuration: 150,
      waterRequirement: 'medium',
      idealTemperature: 18,
      description: 'Anadolu buğdayı, serin iklim tahılı.',
      icon: '🌾',
      createdAt: new Date()
    },
    {
      id: 2,
      name: 'Mısır',
      growthDuration: 120,
      waterRequirement: 'high',
      idealTemperature: 22,
      description: 'Yaz mevsimi tahılı, sıcak seven bitki.',
      icon: '🌽',
      createdAt: new Date()
    }];

    this.inMemoryTasks = [{
      id: 1,
      userId: 1,
      fieldId: 1,
      title: 'Merkez Tarla Sulama',
      description: 'Düzenli sulama yapılacak.',
      taskType: 'irrigation',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      completed: false,
      priority: 'high',
      createdAt: new Date()
    },
    {
      id: 2,
      userId: 1,
      fieldId: 2,
      title: 'Doğu Tarla İlaçlama',
      description: 'Haftalık ilaçlama işlemi.',
      taskType: 'spraying',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '17:00',
      completed: false,
      priority: 'high',
      createdAt: new Date()
    },
    {
      id: 3,
      userId: 1,
      fieldId: 1,
      title: 'Merkez Tarla Hasat Kontrolü',
      description: 'Hasat öncesi genel kontrol.',
      taskType: 'harvesting',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '16:00',
      completed: false,
      priority: 'normal',
      createdAt: new Date()
    }];

    this.inMemoryFieldHealth = {
      1: {
        id: 1,
        fieldId: 1,
        temperature: 26,
        humidity: 55,
        soilMoisture: 65,
        plantHealth: 'good',
        notes: 'Bitki gelişimi normal seyrediyor.',
        timestamp: new Date()
      },
      2: {
        id: 2,
        fieldId: 2,
        temperature: 27,
        humidity: 48,
        soilMoisture: 28,
        plantHealth: 'medium',
        notes: 'Nem düşük, sulama gerekiyor.',
        timestamp: new Date()
      }
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (this.useInMemory) {
      return this.inMemoryUsers.find(user => user.id === id);
    }

    try {
      if (db) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      // Fallback to in-memory if db query fails
      this.useInMemory = true;
      return this.inMemoryUsers.find(user => user.id === id);
    }
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    if (this.useInMemory) {
      return this.inMemoryUsers.find(user => user.phone === phone);
    }

    try {
      if (db) {
        const result = await db.select().from(users).where(eq(users.phone, phone));
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      // Fallback to in-memory if db query fails
      this.useInMemory = true;
      return this.inMemoryUsers.find(user => user.phone === phone);
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    if (this.useInMemory) {
      // Generate an ID
      const id = this.inMemoryUsers.length > 0 
        ? Math.max(...this.inMemoryUsers.map(u => u.id)) + 1 
        : 1;

      const newUser: User = {
        id,
        ...userData,
        createdAt: new Date()
      };

      this.inMemoryUsers.push(newUser);
      return newUser;
    }

    try {
      if (db) {
        const result = await db.insert(users).values({
          ...userData,
          createdAt: new Date()
        }).returning();
        return result[0];
      } else {
        throw new Error('Database not available');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      // Fall back to in-memory
      this.useInMemory = true;
      return this.createUser(userData);
    }
  }

  // Field operations
  async getAllFields(): Promise<Field[]> {
    if (this.useInMemory) {
      return [...this.inMemoryFields];
    }

    try {
      if (db) {
        return await db.select().from(fields);
      }
      return [];
    } catch (error) {
      console.error('Error getting all fields:', error);
      this.useInMemory = true;
      return [...this.inMemoryFields];
    }
  }

  async getField(id: number): Promise<Field | undefined> {
    if (this.useInMemory) {
      return this.inMemoryFields.find(field => field.id === id);
    }

    try {
      if (db) {
        const result = await db.select().from(fields).where(eq(fields.id, id));
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.error('Error getting field:', error);
      this.useInMemory = true;
      return this.inMemoryFields.find(field => field.id === id);
    }
  }

  async getFieldsByUserId(userId: number): Promise<Field[]> {
    if (this.useInMemory) {
      return this.inMemoryFields.filter(field => field.userId === userId);
    }

    try {
      if (db) {
        return await db.select().from(fields).where(eq(fields.userId, userId));
      }
      return [];
    } catch (error) {
      console.error('Error getting fields by user ID:', error);
      this.useInMemory = true;
      return this.inMemoryFields.filter(field => field.userId === userId);
    }
  }

  async createField(fieldData: InsertField): Promise<Field> {
    if (this.useInMemory) {
      // Generate an ID
      const id = this.inMemoryFields.length > 0 
        ? Math.max(...this.inMemoryFields.map(f => f.id)) + 1 
        : 1;

      const newField: Field = {
        id,
        ...fieldData,
        createdAt: new Date()
      };

      this.inMemoryFields.push(newField);
      return newField;
    }

    try {
      if (db) {
        const result = await db.insert(fields).values({
          ...fieldData,
          createdAt: new Date()
        }).returning();
        return result[0];
      } else {
        throw new Error('Database not available');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      this.useInMemory = true;
      return this.createField(fieldData);
    }
  }

  async updateField(id: number, fieldData: Partial<Field>): Promise<Field | undefined> {
    if (this.useInMemory) {
      const index = this.inMemoryFields.findIndex(field => field.id === id);
      if (index === -1) return undefined;

      this.inMemoryFields[index] = {
        ...this.inMemoryFields[index],
        ...fieldData
      };

      return this.inMemoryFields[index];
    }

    try {
      if (db) {
        const result = await db.update(fields)
          .set(fieldData)
          .where(eq(fields.id, id))
          .returning();
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.error('Error updating field:', error);
      this.useInMemory = true;
      return this.updateField(id, fieldData);
    }
  }

  async deleteField(id: number): Promise<boolean> {
    if (this.useInMemory) {
      const index = this.inMemoryFields.findIndex(field => field.id === id);
      if (index === -1) return false;

      this.inMemoryFields.splice(index, 1);
      return true;
    }

    try {
      if (db) {
        const result = await db.delete(fields).where(eq(fields.id, id)).returning();
        return result.length > 0;
      }
      return false;
    } catch (error) {
      console.error('Error deleting field:', error);
      this.useInMemory = true;
      return this.deleteField(id);
    }
  }

  // Crop operations
  async getAllCrops(): Promise<Crop[]> {
    if (this.useInMemory) {
      return [...this.inMemoryCrops];
    }

    try {
      if (db) {
        return await db.select().from(crops);
      }
      return [];
    } catch (error) {
      console.error('Error getting all crops:', error);
      this.useInMemory = true;
      return [...this.inMemoryCrops];
    }
  }

  async getCrop(id: number): Promise<Crop | undefined> {
    if (this.useInMemory) {
      return this.inMemoryCrops.find(crop => crop.id === id);
    }

    try {
      if (db) {
        const result = await db.select().from(crops).where(eq(crops.id, id));
        return result[0];
      }
      return undefined;
    } catch (error) {
      console.error('Error getting crop:', error);
      this.useInMemory = true;
      return this.inMemoryCrops.find(crop => crop.id === id);
    }
  }

  async createCrop(cropData: InsertCrop): Promise<Crop> {
    if (this.useInMemory) {
      // Generate an ID
      const id = this.inMemoryCrops.length > 0 
        ? Math.max(...this.inMemoryCrops.map(c => c.id)) + 1 
        : 1;

      const newCrop: Crop = {
        id,
        ...cropData,
        createdAt: new Date()
      };

      this.inMemoryCrops.push(newCrop);
      return newCrop;
    }

    try {
      if (db) {
        const result = await db.insert(crops).values(cropData).returning();
        return result[0];
      } else {
        throw new Error('Database not available');
      }
    } catch (error) {
      console.error('Error creating crop:', error);
      this.useInMemory = true;
      return this.createCrop(cropData);
    }
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }

  async getTasksByUserId(userId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.userId, userId));
  }

  async getTasksByFieldId(fieldId: number): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.fieldId, fieldId));
  }

  async createTask(taskData: InsertTask): Promise<Task> {
    const result = await db.insert(tasks).values({
      ...taskData,
      createdAt: new Date(),
      endDate: taskData.endDate || null,
      completed: taskData.completed || false,
      priority: taskData.priority || 'normal'
    }).returning();
    return result[0];
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const result = await db.update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  // Field health operations
  async getAllFieldsHealth(): Promise<Record<number, FieldHealth>> {
    const result: Record<number, FieldHealth> = {};
    const healthData = await db.select().from(fieldHealth);

    healthData.forEach(health => {
      result[health.fieldId] = health;
    });

    return result;
  }

  async getFieldHealth(fieldId: number): Promise<FieldHealth | undefined> {
    const result = await db.select().from(fieldHealth).where(eq(fieldHealth.fieldId, fieldId));
    return result[0];
  }

  async createFieldHealth(healthData: InsertFieldHealth): Promise<FieldHealth> {
    const result = await db.insert(fieldHealth).values({
      ...healthData,
      timestamp: new Date()
    }).returning();
    return result[0];
  }

  // Weather operations
  async getWeatherHistory(userId: number): Promise<WeatherHistory[]> {
    return await db.select()
      .from(weatherHistory)
      .where(eq(weatherHistory.userId, userId))
      .orderBy(weatherHistory.timestamp);
  }

  async createWeatherHistory(weatherData: InsertWeatherHistory): Promise<WeatherHistory> {
    const result = await db.insert(weatherHistory).values({
      ...weatherData,
      timestamp: new Date()
    }).returning();
    return result[0];
  }

  // Seed initial data for demo purposes
  private async seedData() {
    try {
      // Seed users
      const [user] = await db.insert(users).values([
        {
          name: 'Demo Çiftçi',
          phone: '05554443322',
          password: 'password123',
          createdAt: new Date()
        },
        {
          name: 'Yeni Kullanıcı',
          phone: '05551712526',
          password: '12345',
          createdAt: new Date()
        }
      ]).returning();

      // Seed crops
      const cropData = [
        {
          name: 'Buğday',
          imageUrl: 'https://cdn.pixabay.com/photo/2016/09/21/04/46/wheat-field-1684052_1280.jpg',
          description: 'Ekmeklik buğday, Türkiye\'nin en önemli tahıl ürünlerinden biridir.',
          growingPeriod: 240,
          optimalTemperature: JSON.stringify({ min: 15, max: 25 }),
          optimalHumidity: JSON.stringify({ min: 50, max: 70 }),
          plantingSeason: 'Sonbahar',
          harvestSeason: 'Haziran-Temmuz'
        },
        {
          name: 'Arpa',
          imageUrl: 'https://cdn.pixabay.com/photo/2018/06/03/13/28/field-3450609_1280.jpg',
          description: 'Arpa, hayvan yemi ve bira üretiminde kullanılan önemli bir tahıl ürünüdür.',
          growingPeriod: 120,
          optimalTemperature: JSON.stringify({ min: 15, max: 25 }),
          optimalHumidity: JSON.stringify({ min: 50, max: 70 }),
          plantingSeason: 'Sonbahar-İlkbahar',
          harvestSeason: 'Haziran'
        },
        {
          name: 'Mısır',
          imageUrl: 'https://cdn.pixabay.com/photo/2014/11/22/22/58/corn-field-542898_1280.jpg',
          description: 'Mısır, hem hayvan yemi hem de insan gıdası olarak kullanılan önemli bir tahıl ürünüdür.',
          growingPeriod: 120,
          optimalTemperature: JSON.stringify({ min: 20, max: 30 }),
          optimalHumidity: JSON.stringify({ min: 60, max: 80 }),
          plantingSeason: 'İlkbahar',
          harvestSeason: 'Sonbahar'
        }
      ];

      const seededCrops = await db.insert(crops).values(cropData).returning();

      // Seed fields
      const fieldData = [
        {
          userId: user.id,
          name: 'Merkez Tarla',
          location: 'Konya, Merkez',
          size: 12,
          unit: 'dönüm',
          coordinates: JSON.stringify({
            type: 'Polygon',
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
          color: '#F8B600',
          notes: 'Ana tarla, buğday ekimi yapılıyor.',
          createdAt: new Date()
        },
        {
          userId: user.id,
          name: 'Doğu Tarla',
          location: 'Konya, Karatay',
          size: 8,
          unit: 'dönüm',
          coordinates: JSON.stringify({
            type: 'Polygon',
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
          color: '#3A7E4F',
          notes: 'Arpa ekimi yapılan ikinci tarla.',
          createdAt: new Date()
        }
      ];

      const seededFields = await db.insert(fields).values(fieldData).returning();

      // Seed tasks
      const now = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const taskData = [
        {
          userId: user.id,
          fieldId: seededFields[0].id,
          title: 'Merkez Tarla Sulama',
          description: 'Buğday tarlası sulama işlemi.',
          taskType: 'watering',
          startDate: now.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0],
          startTime: '08:00',
          endTime: '10:00',
          completed: false,
          priority: 'high',
          createdAt: new Date()
        },
        {
          userId: user.id,
          fieldId: seededFields[1].id,
          title: 'Doğu Tarla Gübreleme',
          description: 'Arpa tarlası gübreleme işlemi.',
          taskType: 'fertilizing',
          startDate: tomorrow.toISOString().split('T')[0],
          endDate: tomorrow.toISOString().split('T')[0],
          startTime: '09:30',
          endTime: '11:30',
          completed: false,
          priority: 'medium',
          createdAt: new Date()
        },
        {
          userId: user.id,
          fieldId: seededFields[0].id,
          title: 'Merkez Tarla Hasat Hazırlığı',
          description: 'Hasat öncesi genel kontrol.',
          taskType: 'harvesting',
          startDate: nextWeek.toISOString().split('T')[0],
          endDate: nextWeek.toISOString().split('T')[0],
          startTime: '10:00',
          endTime: '16:00',
          completed: false,
          priority: 'normal',
          createdAt: new Date()
        }
      ];

      const seededTasks = await db.insert(tasks).values(taskData).returning();

      // Seed field health data
      const healthData = [
        {
          fieldId: seededFields[0].id,
          temperature: 26,
          humidity: 55,
          soilMoisture: 65,
          plantHealth: 'good',
          notes: 'Bitki gelişimi normal seyrediyor.',
          timestamp: new Date()
        },
        {
          fieldId: seededFields[1].id,
          temperature: 27,
          humidity: 48,
          soilMoisture: 28,
          plantHealth: 'medium',
          notes: 'Nem düşük, sulama gerekiyor.',
          timestamp: new Date()
        }
      ];

      await db.insert(fieldHealth).values(healthData).returning();

      console.log('Database seeded successfully');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }
}

// Export storage instance
export const storage = new DatabaseStorage();