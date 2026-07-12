import "dotenv/config";
import express from "express";
import cors from "cors";
import { validateEnv, PORT } from "./config.js";
import realtimeSessionRouter from "./routes/realtimeSession.js";
import extractRouter from "./routes/extract.js";
import fallbackVoiceRouter from "./routes/fallbackVoice.js";
import casesRouter from "./routes/cases.js";
import analyzeSnapshotRouter from "./routes/analyzeSnapshot.js";
import emrAssistRouter from "./routes/emrAssist.js";
import { errorHandler } from "./middleware/errorHandler.js";

try {
  validateEnv();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/realtime-session", realtimeSessionRouter);
app.use("/api/extract", extractRouter);
app.use("/api", fallbackVoiceRouter);
app.use("/api/cases", casesRouter);
app.use("/api/analyze-snapshot", analyzeSnapshotRouter);
app.use("/api/emr-assist", emrAssistRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server on :${PORT}`);
});
