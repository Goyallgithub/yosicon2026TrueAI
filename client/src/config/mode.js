/** True when deployed to Vercel (or any static preview without backend). */
export const IS_DEMO_MODE =
  import.meta.env.VITE_DEMO_MODE === "true" || !import.meta.env.VITE_API_BASE_URL;
