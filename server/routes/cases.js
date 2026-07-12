import { Router } from "express";
import { createCase, getAllCases, getCaseById, updateCase } from "../store/cases.js";

const router = Router();

router.get("/", (_req, res) => {
  try {
    res.json({ data: getAllCases() });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch cases" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const caseRecord = getCaseById(req.params.id);
    if (!caseRecord) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json({ data: caseRecord });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to fetch case" });
  }
});

router.post("/", (req, res, next) => {
  try {
    const { transcript, brief, patientName, patientAge, status, patientSnapshot, visualObservation } =
      req.body;

    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "transcript is required" });
    }
    if (!brief || typeof brief !== "object") {
      return res.status(400).json({ error: "brief is required" });
    }

    const created = createCase({
      transcript,
      brief,
      patientName,
      patientAge,
      status,
      patientSnapshot,
      visualObservation,
    });
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", (req, res, next) => {
  try {
    const updated = updateCase(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Case not found" });
    }
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

export default router;
