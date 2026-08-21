import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// =====================================================
// ADD JWT TOKEN TO EVERY REQUEST
// =====================================================

api.interceptors.request.use(
  (config) => {
    // Get JWT token
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    // =================================================
    // FORMDATA
    // =================================================
    // Do not manually set Content-Type for FormData.
    // Axios/browser automatically adds the multipart
    // boundary required for file uploads.
    // =================================================

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    } else {
      // =================================================
      // NORMAL JSON REQUEST
      // =================================================

      config.headers = config.headers || {};
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;