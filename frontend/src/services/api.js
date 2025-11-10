import axios from 'axios';
import { API_BASE_URL } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Comics API
export const getComics = (params = {}) => {
  return api.get('/comics', { params });
};

export const getComicsWithFilters = (params = {}) => {
  return api.get('/comics', { params });
};

export const getComicById = (id) => {
  return api.get(`/comics/${id}`);
};

export const incrementComicViews = (id) => {
  return api.post(`/comics/${id}/views`);
};

export const getComicsByCategory = (categoryId, params = {}) => {
  return api.get(`/comics/category/${categoryId}`, { params });
};

export const getLatestComics = (limit = 10) => {
  return api.get('/comics/latest/updates', { params: { limit } });
};

export const getPopularComics = (limit = 10) => {
  return api.get('/comics/popular/list', { params: { limit } });
};

// Chapters API
export const getChapterById = (id) => {
  return api.get(`/chapters/${id}`);
};

export const incrementChapterViews = (id) => {
  return api.post(`/chapters/${id}/views`);
};

export const getChaptersByComicId = (comicId) => {
  return api.get(`/chapters/comic/${comicId}`);
};

// Auth API
export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

// Categories API
export const getCategories = () => {
  return api.get('/categories');
};

export const getCategoryById = (id) => {
  return api.get(`/categories/${id}`);
};

// Countries API
export const getCountries = () => {
  return api.get('/countries');
};

// Favorites API
export const getFavorites = () => {
  return api.get('/favorites');
};

export const toggleFavorite = (comicId) => {
  return api.post('/favorites/toggle', { comicId });
};

export const checkFavorite = (comicId) => {
  return api.get(`/favorites/check/${comicId}`);
};

export const getFavoriteCount = () => {
  return api.get('/favorites/count');
};

// Notifications API
export const getNotifications = (params = {}) => {
  return api.get('/notifications', { params });
};

export const getNotificationCount = () => {
  return api.get('/notifications/count');
};

export const markNotificationAsRead = (id) => {
  return api.put(`/notifications/${id}/read`);
};

export const markAllNotificationsAsRead = () => {
  return api.put('/notifications/read-all');
};

// Likes API
export const toggleLike = (comicId) => {
  return api.post('/likes/toggle', { comicId });
};

export const checkLike = (comicId) => {
  return api.get(`/likes/check/${comicId}`);
};

// History API
export const getReadingHistory = (limit = 50) => {
  return api.get('/history', { params: { limit } });
};

export const getReadingHistoryByComic = (comicId) => {
  return api.get(`/history/comic/${comicId}`);
};

export const addReadingHistory = (comicId, chapterId) => {
  return api.post('/history', { comicId, chapterId });
};

// Profile API
export const getProfile = () => {
  return api.get('/users/profile/me');
};

export const updateProfile = (formData) => {
  return api.put('/users/profile/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default api;

