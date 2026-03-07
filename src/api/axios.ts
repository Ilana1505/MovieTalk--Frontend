import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("🌐 axios request:", config.method?.toUpperCase(), config.url);
    console.log("🌐 token from LS:", token);

    const isValidToken =
      !!token &&
      token !== "null" &&
      token !== "undefined" &&
      token.trim().length > 10;

    if (isValidToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🌐 Authorization set:", config.headers.Authorization);
    } else {
      console.log("🌐 No valid token, Authorization not set");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;