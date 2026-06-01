// backend/localization/i18n.js

const i18n = {
  defaultLocale: 'en',
  supportedLocales: ['en', 'hi', 'mr', 'ta', 'te', 'bn'],
  // Fallback translation function
  t: (key) => key 
};

module.exports = i18n;