-- AI Contract Risk Analyzer MySQL Database Schema

CREATE DATABASE IF NOT EXISTS contract_risk_db;
USE contract_risk_db;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'REVIEWER', 'USER') NOT NULL DEFAULT 'USER',
    language_preference VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36),
    uploaded_by VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    status ENUM('UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED') DEFAULT 'UPLOADING',
    risk_score DECIMAL(5,2) DEFAULT 0.00,
    overall_summary JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Contract Versions
CREATE TABLE IF NOT EXISTS contract_versions (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36),
    version_number INT NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    file_hash VARCHAR(64) NOT NULL,
    uploaded_by VARCHAR(36),
    change_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Clauses
CREATE TABLE IF NOT EXISTS clauses (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36),
    version_id VARCHAR(36),
    clause_type VARCHAR(100) NOT NULL,
    section_title VARCHAR(255),
    clause_text TEXT NOT NULL,
    page_number INT DEFAULT 1,
    start_char INT DEFAULT 0,
    end_char INT DEFAULT 0,
    confidence DECIMAL(5,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES contract_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Risks
CREATE TABLE IF NOT EXISTS risks (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36),
    clause_id VARCHAR(36),
    risk_type VARCHAR(100) NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    score DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    reason TEXT NOT NULL,
    evidence TEXT NOT NULL,
    page INT DEFAULT 1,
    confidence DECIMAL(5,2) DEFAULT 0.85,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (clause_id) REFERENCES clauses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Analyses
CREATE TABLE IF NOT EXISTS analyses (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36),
    version_id VARCHAR(36),
    risk_score DECIMAL(5,2) NOT NULL,
    summary_json JSON,
    risk_distribution JSON,
    clause_count INT DEFAULT 0,
    risk_count INT DEFAULT 0,
    processing_time_ms INT DEFAULT 0,
    language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (version_id) REFERENCES contract_versions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Embeddings
CREATE TABLE IF NOT EXISTS embeddings (
    id VARCHAR(36) PRIMARY KEY,
    contract_id VARCHAR(36),
    clause_id VARCHAR(36),
    chunk_text TEXT NOT NULL,
    chunk_index INT NOT NULL,
    page_number INT DEFAULT 1,
    embedding_json JSON,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
    FOREIGN KEY (clause_id) REFERENCES clauses(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    organization_id VARCHAR(36),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(255),
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
