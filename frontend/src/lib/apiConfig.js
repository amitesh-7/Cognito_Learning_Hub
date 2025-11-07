/**
 * Get the API base URL from environment variables
 * Ensures no trailing slash for consistent URL construction
 */
export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  // Remove trailing slash if present
  return apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
};

/**
 * Get the Socket.IO server URL from environment variables
 * Ensures no trailing slash for consistent URL construction
 */
export const getSocketUrl = () => {
  const socketUrl =
    import.meta.env.VITE_SOCKET_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001";
  // Remove trailing slash if present
  return socketUrl.endsWith("/") ? socketUrl.slice(0, -1) : socketUrl;
};

/**
 * Construct an API endpoint URL
 * @param {string} endpoint - The API endpoint (should start with /)
 * @returns {string} The complete API URL
 */
export const apiUrl = (endpoint) => {
  const baseUrl = getApiUrl();
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  return `${baseUrl}${normalizedEndpoint}`;
};

export default {
  getApiUrl,
  getSocketUrl,
  apiUrl,
};
