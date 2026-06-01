// backend/middleware/localizationMiddleware.js
// Detect and set language based on request
const i18n = require('../localization/i18n');

const localizationMiddleware = (req, res, next) => {
  // Get language from query, header, or default to English
  const lang = req.query.lang || req.headers['accept-language'] || req.headers['x-language'] || 'en';
  
  // Validate language
  const supportedLanguages = ['en', 'hi', 'mr', 'ta', 'te', 'bn'];
  const selectedLang = supportedLanguages.includes(lang) ? lang : 'en';
  
  i18n.setLocale(selectedLang);
  req.language = selectedLang;
  
  next();
};

module.exports = localizationMiddleware;
