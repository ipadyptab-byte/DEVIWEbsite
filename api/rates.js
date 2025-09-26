// Simple alias endpoint to match client requests to /api/rates
const handler = require('./rate');

module.exports = async function(req, res) {
  return handler(req, res);
}
