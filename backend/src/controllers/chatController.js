const { successResponse, errorResponse } = require('../utils/responseFormatter');
const aiProxy = require('../services/aiServiceProxy');
const { logAudit } = require('../services/auditService');

async function handleContractChat(req, res, next) {
  try {
    const { id } = req.params;
    const { query } = req.body;
    const language = req.body.language || req.user.language_preference || 'en';

    if (!query) {
      return errorResponse(res, 'Query parameter is required.', 400);
    }

    const chatResult = await aiProxy.queryContractChat(id, query, language);

    await logAudit(req.user.organization_id, req.user.id, 'CONTRACT_CHAT', 'CONTRACT', id, { query }, req.ip);

    return successResponse(res, chatResult, 'Contract chat query answered.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleContractChat
};
