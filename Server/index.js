// --- Imports ---
import bodyparser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import morgan from "morgan";
import cors from "cors";
import { dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import bcrypt from "bcrypt";


// --- Express Setup ---
const app = express();
const port = 3001;
const saltRounds = 10;



// --- Middlewares (dirname, Body Parser, Morgan, .env) ---
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(__dirname + '/public'));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
dotenv.config();
const DB_PASSWORD = process.env.DB_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET;

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(cors({
  origin: 'http://localhost:5173', // should update to const for Vite port
  credentials: true,
}));

const isAuthenticated = (req, res, next) => { // auth check
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

// --- Database Setup ---
const { Pool } = pg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'world',
  password: DB_PASSWORD,
  port: 5432,
});
pool.connect().then(() => {
  console.log("Connected to PostgreSQL database."); // debug testing
}).catch((err) => {
  console.error("Failed to connect to PostgreSQL:", err);
});

// --- Routes ---

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error logging out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// Sign up
app.post("/api/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  try {
    const userExists = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "Email already taken. Please choose another." });
    }
    const hash = await bcrypt.hash(password, saltRounds);
    await pool.query(
      "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
      [user_id, hash, name]
    );
    res.status(201).json({ message: "Signup successful. Please sign in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// Sign in
app.post("/api/signin", async (req, res) => {
  const { user_id, password } = req.body;
  const hashedPassword = bcrypt.hash(password, saltRounds)
  console.log("Signin attempt:", { user_id, hashedPassword }); // debug testing
  
  if (!user_id || !password) {
    return res.status(400).json({ success: false, message: "User ID and password are required." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id]);
    
    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid user ID or password." });
    }
    
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    
    if (match) {
      req.session.userId = user.user_id;
      req.session.userName = user.name;
  
      res.json({ success: true, user: { user_id: user.user_id, name: user.name } });
    } else {
      return res.status(400).json({ success: false, message: "Invalid user ID or password." });
    }

  } catch (err) {
    console.error("Error during signin:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }

});

// Fetch current user
app.get('/api/currentUser', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ success: true, user: { user_id: req.session.userId, name: req.session.userName } });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
});

// Fetch blog posts
app.get('/api/blogPosts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM blogs ORDER BY date_created DESC');
    res.json({ success: true, blogPosts: result.rows });
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Post submission
app.post('/api/blogPosts', isAuthenticated, async (req, res) => {
  const { title, body } = req.body;
  const creatorName = req.session.userName;
  const creatorUserId = req.session.userId;

  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required.' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO blogs (creator_name, creator_user_id, title, body) VALUES ($1, $2, $3, $4) RETURNING *',
      [creatorName, creatorUserId, title, body]
    );
    res.json({ success: true, blogPost: result.rows[0] });
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Edit post
app.put('/api/blogPosts/:id', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const { title, body } = req.body;
  const userId = req.session.userId;
  const editDate = new Date();

  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required.' });
  }

  try {
    const postResult = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    const post = postResult.rows[0];
    if (post.creator_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    const updateResult = await pool.query(
      'UPDATE blogs SET title = $1, body = $2, date_created = $3 WHERE blog_id = $4 RETURNING *',
      [title, body, editDate, postId]
    );
    res.json({ success: true, blogPost: updateResult.rows[0] });
  } catch (err) {
    console.error('Error updating blog post:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// delete post
app.delete('/api/blogPosts/:id', isAuthenticated, async (req, res) => {
  const postId = req.params.id;
  const userId = req.session.userId;

  try {

    const postResult = await pool.query('SELECT * FROM blogs WHERE blog_id = $1', [postId]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }
    const post = postResult.rows[0];
    if (post.creator_user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }

    await pool.query('DELETE FROM blogs WHERE blog_id = $1', [postId]);
    res.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err) {
    console.error('Error deleting blog post:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Start server
app.listen(port, () => {
  console.log("Server is running on port:", port);
});
