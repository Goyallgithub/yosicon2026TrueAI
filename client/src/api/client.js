import { IS_DEMO_MODE } from "../config/mode.js";
import { handleDemoApi } from "./demoApi.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function apiCall(path, options = {}) {
  if (IS_DEMO_MODE) {
    return handleDemoApi(path, options);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await res.json().catch(() => null) : null;

    if (!res.ok) {
      throw new Error(body?.error || `Request failed (${res.status})`);
    }

    return body;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

export async function apiCallBlob(path, options = {}) {
  if (IS_DEMO_MODE) {
    throw new Error("Voice playback unavailable in public demo. Run locally for full Rakshak voice.");
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, options);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error || `Request failed (${res.status})`);
    }
    return res.blob();
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

export async function apiCallForm(path, formData) {
  if (IS_DEMO_MODE) {
    return { transcript: "Demo mode — use localhost for live voice transcription." };
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      body: formData,
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(body?.error || `Request failed (${res.status})`);
    }
    return body;
  } catch (err) {
    throw new Error(err.message || "Network error");
  }
}

export { API_BASE, IS_DEMO_MODE };
