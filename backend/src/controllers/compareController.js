const { successResponse, errorResponse } = require('../utils/responseFormatter');
const aiProxy = require('../services/aiServiceProxy');
const { logAudit } = require('../services/auditService');

async function compareVersions(req, res, next) {
  try {
    const { version1Id, version2Id, v1Path, v2Path } = req.body;

    if (!version1Id || !version2Id) {
      return errorResponse(res, 'version1Id and version2Id are required.', 400);
    }

    const comparisonResult = await aiProxy.compareContractVersions(
      version1Id,
      version2Id,
      v1Path || 'v1.pdf',
      v2Path || 'v2.pdf'
    );

    await logAudit(req.user.organization_id, req.user.id, 'COMPARE_VERSIONS', 'CONTRACT_VERSION', version2Id, { version1Id, version2Id }, req.ip);

    return successResponse(res, { comparison: comparisonResult }, 'Contract versions compared.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  compareVersions
};
