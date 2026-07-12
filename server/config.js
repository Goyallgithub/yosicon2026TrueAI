import "dotenv/config";

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`FATAL: ${name} is missing from server/.env`);
  }
  return value;
}

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() || "";
export const USE_REALTIME = process.env.USE_REALTIME !== "false";
export const PORT = Number(process.env.PORT || 5000);

export function validateEnv() {
  requireEnv("OPENAI_API_KEY");
}
