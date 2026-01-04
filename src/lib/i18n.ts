import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { APP_VERSION } from './version';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['de', 'en', 'nl'],
    fallbackLng: 'de',
    defaultNS: 'common',
    ns: ['common', 'orders', 'navigation', 'notifications', 'bookings'],
    backend: {
      loadPath: `/locales/{{lng}}/{{ns}}.json?v=${APP_VERSION}`,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
