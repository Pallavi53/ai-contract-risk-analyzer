const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

let dbMode = 'pg';
let pgPool = null;
let sqliteDb = null;

const PG_CONFIG = {
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/contract_analyzer',
  connectionTimeoutMillis: 3000
};

async function initDB() {
  try {
    pgPool = new Pool(PG_CONFIG);
    await pgPool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL Database.');
    dbMode = 'pg';
    await createPgTables();
  } catch (err) {
    console.log('[DB] PostgreSQL unavailable, falling back to SQLite local database mode.');
    dbMode = 'sqlite';
    const dbPath = path.join(__dirname, 'database.sqlite');
    sqliteDb = new sqlite3.Database(dbPath);
    await createSqliteTables();
  }
  await seedDefaultUser();
}

async function createPgTables() {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(100) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contracts (
      id VARCHAR(100) PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contract_versions (
      id VARCHAR(100) PRIMARY KEY,
      contract_id VARCHAR(100) REFERENCES contracts(id) ON DELETE CASCADE,
      version_number INT NOT NULL DEFAULT 1,
      file_path VARCHAR(500) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS clauses (
      id VARCHAR(100) PRIMARY KEY,
      version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
      clause_type VARCHAR(100) NOT NULL,
      section VARCHAR(255),
      text TEXT NOT NULL,
      page_number INT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS risks (
      id VARCHAR(100) PRIMARY KEY,
      clause_id VARCHAR(100) REFERENCES clauses(id) ON DELETE CASCADE,
      version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
      risk_type VARCHAR(100) NOT NULL,
      severity VARCHAR(50) NOT NULL,
      risk_score INT NOT NULL,
      reason TEXT NOT NULL,
      evidence TEXT NOT NULL,
      page_number INT NOT NULL,
      confidence FLOAT DEFAULT 0.95
    );
    CREATE TABLE IF NOT EXISTS analyses (
      id VARCHAR(100) PRIMARY KEY,
      version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
      overall_score INT NOT NULL,
      risk_level VARCHAR(50) NOT NULL,
      financial_score INT DEFAULT 0,
      termination_score INT DEFAULT 0,
      liability_score INT DEFAULT 0,
      ip_score INT DEFAULT 0,
      restrictions_score INT DEFAULT 0,
      data_score INT DEFAULT 0,
      other_score INT DEFAULT 0,
      summary TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pgPool.query(query);
}

function createSqliteTables() {
  return new Promise((resolve, reject) => {
    sqliteDb.serialize(() => {
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS contracts (
          id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          file_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS contract_versions (
          id TEXT PRIMARY KEY,
          contract_id TEXT NOT NULL,
          version_number INTEGER NOT NULL DEFAULT 1,
          file_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS clauses (
          id TEXT PRIMARY KEY,
          version_id TEXT NOT NULL,
          clause_type TEXT NOT NULL,
          section TEXT,
          text TEXT NOT NULL,
          page_number INTEGER NOT NULL
        )
      `);
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS risks (
          id TEXT PRIMARY KEY,
          clause_id TEXT NOT NULL,
          version_id TEXT NOT NULL,
          risk_type TEXT NOT NULL,
          severity TEXT NOT NULL,
          risk_score INTEGER NOT NULL,
          reason TEXT NOT NULL,
          evidence TEXT NOT NULL,
          page_number INTEGER NOT NULL,
          confidence REAL DEFAULT 0.95
        )
      `);
      sqliteDb.run(`
        CREATE TABLE IF NOT EXISTS analyses (
          id TEXT PRIMARY KEY,
          version_id TEXT NOT NULL,
          overall_score INTEGER NOT NULL,
          risk_level TEXT NOT NULL,
          financial_score INTEGER DEFAULT 0,
          termination_score INTEGER DEFAULT 0,
          liability_score INTEGER DEFAULT 0,
          ip_score INTEGER DEFAULT 0,
          restrictions_score INTEGER DEFAULT 0,
          data_score INTEGER DEFAULT 0,
          other_score INTEGER DEFAULT 0,
          summary TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
}

async function seedDefaultUser() {
  const email = 'admin@contractanalyzer.com';
  const rawPassword = 'Admin@123';
  const passwordHash = await bcrypt.hash(rawPassword, 10);
  const userId = 'user_admin_001';

  if (dbMode === 'pg') {
    await pgPool.query(`
      INSERT INTO users (id, email, password_hash)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO NOTHING
    `, [userId, email, passwordHash]);
  } else {
    sqliteDb.run(`
      INSERT OR IGNORE INTO users (id, email, password_hash)
      VALUES (?, ?, ?)
    `, [userId, email, passwordHash]);
  }
  console.log(`[DB] Default user verified: ${email}`);
}

// Database helper functions
async function query(sql, params = []) {
  if (dbMode === 'pg') {
    const res = await pgPool.query(sql, params);
    return res.rows;
  } else {
    return new Promise((resolve, reject) => {
      // Standardize SQLite params syntax from $1, $2 to ?, ?
      let paramCount = 0;
      const convertedSql = sql.replace(/\$\d+/g, () => '?');
      if (convertedSql.trim().toUpperCase().startsWith('SELECT')) {
        sqliteDb.all(convertedSql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(convertedSql, params, function (err) {
          if (err) reject(err);
          else resolve([{ lastID: this.lastID, changes: this.changes }]);
        });
      }
    });
  }
}

module.exports = {
  initDB,
  query
};
