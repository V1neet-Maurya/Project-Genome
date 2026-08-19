import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
});

// =====================================================
// ADD JWT TOKEN TO EVERY REQUEST
// =====================================================

api.interceptors.request.use(
  (config) => {
    // IMPORTANT:
    // sessionStorage is isolated per browser tab.
    const token =
      sessionStorage.getItem("token");

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // =================================================
    // FORMDATA
    // =================================================
    // Do NOT manually set Content-Type for FormData.
    // Axios/browser will automatically add:
    // multipart/form-data; boundary=...
    // =================================================

    if (
      config.data instanceof FormData
    ) {
      if (config.headers) {
        delete config.headers[
          "Content-Type"
        ];
      }
    } else {
      // =================================================
      // NORMAL JSON REQUEST
      // =================================================

      config.headers =
        config.headers || {};

      config.headers[
        "Content-Type"
      ] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;