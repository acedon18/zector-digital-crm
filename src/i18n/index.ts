import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';
import svTranslations from './locales/sv.json';

i18n
  .use(LanguageDetector) // Enable language detection
  .use(initReactI18next)
  .init({
    debug: import.meta.env.DEV,
    lng: 'en', // Start with English to avoid missing translations
    fallbackLng: 'en', // English as fallback
    interpolation: {
      escapeValue: false,
    },
    resources: {
      es: {
        translation: esTranslations,
      },
      en: {
        translation: enTranslations,
      },
      sv: {
        translation: svTranslations,
      },
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
