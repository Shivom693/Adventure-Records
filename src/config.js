// Centralized configuration for the application
const isLocalHost = (host = '') =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host.startsWith('192.168.');

const isLocalUrl = (url = '') =>
  /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.)/i.test(url);

const getApiUrl = () => {
  const isLocal = typeof window !== 'undefined' && isLocalHost(window.location.hostname);
  const envUrl = import.meta.env.VITE_API_URL;
  const prodUrl = import.meta.env.VITE_PRODUCTION_API_URL;

  if (isLocal) {
    return envUrl || 'http://localhost:5000';
  }

  // On deployed HTTPS site, never fall back to a localhost URL leaked from .env
  if (prodUrl && !isLocalUrl(prodUrl)) {
    return prodUrl;
  }
  if (envUrl && !isLocalUrl(envUrl)) {
    return envUrl;
  }

  return 'https://adventure-records-backend.vercel.app';
};

export const API_URL = getApiUrl();
