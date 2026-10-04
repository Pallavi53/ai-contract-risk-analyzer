const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  baseUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  timeout: 120000 // 2 minute timeout for LLM / OCR tasks
};
