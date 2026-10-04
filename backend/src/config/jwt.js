const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  secret: process.env.JWT_SECRET || 'super_secret_jwt_key_ai_contract_risk_analyzer_2026',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
