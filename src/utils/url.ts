export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000";

export const toAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};