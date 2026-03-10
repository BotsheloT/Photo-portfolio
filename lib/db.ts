import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DATA_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DATA_DIR, 'portfolio.db')

declare global {
  // eslint-disable-next-line no-var
  var _portfolioDb: Database.Database | undefined
}

function createDb(): Database.Database {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  const database = new Database(DB_PATH)
  database.pragma('journal_mode = WAL')
  database.pragma('foreign_keys = ON')

  database.exec(`
    CREATE TABLE IF NOT EXISTS shoots (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      slug        TEXT UNIQUE NOT NULL,
      category    TEXT CHECK(category IN ('personal', 'collabs')) NOT NULL,
      description TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS images (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      shoot_id       INTEGER REFERENCES shoots(id) ON DELETE CASCADE,
      filename       TEXT NOT NULL,
      cloudinary_url TEXT,
      blur_data_url  TEXT,
      is_thumbnail   BOOLEAN DEFAULT 0,
      dominant_hue   REAL,
      sort_order     INTEGER DEFAULT 0,
      width          INTEGER,
      height         INTEGER
    );

    CREATE TABLE IF NOT EXISTS site_content (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `)

  // Seed default Info page content
  const existing = database
    .prepare('SELECT value FROM site_content WHERE key = ?')
    .get('info')

  if (!existing) {
    const defaultInfo = JSON.stringify({
      name: 'Botshelo',
      bio: `Botshelo is a Johannesburg-based photographer whose work explores the intersection of identity, light, and contemporary African urban life. With a keen eye for the quiet moments that define a city in motion, his personal projects document the texture of daily existence in Johannesburg — its architecture, its people, and the stories held between frames.

His collaborative work spans fashion editorials, portrait sessions, and creative direction for independent brands and cultural projects across South Africa. Botshelo brings a documentary sensitivity to every frame, whether working alone on the streets of Jozi or alongside stylists and art directors in studio.`,
      email: 'hello@botshelo.co.za',
      instagram: 'botshelo',
      location: 'Johannesburg, South Africa',
    })
    database
      .prepare('INSERT INTO site_content (key, value) VALUES (?, ?)')
      .run('info', defaultInfo)
  }

  return database
}

// Singleton — reuse across hot reloads in dev
const db = global._portfolioDb ?? createDb()
if (process.env.NODE_ENV !== 'production') global._portfolioDb = db

export default db
