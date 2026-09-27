// Centralized configuration for the application
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on localhost or local IP, default to the local backend server
  const isLocal = 
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' || 
    window.location.hostname.startsWith('192.168.');
    
  return isLocal 
    ? 'http://localhost:5000' 
    : 'https://adventure-music-backend.onrender.com';
};

export const API_URL = getApiUrl();
