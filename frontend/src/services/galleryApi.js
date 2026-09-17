// frontend/src/services/galleryApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Smile Gallery API Service: Centralized Frontend HTTP Client
// Communicates with the Node.js / Express backend (/api/gallery)
// ─────────────────────────────────────────────────────────────────────────────

// Configurable API base URL (Vite: VITE_API_URL, CRA: REACT_APP_API_URL, default: http://localhost:5000)
export const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) ||
  'http://localhost:5000';

/**
 * Helper to resolve relative backend image URLs (e.g. /uploads/gallery/...)
 * into absolute URLs pointing to the Express server port.
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE_URL}${cleanPath}`;
};

/**
 * Fetch approved smile transformation cases with filters & pagination
 */
export const fetchGalleryCases = async ({
  category = 'All',
  search = '',
  tag = '',
  sort = 'newest',
  page = 1,
  limit = 12,
} = {}) => {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.append('category', category);
  if (search.trim()) params.append('search', search.trim());
  if (tag.trim()) params.append('tag', tag.trim());
  if (sort) params.append('sort', sort);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  const url = `${API_BASE_URL}/api/gallery?${params.toString()}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Server returned error status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        `Cannot reach the server at ${API_BASE_URL}. Please ensure the Node.js/Express backend is running and CORS is enabled.`
      );
    }
    throw err;
  }
};

/**
 * Fetch gallery category badges with live approved case counts
 */
export const fetchGalleryCategories = async () => {
  const url = `${API_BASE_URL}/api/gallery/categories`;
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to load categories: ${response.statusText}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new Error(
        `Cannot reach the server at ${API_BASE_URL}. Unable to load dental treatment categories.`
      );
    }
    throw err;
  }
};

/**
 * Fetch a single case by ID or CaseID (increments view count on backend)
 */
export const fetchCaseById = async (id) => {
  const url = `${API_BASE_URL}/api/gallery/${encodeURIComponent(id)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Case details not found (${response.status})`);
  }
  return await response.json();
};

/**
 * Like / Upvote a smile transformation case
 */
export const likeCase = async (id) => {
  const url = `${API_BASE_URL}/api/gallery/${encodeURIComponent(id)}/like`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to record like');
  }
  return await response.json();
};
