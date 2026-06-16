import { useState, useEffect } from 'react';

const useLocalization = () => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language');
      if (stored) {
        setLanguage(stored);
      }
    }
  }, []);

  useEffect(() => {
    loadTranslations(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', language);
    }
  }, [language]);

  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/locales/${lang}.json`);
      if (!response.ok) {
        throw new Error('Not found');
      }
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      // Quietly swallow missing files or load defaults
      setTranslations({});
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (!value || typeof value !== 'object') return key;
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
