import { handleDemoApi } from "./demoApi.js";

export const IS_DEMO_MODE = true;

export async function apiCall(path, options = {}) {
  return handleDemoApi(path, options);
}

export async function apiCallBlob() {
  throw new Error("Voice/audio not available in frontend-only mode.");
}

export async function apiCallForm() {
  return { transcript: "" };
}

export const API_BASE = "";
