const DEFAULT_API_URL = 'http://localhost:8000';

const rawApiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;

export const apiUrl = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;