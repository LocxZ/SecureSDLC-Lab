const sqlite3 = require("sqlite3").verbose();
const express = require("express");

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("./taskflow.db");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        password TEXT
    )
`);

db.run(`
    INSERT OR IGNORE INTO users (id, username, password)
    VALUES (1, 'admin', 'admin123')
`);

app.get("/", (req, res) => {
    res.send(`
        <h1>TaskFlow</h1>
        <p>Secure task management for modern teams.</p>

        <h2>Login</h2>

        <form action="/login" method="POST">
            <input
                type="text"
                name="username"
                placeholder="Username"
            >

            <br><br>

            <input
                type="password"
                name="password"
                placeholder="Password"
            >

            <br><br>

            <button type="submit">Login</button>
        </form>
    `);
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const query = `
        SELECT * FROM users
        WHERE username = ?
        AND password = ?
    `;

    db.get(query, [username, password], (err, user) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).send("Database error");
        }

        if (user) {
            return res.send(`Welcome ${user.username}`);
        }

        return res.status(401).send("Invalid credentials");
    });
});

app.listen(PORT, () => {
    console.log(`TaskFlow running on http://localhost:${PORT}`);
});