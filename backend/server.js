const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');
const { initDB, query } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_contract_key_2026';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

app.use(cors());
app.use(express.json());

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

// File validation per section 6 (PDF only, max 20MB)
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'));
    }
  }
});

// Counter for human readable contract IDs: contract_001, contract_002...
let contractCounter = 1;

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const rows = await query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    return res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 2. POST /api/contracts/upload
app.post('/api/contracts/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file uploaded.' });
  }

  try {
    // Generate UNIQUE contract ID per requirement 6
    const contractId = `contract_${String(contractCounter++).padStart(3, '0')}_${Date.now().toString().slice(-4)}`;
    const versionId = `version_${contractId}_v1`;

    await query(
      'INSERT INTO contracts (id, filename, file_path) VALUES ($1, $2, $3)',
      [contractId, req.file.originalname, req.file.path]
    );

    await query(
      'INSERT INTO contract_versions (id, contract_id, version_number, file_path) VALUES ($1, $2, $3, $4)',
      [versionId, contractId, 1, req.file.path]
    );

    return res.json({
      contract_id: contractId,
      version_id: versionId,
      filename: req.file.originalname,
      file_path: req.file.path,
      message: 'Contract uploaded successfully.'
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to record uploaded contract.' });
  }
});

// 3. POST /api/contracts/:id/analyze
app.post('/api/contracts/:id/analyze', async (req, res) => {
  const contractId = req.params.id;

  try {
    const contracts = await query('SELECT * FROM contracts WHERE id = $1', [contractId]);
    if (contracts.length === 0) {
      return res.status(404).json({ error: 'Contract not found.' });
    }
    const contract = contracts[0];

    const versions = await query(
      'SELECT * FROM contract_versions WHERE contract_id = $1 ORDER BY version_number DESC LIMIT 1',
      [contractId]
    );
    if (versions.length === 0) {
      return res.status(404).json({ error: 'Contract version not found.' });
    }
    const version = versions[0];

    // Check if file exists on disk
    if (!fs.existsSync(contract.file_path)) {
      return res.status(404).json({ error: 'Contract PDF file missing on server.' });
    }

    // Call FastAPI AI service
    const formData = new FormData();
    formData.append('file', fs.createReadStream(contract.file_path), contract.filename);
    formData.append('document_id', contractId);
    formData.append('version_id', version.id);

    console.log(`[Backend] Sending contract ${contractId} to AI service at ${AI_SERVICE_URL}/ai/analyze...`);
    
    let aiResponse;
    try {
      aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000
      });
    } catch (aiErr) {
      console.error('[AI Service Failure]:', aiErr.message);
      return res.status(503).json({
        error: 'AI analysis failed. Please check the AI service and try again.'
      });
    }

    const aiData = aiResponse.data;

    // Save clauses to DB
    for (const c of aiData.clauses) {
      await query(
        'INSERT INTO clauses (id, version_id, clause_type, section, text, page_number) VALUES ($1, $2, $3, $4, $5, $6)',
        [c.id, version.id, c.clause_type, c.section, c.text, c.page]
      );
    }

    // Save risks to DB
    for (const r of aiData.risks) {
      await query(
        'INSERT INTO risks (id, clause_id, version_id, risk_type, severity, risk_score, reason, evidence, page_number, confidence) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
        [r.id, r.clause_id, version.id, r.risk_type, r.severity, r.score_contribution, r.reason, r.evidence, r.page_number, r.confidence || 0.95]
      );
    }

    // Save analysis to DB
    const analysisId = `analysis_${contractId}_${Date.now()}`;
    const bd = aiData.breakdown;
    await query(
      `INSERT INTO analyses 
       (id, version_id, overall_score, risk_level, financial_score, termination_score, liability_score, ip_score, restrictions_score, data_score, other_score, summary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        analysisId, version.id, aiData.overall_score, aiData.risk_level,
        bd.financial_score, bd.termination_score, bd.liability_score,
        bd.ip_score, bd.restrictions_score, bd.data_score, bd.other_score,
        aiData.summary
      ]
    );

    return res.json({
      contract_id: contractId,
      version_id: version.id,
      filename: contract.filename,
      overall_score: aiData.overall_score,
      risk_level: aiData.risk_level,
      breakdown: aiData.breakdown,
      summary: aiData.summary,
      clauses: aiData.clauses,
      risks: aiData.risks
    });
  } catch (err) {
    console.error('Analysis error:', err);
    return res.status(500).json({ error: 'Failed to complete contract analysis.' });
  }
});

// 4. GET /api/contracts/:id
app.get('/api/contracts/:id', async (req, res) => {
  try {
    const contracts = await query('SELECT * FROM contracts WHERE id = $1', [req.params.id]);
    if (contracts.length === 0) return res.status(404).json({ error: 'Contract not found' });
    res.json(contracts[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET /api/contracts/:id/analysis
app.get('/api/contracts/:id/analysis', async (req, res) => {
  try {
    const versions = await query('SELECT id FROM contract_versions WHERE contract_id = $1 ORDER BY version_number DESC LIMIT 1', [req.params.id]);
    if (versions.length === 0) return res.status(404).json({ error: 'Version not found' });

    const analyses = await query('SELECT * FROM analyses WHERE version_id = $1 ORDER BY created_at DESC LIMIT 1', [versions[0].id]);
    if (analyses.length === 0) return res.status(404).json({ error: 'Analysis not found' });

    const risks = await query('SELECT * FROM risks WHERE version_id = $1', [versions[0].id]);
    const clauses = await query('SELECT * FROM clauses WHERE version_id = $1', [versions[0].id]);

    const a = analyses[0];
    res.json({
      analysis_id: a.id,
      version_id: a.version_id,
      overall_score: a.overall_score,
      risk_level: a.risk_level,
      breakdown: {
        financial_score: a.financial_score,
        termination_score: a.termination_score,
        liability_score: a.liability_score,
        ip_score: a.ip_score,
        restrictions_score: a.restrictions_score,
        data_score: a.data_score,
        other_score: a.other_score,
        max_financial: 25,
        max_termination: 15,
        max_liability: 20,
        max_ip: 10,
        max_restrictions: 10,
        max_data: 10,
        max_other: 10
      },
      summary: a.summary,
      risks,
      clauses
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. GET /api/contracts/:id/risks
app.get('/api/contracts/:id/risks', async (req, res) => {
  try {
    const versions = await query('SELECT id FROM contract_versions WHERE contract_id = $1 LIMIT 1', [req.params.id]);
    if (versions.length === 0) return res.status(404).json({ error: 'Version not found' });

    const risks = await query('SELECT * FROM risks WHERE version_id = $1', [versions[0].id]);
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. POST /api/contracts/:id/chat
app.post('/api/contracts/:id/chat', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'Question is required' });

  try {
    const versions = await query('SELECT id FROM contract_versions WHERE contract_id = $1 ORDER BY version_number DESC LIMIT 1', [req.params.id]);
    if (versions.length === 0) return res.status(404).json({ error: 'Contract version not found' });

    const aiRes = await axios.post(`${AI_SERVICE_URL}/ai/chat`, {
      version_id: versions[0].id,
      question
    });

    return res.json(aiRes.data);
  } catch (err) {
    console.error('Chat API error:', err.message);
    return res.status(500).json({
      answer: "The uploaded contract does not contain sufficient information to answer this question.",
      source: "Error",
      page_number: 0
    });
  }
});

// 8. POST /api/contracts/compare
app.post('/api/contracts/compare', upload.fields([{ name: 'file1' }, { name: 'file2' }]), async (req, res) => {
  if (!req.files || !req.files['file1'] || !req.files['file2']) {
    return res.status(400).json({ error: 'Both Version 1 and Version 2 PDF files are required.' });
  }

  try {
    const file1 = req.files['file1'][0];
    const file2 = req.files['file2'][0];

    // Process file 1 with AI
    const form1 = new FormData();
    form1.append('file', fs.createReadStream(file1.path), file1.originalname);
    const ai1 = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, form1, { headers: form1.getHeaders() });

    // Process file 2 with AI
    const form2 = new FormData();
    form2.append('file', fs.createReadStream(file2.path), file2.originalname);
    const ai2 = await axios.post(`${AI_SERVICE_URL}/ai/analyze`, form2, { headers: form2.getHeaders() });

    // Call compare endpoint
    const compRes = await axios.post(`${AI_SERVICE_URL}/ai/compare`, {
      v1_clauses: ai1.data.clauses,
      v2_clauses: ai2.data.clauses
    });

    return res.json({
      v1_filename: file1.originalname,
      v2_filename: file2.originalname,
      v1_score: ai1.data.overall_score,
      v2_score: ai2.data.overall_score,
      comparisons: compRes.data.comparisons
    });
  } catch (err) {
    console.error('Version compare error:', err.message);
    return res.status(500).json({ error: 'Failed to compare contract versions.' });
  }
});

// Start Server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Express Backend] Running on http://localhost:${PORT}`);
  });
});
