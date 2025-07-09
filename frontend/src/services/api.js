import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 30000, // 30 seconds for AI operations
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
);

// Novel APIs
export const fetchNovels = async (params = {}) => {
  return apiClient.get('/novels', { params });
};

export const fetchNovel = async (id) => {
  return apiClient.get(`/novels/${id}`);
};

export const createNovel = async (novelData) => {
  return apiClient.post('/novels', novelData);
};

export const updateNovel = async (id, novelData) => {
  return apiClient.put(`/novels/${id}`, novelData);
};

export const deleteNovel = async (id) => {
  return apiClient.delete(`/novels/${id}`);
};

export const generateCompleteNovel = async (id) => {
  return apiClient.post(`/novels/${id}/generate-complete`);
};

export const fetchNovelProgress = async (id) => {
  return apiClient.get(`/novels/${id}/progress`);
};

// Chapter APIs
export const fetchChapters = async (novelId, params = {}) => {
  return apiClient.get(`/chapters/${novelId}`, { params });
};

export const fetchChapter = async (novelId, chapterNumber) => {
  return apiClient.get(`/chapters/${novelId}/${chapterNumber}`);
};

export const generateChapter = async (novelId, chapterData) => {
  return apiClient.post(`/chapters/${novelId}/generate`, chapterData);
};

export const updateChapter = async (chapterId, chapterData) => {
  return apiClient.put(`/chapters/${chapterId}`, chapterData);
};

export const reviewChapter = async (chapterId) => {
  return apiClient.post(`/chapters/${chapterId}/review`);
};

export const regenerateChapter = async (chapterId, customInstructions) => {
  return apiClient.post(`/chapters/${chapterId}/regenerate`, { customInstructions });
};

export const deleteChapter = async (chapterId) => {
  return apiClient.delete(`/chapters/${chapterId}`);
};

export const fetchChapterStatistics = async (chapterId) => {
  return apiClient.get(`/chapters/${chapterId}/statistics`);
};

// Genre APIs
export const fetchGenres = async (params = {}) => {
  return apiClient.get('/genres', { params });
};

export const fetchTopGenres = async () => {
  return apiClient.get('/genres/top');
};

export const fetchGenre = async (id) => {
  return apiClient.get(`/genres/${id}`);
};

export const fetchGenrePromptingContext = async (id, phase) => {
  return apiClient.get(`/genres/${id}/prompting-context/${phase}`);
};

// AI APIs
export const generatePremise = async (data) => {
  return apiClient.post('/ai/generate-premise', data);
};

export const generateOutline = async (data) => {
  return apiClient.post('/ai/generate-outline', data);
};

export const generateCharacters = async (data) => {
  return apiClient.post('/ai/generate-characters', data);
};

export const generateChapterAI = async (data) => {
  return apiClient.post('/ai/generate-chapter', data);
};

export const reviewChapterAI = async (data) => {
  return apiClient.post('/ai/review-chapter', data);
};

export const generateCover = async (data) => {
  return apiClient.post('/ai/generate-cover', data);
};

export const analyzeText = async (text) => {
  return apiClient.post('/ai/analyze-text', { text });
};

export const fetchAIModels = async () => {
  return apiClient.get('/ai/models');
};

export const fetchAIUsage = async () => {
  return apiClient.get('/ai/usage');
};

// New AI Provider APIs
export const fetchAIProviders = async () => {
  return apiClient.get('/ai/providers');
};

export const generateTextWithProvider = async (data) => {
  return apiClient.post('/ai/generate-text', data);
};

export const generateCoverArt = async (data) => {
  return apiClient.post('/ai/generate-cover-art', data);
};

export const generateTextVariations = async (data) => {
  return apiClient.post('/ai/text-variations', data);
};

// Cover APIs
export const fetchCovers = async (novelId) => {
  return apiClient.get(`/covers/${novelId}`);
};

export const fetchCover = async (coverId) => {
  return apiClient.get(`/covers/cover/${coverId}`);
};

export const generateNovelCover = async (novelId, data) => {
  return apiClient.post(`/covers/${novelId}/generate`, data);
};

export const generateCoverVariation = async (coverId, data) => {
  return apiClient.post(`/covers/${coverId}/generate-variation`, data);
};

export const updateCover = async (coverId, data) => {
  return apiClient.put(`/covers/${coverId}`, data);
};

export const approveCover = async (coverId, feedback) => {
  return apiClient.post(`/covers/${coverId}/approve`, { feedback });
};

export const rejectCover = async (coverId, reason) => {
  return apiClient.post(`/covers/${coverId}/reject`, { reason });
};

export const deleteCover = async (coverId) => {
  return apiClient.delete(`/covers/${coverId}`);
};

// Aggregate API object for convenience
export const api = {
  // Novels
  fetchNovels,
  fetchNovel,
  createNovel,
  updateNovel,
  deleteNovel,
  generateCompleteNovel,
  fetchNovelProgress,
  
  // Chapters
  fetchChapters,
  fetchChapter,
  generateChapter,
  updateChapter,
  reviewChapter,
  regenerateChapter,
  deleteChapter,
  fetchChapterStatistics,
  
  // Genres
  fetchGenres,
  getGenres: fetchGenres, // alias for compatibility
  fetchTopGenres,
  fetchGenre,
  fetchGenrePromptingContext,
  
  // AI
  generatePremise,
  generateOutline,
  generateCharacters,
  generateChapterAI,
  reviewChapterAI,
  generateCover,
  analyzeText,
  fetchAIModels,
  fetchAIUsage,
  fetchAIProviders,
  generateTextWithProvider,
  generateCoverArt,
  generateTextVariations,
  
  // Covers
  fetchCovers,
  fetchCover,
  generateNovelCover,
  generateCoverVariation,
  updateCover,
  approveCover,
  rejectCover,
  deleteCover
};

export default api;
