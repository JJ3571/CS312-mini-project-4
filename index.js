const express = require("express");
e;
const bcrypt = require("bcrypt");
const db = require("./db"); // Assuming you have a db module for database operations
const app = express();
const saltRounds = 10;

app.use(express.json());

app.post("/api/signup", async (req, res) => {
  const { user_id, password, name } = req.body;
  try {
    const userExists = await db.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    if (userExists.rows.length > 0) {
      res.send("Email already taken. Please choose another.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          return res.send("Error hashing password.");
        } else {
          await db.query(
            "INSERT INTO users (user_id, password, name) VALUES ($1, $2, $3)",
            [user_id, hash, name]
          );
          res.send("Signup successful. Please sign in.");
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error.");
  }
});

app.post("/api/signin", async (req, res) => {
  const { user_id, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    if (result.rows.length === 0) {
      return res.send("Invalid user ID or password.");
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      res.send("Signin successful.");
    } else {
      res.send("Invalid user ID or password.");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error.");
  }
});

app.get("/api/blogPosts", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM blog_posts");
    res.json({ blogPosts: result.rows, user: req.session.user });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server error.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
