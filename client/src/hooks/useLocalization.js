// client/src/hooks/useLocalization.js
// React hook for multi-language support
import { useState, useEffect } from 'react';

const useLocalization = () => {
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    loadTranslations(language);
    localStorage.setItem('language', language);
  }, [language]);

  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Error loading translations:', error);
      loadTranslations('en'); // Fallback to English
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      value = value[k];
      if (!value) return key;
    }
    
    return value;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return { language, t, changeLanguage };
};

export default useLocalization;
