import { DEMO_CASES, getDemoEmrReply } from "../data/demoCases.js";

function parseBody(options) {
  if (!options.body) return {};
  try {
    return typeof options.body === "string" ? JSON.parse(options.body) : options.body;
  } catch {
    return {};
  }
}

export async function handleDemoApi(path, options = {}) {
  await new Promise((r) => setTimeout(r, 200));

  if (path === "/api/voice-mode") {
    return { useRealtime: false };
  }

  if (path === "/api/cases" && (!options.method || options.method === "GET")) {
    return { data: DEMO_CASES };
  }

  const caseMatch = path.match(/^\/api\/cases\/([^/]+)$/);
  if (caseMatch) {
    const id = caseMatch[1];
    if (options.method === "PATCH") {
      const found = DEMO_CASES.find((c) => c.id === id);
      if (!found) throw new Error("Case not found");
      const body = parseBody(options);
      Object.assign(found, body, { updatedAt: new Date().toISOString() });
      return { data: found };
    }
    const found = DEMO_CASES.find((c) => c.id === id);
    if (!found) throw new Error("Case not found");
    return { data: found };
  }

  if (path === "/api/cases" && options.method === "POST") {
    return { data: DEMO_CASES[0] };
  }

  if (path === "/api/emr-assist" && options.method === "POST") {
    const { message, patientContext } = parseBody(options);
    return { reply: getDemoEmrReply(message || "", patientContext || {}) };
  }

  if (path === "/api/extract" || path === "/api/fallback-extract") {
    return DEMO_CASES[0].brief;
  }

  if (path === "/api/health") {
    return { status: "ok", mode: "frontend-only" };
  }

  throw new Error("Frontend-only demo — no live API.");
}
