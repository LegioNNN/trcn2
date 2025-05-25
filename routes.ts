import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getWeatherData } from "./services/weatherService";
import { isAuthenticated, setUserSession, clearUserSession } from "./middleware/auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const httpServer = createServer(app);

  // =====================
  // Authentication Routes
  // =====================
  app.options('/api/auth/register', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.options('/api/auth/register', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { name, phone, password } = req.body;

      console.log(`Registration attempt: name=${name}, phone=${phone}, password=****`);

      // Check if user already exists
      const existingUser = await storage.getUserByPhone(phone);
      if (existingUser) {
        console.log(`Registration failed: Phone ${phone} already exists`);
        return res.status(409).json({ message: 'User with this phone number already exists' });
      }

      // Create new user
      const user = await storage.createUser({ name, phone, password });

      console.log(`User created successfully: id=${user.id}, phone=${phone}`);

      // Don't return password
      const { password: _, ...userWithoutPassword } = user;

      // Set user in session (auto-login after registration)
      setUserSession(req, userWithoutPassword);

      console.log(`Registration successful: user.id=${user.id}, sessionID=${req.sessionID}`);

      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Registration failed' });
    }
  });

  app.options('/api/auth/login', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phone, password } = req.body;

      console.log(`Login attempt: phone=${phone}, password=****`);

      // Find user by phone
      const user = await storage.getUserByPhone(phone);
      if (!user) {
        console.log(`Login failed: User with phone ${phone} not found`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      if (user.password !== password) {
        console.log(`Login failed: Invalid password for user ${phone}`);
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Don't return password
      const { password: _, ...userWithoutPassword } = user;

      // Set user in session
      setUserSession(req, userWithoutPassword);

      console.log(`Login successful: user.id=${user.id}, sessionID=${req.sessionID}`);
      console.log(`Session data:`, req.session);

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  app.options('/api/auth/logout', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.post('/api/auth/logout', (req, res) => {
    clearUserSession(req);
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.status(200).json({ message: 'Logged out successfully' });
    });
  });

  app.options('/api/auth/me', (req, res) => {
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  app.get('/api/auth/me', (req, res) => {
    console.log('GET /api/auth/me - Session:', req.session?.id);
    console.log('GET /api/auth/me - User:', req.session?.user ? 'Exists' : 'Missing');

    if (req.session && req.session.user) {
      return res.status(200).json(req.session.user);
    }
    res.status(401).json({ message: 'Unauthorized' });
  });

  // ============
  // User Routes
  // ============
  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Don't return password
      const { password, ...userWithoutPassword } = user;

      res.status(200).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // ============
  // Field Routes
  // ============
  app.get('/api/fields', isAuthenticated, async (req, res) => {
    try {
      const fields = await storage.getAllFields();
      res.status(200).json(fields);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get fields' });
    }
  });

  app.get('/api/fields/:id', isAuthenticated, async (req, res) => {
    try {
      const fieldId = Number(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: 'Invalid field ID' });
      }
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }
      res.status(200).json(field);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get field' });
    }
  });

  app.post('/api/fields', isAuthenticated, async (req, res) => {
    try {
      // Add the current user's ID to the field data
      const fieldData = {
        ...req.body,
        userId: req.user.id
      };
      const field = await storage.createField(fieldData);
      res.status(201).json(field);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create field' });
    }
  });

  app.put('/api/fields/:id', isAuthenticated, async (req, res) => {
    try {
      const fieldId = Number(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: 'Invalid field ID' });
      }

      // Check if the field belongs to the current user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }

      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this field' });
      }

      const updatedField = await storage.updateField(fieldId, req.body);
      res.status(200).json(updatedField);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update field' });
    }
  });

  app.delete('/api/fields/:id', isAuthenticated, async (req, res) => {
    try {
      const fieldId = Number(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: 'Invalid field ID' });
      }

      // Check if the field belongs to the current user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }

      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to delete this field' });
      }

      const success = await storage.deleteField(fieldId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete field' });
    }
  });

  // ============
  // Crop Routes
  // ============
  app.get('/api/crops', isAuthenticated, async (req, res) => {
    try {
      const crops = await storage.getAllCrops();
      res.status(200).json(crops);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get crops' });
    }
  });

  app.get('/api/crops/:id', isAuthenticated, async (req, res) => {
    try {
      const crop = await storage.getCrop(parseInt(req.params.id));
      if (!crop) {
        return res.status(404).json({ message: 'Crop not found' });
      }
      res.status(200).json(crop);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get crop' });
    }
  });

  app.post('/api/crops', isAuthenticated, async (req, res) => {
    try {
      // Only admin should be able to create crops
      // For now, we'll allow any authenticated user
      const crop = await storage.createCrop(req.body);
      res.status(201).json(crop);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create crop' });
    }
  });

  // ============
  // Task Routes
  // ============
  app.get('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      // Get tasks for the current user
      const tasks = await storage.getTasksByUserId(req.user.id);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get tasks' });
    }
  });

  app.get('/api/tasks/:id', isAuthenticated, async (req, res) => {
    try {
      const task = await storage.getTask(parseInt(req.params.id));
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Check if the task belongs to the current user
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view this task' });
      }

      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get task' });
    }
  });

  app.post('/api/tasks', isAuthenticated, async (req, res) => {
    try {
      // Add the current user's ID to the task data
      const taskData = {
        ...req.body,
        userId: req.user.id
      };
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  app.patch('/api/tasks/:id/complete', isAuthenticated, async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);

      // Check if the task belongs to the current user
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }

      const updatedTask = await storage.updateTask(taskId, { completed: true });
      res.status(200).json(updatedTask);
    } catch (error) {
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  app.get('/api/fields/:id/tasks', isAuthenticated, async (req, res) => {
    try {
      const fieldId = Number(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: 'Invalid field ID' });
      }

      // Check if the field belongs to the current user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }

      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view tasks for this field' });
      }

      const tasks = await storage.getTasksByFieldId(fieldId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get field tasks' });
    }
  });

  // ================
  // Field Health Routes
  // ================
  app.get('/api/fields/health', isAuthenticated, async (req, res) => {
    try {
      // Get user's fields first
      const userFields = await storage.getFieldsByUserId(req.user.id);

      if (!userFields || userFields.length === 0) {
        return res.status(200).json([]);
      }

      // Get health data for each field
      const healthPromises = userFields.map(async (field) => {
        const health = await storage.getFieldHealth(field.id) || {
          fieldId: field.id,
          soilMoisture: 65,
          soilQuality: 'good',
          pestRisk: 'low',
          nutrientLevels: { nitrogen: 70, phosphorus: 60, potassium: 80 },
          lastUpdated: new Date().toISOString()
        };
        return { ...health, fieldName: field.name };
      });

      const healthData = await Promise.all(healthPromises);
      res.status(200).json(healthData);
    } catch (error) {
      console.error('Failed to get field health:', error);
      res.status(500).json({ message: 'Failed to get field health data' });
    }
  });

  app.get('/api/fields/:id/health', isAuthenticated, async (req, res) => {
    try {
      const fieldId = Number(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: 'Invalid field ID' });
      }

      // Check if the field belongs to the current user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }

      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to view health data for this field' });
      }

      const healthData = await storage.getFieldHealth(fieldId);
      if (!healthData) {
        // Return default placeholder data
        return res.status(200).json({
          fieldId,
          soilMoisture: 65,
          soilQuality: 'good',
          pestRisk: 'low',
          nutrientLevels: { nitrogen: 70, phosphorus: 60, potassium: 80 },
          lastUpdated: new Date().toISOString()
        });
      }

      res.status(200).json(healthData);
    } catch (error) {
      console.error('Failed to get field health data:', error);
      // Return default data to avoid UI errors
      res.status(200).json({
        fieldId: parseInt(req.params.id),
        soilMoisture: 65,
        soilQuality: 'good',
        pestRisk: 'low',
        nutrientLevels: { nitrogen: 70, phosphorus: 60, potassium: 80 },
        lastUpdated: new Date().toISOString()
      });
    }
  });

  app.post('/api/fields/:id/health', isAuthenticated, async (req, res) => {
    try {
      const fieldId = Number(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: 'Invalid field ID' });
      }

      // Check if the field belongs to the current user
      const field = await storage.getField(fieldId);
      if (!field) {
        return res.status(404).json({ message: 'Field not found' });
      }

      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to add health data for this field' });
      }

      const healthData = await storage.createFieldHealth({ ...req.body, fieldId });
      res.status(201).json(healthData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to create field health data' });
    }
  });

  // ================
  // Weather API Routes
  // ================
  app.get('/api/weather', isAuthenticated, async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and longitude are required' });
      }

      const weatherData = await getWeatherData(
        parseFloat(lat as string), 
        parseFloat(lon as string)
      );

      // Store the weather history for the user
      await storage.createWeatherHistory({
        userId: req.user.id,
        location: `${lat},${lon}`,
        data: JSON.stringify(weatherData)
      });

      res.status(200).json(weatherData);
    } catch (error) {
      console.error('Weather API error:', error);
      res.status(500).json({ message: 'Failed to get weather data' });
    }
  });

  return httpServer;
}