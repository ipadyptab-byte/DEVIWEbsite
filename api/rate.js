/**
 * Compatibility alias for /api/rates
 * Some clients call /api/rate; this proxies to the same handler.
 */
const ratesHandler = require('./rates');

module.exports = ratesHandler;