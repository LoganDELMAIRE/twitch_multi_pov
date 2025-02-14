const isDev = process.env.NODE_ENV === 'development';
const API_BASE_URL = isDev ? 'https://localhost:3001' : '';

export const TWITCH_CLIENT_ID = process.env.REACT_APP_TWITCH_CLIENT_ID;
export const TWITCH_CLIENT_SECRET = process.env.REACT_APP_TWITCH_CLIENT_SECRET;
export const TWITCH_REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? 'https://votre-domaine.com'
  : 'https://localhost:3000';
export const API_URL = API_BASE_URL; 