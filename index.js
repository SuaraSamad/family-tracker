import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// ---- DATABASE SETUP ----
let dbConfig;

if (process.env.DATABASE_URL) {
  // On Render, use their DATABASE_URL with SSL
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  };
} else {
  // Local dev, use individual PG_* env vars
  dbConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT),
  };
}

const db = new pg.Client(dbConfig);
await db.connect();

// ---- APP SETUP ----
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ---- IN-MEMORY FALLBACK USERS (will get overwritten by DB query) ----
let currentUserId = 1;
let users = [
  { id: 1, name: "Samad", color: "teal" },
  { id: 2, name: "Najib", color: "powderblue" },
];

// ---- HELPERS ----
async function checkVisited() {
  const result = await db.query(
    `SELECT country_code
       FROM visited_countries
      WHERE user_id = $1`,
    [currentUserId]
  );
  return result.rows.map((r) => r.country_code);
}

async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((u) => u.id === Number(currentUserId));
}

// ---- ROUTES ----
app.get("/", async (req, res) => {
  const countries = await checkVisited();
  const currentUser = await getCurrentUser();
  res.render("index", {
    countries,
    total: countries.length,
    users,
    color: currentUser.color,
  });
});

app.post("/add", async (req, res) => {
  const input = req.body.country.toLowerCase();
  const { rows } = await db.query(
    `SELECT country_code
       FROM countries
      WHERE LOWER(country_name) LIKE '%' || $1 || '%'`,
    [input]
  );

  if (rows.length) {
    const countryCode = rows[0].country_code;
    await db.query(
      `INSERT INTO visited_countries (country_code, user_id)
         VALUES ($1, $2)`,
      [countryCode, currentUserId]
    );
  }
  res.redirect("/");
});

app.post("/user", (req, res) => {
  if (req.body.add === "new") {
    res.render("new");
  } else {
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

app.post("/new", async (req, res) => {
  const { name, color } = req.body;
  const { rows } = await db.query(
    `INSERT INTO users (name, color)
      VALUES ($1, $2)
      RETURNING id`,
    [name, color]
  );
  currentUserId = rows[0].id;
  res.redirect("/");
});

// ---- START ----
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
