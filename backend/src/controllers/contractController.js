const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { calculateFileHash } = require('../utils/fileHasher');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { logAudit } = require('../services/auditService');
const aiProxy = require('../services/aiServiceProxy');

// In-memory store for contract analyses keyed by contractId
const analysisCache = new Map();

async function uploadContract(req, res, next) {
  try {
    if (!req.file) {
      return errorResponse(res, 'No file uploaded. Please attach a PDF or DOCX contract.', 400);
    }

    const { originalname, path: filePath, size } = req.file;
    const fileType = path.extname(originalname).toLowerCase().replace('.', '');
    const title = req.body.title || originalname;
    const orgId = req.user.organization_id || 'org_main_001';

    // Calculate SHA-256 hash for duplicate check
    const fileHash = await calculateFileHash(filePath);

    // Duplicate upload check
    const dupRes = await db.query(
      'SELECT id, title FROM contracts WHERE organization_id = $1 AND file_hash = $2',
      [orgId, fileHash]
    );

    if (dupRes.rows.length > 0) {
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
      return errorResponse(
        res,
        `Duplicate contract detected. File matches existing contract '${dupRes.rows[0].title}'.`,
        409,
        { existingContractId: dupRes.rows[0].id }
      );
    }

    const contractId = `ctr_${Date.now()}_${Math.floor(Math.random()*1000)}`;

    // Perform document-specific processing and risk evaluation
    await aiProxy.triggerDocumentProcessing(contractId, filePath, fileType);
    const analysisResult = await aiProxy.triggerRiskAnalysis(contractId, filePath, fileType);

    const calculatedScore = analysisResult && typeof analysisResult.risk_score === 'number' ? analysisResult.risk_score : 0;
    const overallSummary = analysisResult.summary || {};

    // Store analysis in cache linked to this exact contractId
    analysisCache.set(contractId, analysisResult);

    const insertText = `
      INSERT INTO contracts (id, organization_id, uploaded_by, title, file_path, file_type, file_size, file_hash, risk_score, overall_summary)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const insertRes = await db.query(insertText, [
      contractId,
      orgId,
      req.user.id,
      title,
      filePath,
      fileType,
      size,
      fileHash,
      calculatedScore,
      JSON.stringify(overallSummary)
    ]);

    const contract = insertRes.rows[0] || {
      id: contractId,
      organization_id: orgId,
      uploaded_by: req.user.id,
      title,
      file_path: filePath,
      file_type: fileType,
      file_size: size,
      file_hash: fileHash,
      status: 'COMPLETED',
      risk_score: calculatedScore,
      overall_summary: overallSummary,
      created_at: new Date().toISOString()
    };

    // Create Version 1 record
    const versionId = `ver_1_${contractId}`;
    await db.query(
      `INSERT INTO contract_versions (id, contract_id, version_number, file_path, file_hash, uploaded_by, change_summary)
       VALUES ($1, $2, 1, $3, $4, $5, 'Initial contract upload')`,
      [versionId, contractId, filePath, fileHash, req.user.id]
    );

    await logAudit(orgId, req.user.id, 'CONTRACT_UPLOAD', 'CONTRACT', contractId, { title, fileType, size, riskScore: calculatedScore }, req.ip);

    return successResponse(res, { contract, analysis: analysisResult }, 'Contract uploaded and analyzed successfully.', 201);
  } catch (err) {
    next(err);
  }
}

async function listContracts(req, res, next) {
  try {
    const orgId = req.user.organization_id || 'org_main_001';
    const queryRes = await db.query(
      'SELECT * FROM contracts WHERE organization_id = $1 ORDER BY created_at DESC',
      [orgId]
    );

    let contracts = queryRes.rows;

    return successResponse(res, { contracts, count: contracts.length }, 'Contracts retrieved.');
  } catch (err) {
    next(err);
  }
}

async function getContractById(req, res, next) {
  try {
    const { id } = req.params;
    const queryRes = await db.query('SELECT * FROM contracts WHERE id = $1', [id]);
    let contract = queryRes.rows[0];

    if (!contract) {
      return errorResponse(res, 'Contract not found.', 404);
    }

    return successResponse(res, { contract }, 'Contract details retrieved.');
  } catch (err) {
    next(err);
  }
}

async function deleteContract(req, res, next) {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM contracts WHERE id = $1', [id]);
    analysisCache.delete(id);
    await logAudit(req.user.organization_id, req.user.id, 'CONTRACT_DELETE', 'CONTRACT', id, {}, req.ip);
    return successResponse(res, null, 'Contract deleted successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadContract,
  listContracts,
  getContractById,
  deleteContract,
  analysisCache
};
