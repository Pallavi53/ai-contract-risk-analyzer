const db = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const aiProxy = require('../services/aiServiceProxy');
const { analysisCache } = require('./contractController');

async function getContractAnalysis(req, res, next) {
  try {
    const { id } = req.params;

    // Check if analysis exists in cache for this exact contract ID
    let analysisData = analysisCache.get(id);

    if (!analysisData) {
      // Query contract file path from DB
      const contractRes = await db.query('SELECT * FROM contracts WHERE id = $1', [id]);
      const contract = contractRes.rows[0];

      const filePath = contract ? contract.file_path : undefined;
      const fileType = contract ? contract.file_type : undefined;

      analysisData = await aiProxy.triggerRiskAnalysis(id, filePath, fileType);
      analysisCache.set(id, analysisData);
    }

    return successResponse(res, { analysis: analysisData }, 'Analysis retrieved successfully.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getContractAnalysis
};
