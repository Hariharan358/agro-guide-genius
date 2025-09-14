import axios from "axios";

const baseURL = (import.meta as any)?.env?.VITE_API_BASE || "http://127.0.0.1:5000";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" }
});






