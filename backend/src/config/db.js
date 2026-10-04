const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'contract_risk_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// In-memory fallback store when PostgreSQL server is offline during standalone development
const memoryStore = {
  organizations: [
    {
      id: 'org_main_001',
      name: 'Acme Corporation',
      created_at: new Date().toISOString()
    }
  ],
  users: [
    {
      id: 'usr_admin_fixed_001',
      organization_id: 'org_main_001',
      name: 'Contract Analyzer Admin',
      email: 'admin@contractanalyzer.com',
      password_hash: '$2b$10$Ep3BmgJd1aA/.X4W9dYVd.m7Y4g0Z0m0A2/9F6a1b2c3d4e5f6g7h',
      role: 'ADMIN',
      created_at: new Date().toISOString()
    }
  ],
  contracts: [],
  contract_versions: [],
  clauses: [],
  risks: [],
  analyses: [],
  audit_logs: []
};

let useInMemory = false;

const query = async (text, params) => {
  if (useInMemory) {
    return simulateInMemoryQuery(text, params);
  }

  try {
    const start = Date.now();
    const res = await pool.query(text, params);
    return res;
  } catch (err) {
    useInMemory = true;
    return simulateInMemoryQuery(text, params);
  }
};

function simulateInMemoryQuery(text, params = []) {
  const sql = text.toLowerCase().trim();
  
  if (sql.startsWith('select * from users where email')) {
    const user = memoryStore.users.find(u => u.email === params[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  if (sql.startsWith('select * from users where id')) {
    const user = memoryStore.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (sql.startsWith('select * from contracts where organization_id') || sql.startsWith('select * from contracts')) {
    return { rows: memoryStore.contracts, rowCount: memoryStore.contracts.length };
  }

  if (sql.startsWith('select * from contracts where id')) {
    const contract = memoryStore.contracts.find(c => c.id === params[0]);
    return { rows: contract ? [contract] : [], rowCount: contract ? 1 : 0 };
  }

  if (sql.startsWith('insert into contracts')) {
    const contract = {
      id: params[0],
      organization_id: params[1],
      uploaded_by: params[2],
      title: params[3],
      file_path: params[4],
      file_type: params[5],
      file_size: params[6],
      file_hash: params[7],
      status: 'COMPLETED',
      risk_score: typeof params[8] === 'number' ? params[8] : parseFloat(params[8] || 0),
      overall_summary: typeof params[9] === 'string' ? JSON.parse(params[9]) : (params[9] || {}),
      created_at: new Date().toISOString()
    };

    const existingIdx = memoryStore.contracts.findIndex(c => c.id === contract.id);
    if (existingIdx >= 0) {
      memoryStore.contracts[existingIdx] = contract;
    } else {
      memoryStore.contracts.push(contract);
    }

    return { rows: [contract], rowCount: 1 };
  }

  if (sql.startsWith('delete from contracts where id')) {
    memoryStore.contracts = memoryStore.contracts.filter(c => c.id !== params[0]);
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  query,
  pool,
  memoryStore
};
