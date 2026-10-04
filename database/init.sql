-- PostgreSQL Schema for AI Contract Risk Analyzer

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(100) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contract versions table
CREATE TABLE IF NOT EXISTS contract_versions (
    id VARCHAR(100) PRIMARY KEY,
    contract_id VARCHAR(100) REFERENCES contracts(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    file_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clauses table
CREATE TABLE IF NOT EXISTS clauses (
    id VARCHAR(100) PRIMARY KEY,
    version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
    clause_type VARCHAR(100) NOT NULL,
    section VARCHAR(255),
    text TEXT NOT NULL,
    page_number INT NOT NULL
);

-- Risks table
CREATE TABLE IF NOT EXISTS risks (
    id VARCHAR(100) PRIMARY KEY,
    clause_id VARCHAR(100) REFERENCES clauses(id) ON DELETE CASCADE,
    version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
    risk_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- LOW, MODERATE, HIGH, CRITICAL
    risk_score INT NOT NULL,
    reason TEXT NOT NULL,
    evidence TEXT NOT NULL,
    page_number INT NOT NULL,
    confidence FLOAT DEFAULT 0.95
);

-- Analyses table
CREATE TABLE IF NOT EXISTS analyses (
    id VARCHAR(100) PRIMARY KEY,
    version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
    overall_score INT NOT NULL,
    risk_level VARCHAR(50) NOT NULL, -- LOW, MODERATE, HIGH, CRITICAL
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

-- Embeddings table for RAG
CREATE TABLE IF NOT EXISTS embeddings (
    id VARCHAR(100) PRIMARY KEY,
    version_id VARCHAR(100) REFERENCES contract_versions(id) ON DELETE CASCADE,
    clause_id VARCHAR(100) REFERENCES clauses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INT NOT NULL,
    clause_type VARCHAR(100),
    embedding vector(384) -- sentence-transformers all-MiniLM-L6-v2 produces 384-dim vector
);

-- Index for RAG cosine similarity search
CREATE INDEX IF NOT EXISTS embeddings_version_id_idx ON embeddings(version_id);
