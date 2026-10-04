const db = require('../config/db');

async function logAudit(orgId, userId, action, resourceType, resourceId, details = {}, ipAddress = '127.0.0.1') {
  try {
    const text = `
      INSERT INTO audit_logs (id, organization_id, user_id, action, resource_type, resource_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const id = `aud_${Date.now()}_${Math.floor(Math.random()*1000)}`;
    const values = [
      id,
      orgId || null,
      userId || null,
      action,
      resourceType,
      resourceId || null,
      JSON.stringify(details),
      ipAddress
    ];

    await db.query(text, values);
  } catch (err) {
    console.error('[Audit Log Error]:', err.message);
  }
}

module.exports = { logAudit };
