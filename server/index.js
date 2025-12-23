import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from './models/Task.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import { auth } from './middleware/auth.js';

// Fix for __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create 'uploads' folder if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// 1. Load the secrets
dotenv.config();

const app = express();

// 2. Middleware (The Gatekeepers)
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Database Connection (The Memory)
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env file!");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully! 🍃");
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
    process.exit(1); 
  }
};

// Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});
const upload = multer({ storage });

// 4. Routes (The API Endpoints)

// Public Route (Test)
app.get('/', (req, res) => {
  res.send("Hello from the Backend! 🚀");
});

// --- AUTH ROUTES (Public) ---

// Register User
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login User
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user._id, name: user.name } });
  } catch (error) {
    res.status(500).json({ message: "Error logging in" });
  }
});

// --- TASK ROUTES (Protected - Login Required) ---

// Create a Task (Protected)
// Added 'auth' middleware and 'user: req.user.id'
app.post('/tasks', auth, upload.single('image'), async (req, res) => {
  try {
    const { title } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
    
    const newTask = new Task({ 
      title,
      image: imagePath,
      user: req.user.id // This comes from the auth middleware
    });
    
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: "Error saving task" });
  }
});

// Get all Tasks (Protected)
// Added 'auth' middleware and filter by user ID
app.get('/tasks', auth, async (req, res) => {
  try {
    // Only get tasks that belong to the logged-in user
    const tasks = await Task.find({ user: req.user.id }); 
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// Update Task (Protected)
app.put('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Find task by ID AND verify it belongs to the user
    const task = await Task.findOne({ _id: id, user: req.user.id });
    
    if (!task) return res.status(404).json({ message: "Task not found" });
    
    task.isCompleted = !task.isCompleted;
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// Delete Task (Protected)
app.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    // Find and delete only if it belongs to the user
    const task = await Task.findOneAndDelete({ _id: id, user: req.user.id });
    
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

// 5. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});