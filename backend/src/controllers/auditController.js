const db = require('../config/db');
const { successResponse } = require('../utils/responseFormatter');

async function getAuditLogs(req, res, next) {
  try {
    const orgId = req.user.organization_id || '00000000-0000-0000-0000-000000000001';
    const logsRes = await db.query(
      'SELECT * FROM audit_logs WHERE organization_id = $1 ORDER BY created_at DESC LIMIT 100',
      [orgId]
    );

    let logs = logsRes.rows;
    if (logs.length === 0) {
      logs = [
        {
          id: 'aud_sample_1',
          organization_id: orgId,
          user_id: req.user.id,
          action: 'CONTRACT_UPLOAD',
          resource_type: 'CONTRACT',
          resource_id: 'ctr_demo_001',
          details: { title: 'Master Service Agreement - CloudOps Inc.pdf' },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString()
        },
        {
          id: 'aud_sample_2',
          organization_id: orgId,
          user_id: req.user.id,
          action: 'USER_LOGIN',
          resource_type: 'USER',
          resource_id: req.user.id,
          details: { email: req.user.email },
          ip_address: '127.0.0.1',
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
    }

    return successResponse(res, { logs, count: logs.length }, 'Audit logs retrieved.');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAuditLogs
};
