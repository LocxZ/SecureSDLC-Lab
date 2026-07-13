const sqlite3 = require("sqlite3").verbose();
const express = require("express");
const bcrypt = require("bcrypt");
const session = require("express-session");
const helmet = require("helmet");

const app = express();
const PORT = 3000;

if (!process.env.SESSION_SECRET) {
    console.error("SESSION_SECRET environment variable is required");
    process.exit(1);
}

const db = new sqlite3.Database(
    process.env.DB_PATH || "./taskflow.db"
);

app.disable("x-powered-by");

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:"],
                objectSrc: ["'none'"],
                frameAncestors: ["'none'"],
                upgradeInsecureRequests: []
            }
        },
        referrerPolicy: {
            policy: "no-referrer"
        }
    })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
    session({
        name: "taskflow.sid",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            domain: process.env.COOKIE_DOMAIN,
            maxAge: 30 * 60 * 1000
        }
    })
);

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            password TEXT,
            role TEXT
        )
    `);

    createDefaultUsers();
});

async function createDefaultUsers() {
    try {
        const adminPassword = await bcrypt.hash("admin123", 12);
        const userPassword = await bcrypt.hash("user123", 12);

        db.run(
            `
            INSERT OR IGNORE INTO users
            (id, username, password, role)
            VALUES (?, ?, ?, ?)
            `,
            [1, "admin", adminPassword, "admin"]
        );

        db.run(
            `
            INSERT OR IGNORE INTO users
            (id, username, password, role)
            VALUES (?, ?, ?, ?)
            `,
            [2, "user", userPassword, "user"]
        );
    } catch (err) {
        console.error(err.message);
    }
}

function requireAuth(req, res, next) {
    if (!req.session.user) {
        return res.status(401).send("Authentication required");
    }

    next();
}

function requireAdmin(req, res, next) {
    if (req.session.user.role !== "admin") {
        return res.status(403).send("Forbidden");
    }

    next();
}

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

            <button type="submit">
                Login
            </button>

        </form>
    `);
});

app.post("/login", (req, res) => {

    const { username, password } = req.body;

    db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (err) {
                return res.status(500).send("Database error");
            }

            if (!user) {
                return res.status(401).send("Invalid credentials");
            }

            const valid = await bcrypt.compare(
                password,
                user.password
            );

            if (!valid) {
                return res.status(401).send("Invalid credentials");
            }

            req.session.regenerate((err) => {

                if (err) {
                    return res
                        .status(500)
                        .send("Session error");
                }

                req.session.user = {
                    id: user.id,
                    username: user.username,
                    role: user.role
                };

                res.send(`
                    <h2>Welcome ${user.username}</h2>

                    <p>Role: ${user.role}</p>

                    <a href="/admin">
                        Admin Dashboard
                    </a>

                    <br><br>

                    <form action="/logout" method="POST">
                        <button>
                            Logout
                        </button>
                    </form>
                `);
            });

        }
    );
});

app.get(
    "/admin",
    requireAuth,
    requireAdmin,
    (req, res) => {

        res.send(`
            <h1>Admin Dashboard</h1>

            <p>
                Welcome ${req.session.user.username}
            </p>

            <p>
                Only administrators can access this page.
            </p>

            <form action="/logout" method="POST">
                <button>
                    Logout
                </button>
            </form>
        `);
    }
);

app.post(
    "/logout",
    requireAuth,
    (req, res) => {

        req.session.destroy((err) => {

            if (err) {
                return res
                    .status(500)
                    .send("Logout failed");
            }

            res.clearCookie("taskflow.sid");

            res.redirect("/");
        });

    }
);

app.listen(PORT, () => {
    console.log(
        `TaskFlow running on http://localhost:${PORT}`
    );
});
