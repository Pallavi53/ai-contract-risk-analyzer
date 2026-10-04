# AI Contract Risk Analyzer

An automated, document-specific legal contract risk analysis web application built from scratch for academic major project requirements.

---

## 📌 Project Overview
The **AI Contract Risk Analyzer** extracts actual contract text (using PyMuPDF and Tesseract OCR), categorizes legal clauses across 19 standard legal categories, detects potential risk exposures with exact verbatim evidence quotes, and calculates a **100% deterministic, transparent risk score** derived exclusively from the detected risks in the uploaded document.

### Key Objectives Achieved:
- **Zero Fabricated Evidence**: Every evidence string is validated as an exact substring from the uploaded contract text.
- **Document-Specific Analysis**: Different PDF contracts produce different risk findings and scores.
- **Deterministic Risk Scoring**: Formula-driven scoring capped per legal category (LLM does NOT generate the score).
- **Document-Isolated RAG Chat**: Vector embeddings are strictly scoped to `version_id` to prevent cross-document data leakage.
- **Side-by-Side Version Comparison**: Compare V1 and V2 contract PDF versions to inspect clause diffs and risk impacts.
- **Single Fixed Credentials Login**: Simple flow without multi-tenant overhead.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Axios, Lucide Icons, React Router
- **Main Backend**: Node.js, Express.js, JWT, Bcrypt, Multer
- **AI Service**: Python 3.11+, FastAPI, PyMuPDF (`fitz`), PyTesseract (OCR), Scikit-Learn (TF-IDF Vector Embeddings), ReportLab
- **Database**: PostgreSQL (with `pgvector`) & SQLite fallback
- **Containerization**: Docker, Docker Compose

---

## 🔒 Login Credentials

- **Email**: `admin@contractanalyzer.com`
- **Password**: `Admin@123`

---

## 📊 How the Risk Score is Calculated

The risk score is calculated deterministically by summing the capped point values of detected risks across 7 major risk categories:

$$\text{Overall Score} = \min\left(100, \sum \text{Capped Category Scores}\right)$$

| Category | Capped Max Score | Typical Risk Triggers |
| :--- | :--- | :--- |
| **Financial Exposure** | 25 points | Late fees $\ge 2\%/\text{month}$, uncapped price escalation, penalties |
| **Termination** | 15 points | Long notice period ($>60$ days), one-sided termination for convenience, early termination fees |
| **Liability & Indemnification** | 20 points | Low liability cap ($<\text{INR }1,00,000$), uncapped liability, broad one-sided indemnification |
| **Intellectual Property** | 10 points | One-sided IP assignment of background IP or derivative work product |
| **Restrictive Covenants** | 10 points | Non-compete covenants ($>6$ months), non-solicitation restrictions |
| **Data Protection** | 10 points | Unrestricted data usage, missing data protection safeguards |
| **Other / Unusual Terms** | 10 points | Foreign jurisdiction, one-sided assignment without consent, unrestricted audit without notice |

### Score Levels
- **0 – 29**: `LOW`
- **30 – 59**: `MODERATE`
- **60 – 79**: `HIGH`
- **80 – 100**: `CRITICAL`

> **Disclaimer**: Risk score is a project-defined analytical heuristic and does not constitute legal advice.

---

## 📁 Project Structure

```
AI-Contract-Risk-Analyzer/
├── ai-service/             # FastAPI Python service
│   ├── extractor.py        # PyMuPDF text & Tesseract OCR extractor
│   ├── clause_extractor.py # 19-category legal clause classifier
│   ├── risk_detector.py    # Risk detection & evidence validator
│   ├── scoring_engine.py   # Deterministic category scoring engine
│   ├── rag_engine.py       # Isolated vector RAG engine
│   ├── comparator.py       # Contract V1 vs V2 diff engine
│   ├── ollama_client.py    # Ollama integration with fallback
│   ├── main.py             # FastAPI entrypoint
│   ├── requirements.txt
│   └── Dockerfile
├── backend/                # Main Express.js backend
│   ├── db.js               # Dual Postgres & SQLite driver
│   ├── server.js           # REST API endpoints & upload handlers
│   ├── package.json
│   └── Dockerfile
├── frontend/               # React Vite Tailwind frontend
│   ├── src/
│   │   ├── components/     # RiskGauge, LegalConcerns, RagChat, VersionCompare, etc.
│   │   ├── pages/          # Login, Dashboard
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── database/               # PostgreSQL Schema
│   └── init.sql
├── uploads/                # Contract storage directory
├── tests/                  # Verification test suite & PDF generator
│   ├── generate_test_pdfs.py
│   └── run_verification_test.py
├── docker-compose.yml
├── .env
└── README.md
```

---

## 🌐 API Endpoints

### Main Backend APIs (Express.js - Port 5000)
- `POST /api/auth/login` - Single user authentication
- `POST /api/contracts/upload` - Upload contract PDF (Max 20MB)
- `POST /api/contracts/:id/analyze` - Trigger document extraction & risk analysis
- `GET /api/contracts/:id` - Retrieve contract metadata
- `GET /api/contracts/:id/analysis` - Get latest analysis report
- `GET /api/contracts/:id/risks` - Get list of legal concerns
- `POST /api/contracts/:id/chat` - RAG contract Q&A
- `POST /api/contracts/compare` - Compare Version 1 and Version 2 contract PDFs

### AI Service APIs (FastAPI - Port 8000)
- `POST /ai/extract` - PDF text extraction & OCR fallback
- `POST /ai/clauses` - Clause classification
- `POST /ai/analyze` - Complete contract analysis pipeline
- `POST /ai/chat` - Isolated document vector Q&A
- `POST /ai/compare` - Version comparison pipeline

---

## 🚀 How to Run Locally

### Option A: Direct Local Execution (Development Mode)

1. **Install Python & Node Dependencies**:
   ```bash
   # AI Service Dependencies
   py -m pip install -r ai-service/requirements.txt

   # Backend Dependencies
   cd backend && npm install && cd ..

   # Frontend Dependencies
   cd frontend && npm install && cd ..
   ```

2. **Generate Test Contracts**:
   ```bash
   py tests/generate_test_pdfs.py
   ```

3. **Start Services**:
   - **Terminal 1 (AI Service)**:
     ```bash
     cd ai-service
     py -m uvicorn main:app --host 127.0.0.1 --port 8000
     ```
   - **Terminal 2 (Node Express Backend)**:
     ```bash
     cd backend
     node server.js
     ```
   - **Terminal 3 (React Frontend)**:
     ```bash
     cd frontend
     npm run dev
     ```

4. **Access Web App**:
   Open browser at `http://localhost:3000` (or `http://localhost:5173`).

---

### Option B: Docker Compose Deployment

```bash
docker-compose up --build
```

Access services:
- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:5000`
- **AI Service**: `http://localhost:8000`

---

## 🧪 Automated Verification Test Suite

Run the verification test suite to confirm document-specific scores, evidence validation, RAG isolation, and deterministic scoring:

```bash
py tests/run_verification_test.py
```

### Verification Test Results:
- `test1_balanced.pdf`: Score **0 / 100 (LOW)**
- `test2_risky.pdf`: Score **53 / 100 (MODERATE)**
- `test3_severely_risky.pdf`: Score **60 / 100 (HIGH)**
- **Score 1 $\neq$ Score 2 $\neq$ Score 3**: `PASS`
- **Same Document Deterministic Re-run**: `PASS`
- **RAG Document Isolation**: `PASS`
- **Version Comparison**: `PASS`
