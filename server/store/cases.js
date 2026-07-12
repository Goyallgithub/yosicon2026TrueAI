import { randomUUID } from "crypto";
import { generateReportsForCase, SEED_REPORTS } from "../data/generateReports.js";

const URGENCY_ORDER = { emergency: 0, urgent: 1, routine: 2 };

const seedCases = [
  {
    id: "seed-001",
    patientName: "Maria Gonzalez",
    patientAge: 34,
    transcript:
      "I've had crushing chest pain for the last 20 minutes, radiating to my left arm. I'm also short of breath and sweating.",
    brief: {
      patient_name: "Maria Gonzalez",
      patient_age: 34,
      chief_complaint: "Chest pain with shortness of breath",
      symptoms: ["chest pain", "left arm pain", "shortness of breath", "diaphoresis"],
      symptom_duration: "20 minutes",
      severity: "severe",
      urgency_level: "emergency",
      red_flags: ["crushing chest pain", "radiating arm pain", "shortness of breath"],
      medical_history: [],
      current_medications: [],
      allergies: [],
      recommended_action: "Immediate emergency department evaluation — possible acute coronary syndrome.",
      clinical_summary:
        "34-year-old with acute onset crushing chest pain radiating to left arm, associated dyspnea and diaphoresis for 20 minutes. High suspicion for ACS.",
      insufficient_information: false,
    },
    status: "pending",
    reports: SEED_REPORTS["seed-001"],
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "seed-002",
    patientName: "James Chen",
    patientAge: 58,
    transcript:
      "I've had a fever of 101 for three days, productive cough with green sputum, and fatigue. No chest pain or breathing trouble.",
    brief: {
      patient_name: "James Chen",
      patient_age: 58,
      chief_complaint: "Fever and productive cough",
      symptoms: ["fever", "productive cough", "fatigue", "green sputum"],
      symptom_duration: "3 days",
      severity: "moderate",
      urgency_level: "urgent",
      red_flags: [],
      medical_history: ["hypertension"],
      current_medications: ["lisinopril 10mg daily"],
      allergies: ["penicillin"],
      recommended_action: "Same-day or next-day physician visit; consider chest X-ray if symptoms worsen.",
      clinical_summary:
        "58-year-old with 3-day history of fever, productive cough with purulent sputum, and fatigue. No respiratory distress reported.",
      insufficient_information: false,
    },
    status: "pending",
    reports: SEED_REPORTS["seed-002"],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "seed-003",
    patientName: "Aisha Patel",
    patientAge: 27,
    transcript:
      "I have a mild sore throat and runny nose for two days. No fever. I think it's just a cold.",
    brief: {
      patient_name: "Aisha Patel",
      patient_age: 27,
      chief_complaint: "Sore throat and rhinorrhea",
      symptoms: ["sore throat", "runny nose"],
      symptom_duration: "2 days",
      severity: "mild",
      urgency_level: "routine",
      red_flags: [],
      medical_history: [],
      current_medications: [],
      allergies: [],
      recommended_action: "Supportive care; schedule routine visit if symptoms persist beyond 7 days.",
      clinical_summary:
        "27-year-old with 2-day mild upper respiratory symptoms, afebrile, self-described as common cold.",
      insufficient_information: false,
    },
    status: "reviewed",
    reports: SEED_REPORTS["seed-003"],
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "seed-004",
    patientName: "Robert Williams",
    patientAge: 72,
    transcript:
      "Sudden worst headache of my life started an hour ago. I also feel confused and my speech is slurring.",
    brief: {
      patient_name: "Robert Williams",
      patient_age: 72,
      chief_complaint: "Sudden severe headache with neurological symptoms",
      symptoms: ["thunderclap headache", "confusion", "slurred speech"],
      symptom_duration: "1 hour",
      severity: "severe",
      urgency_level: "emergency",
      red_flags: ["thunderclap headache", "altered mental status", "slurred speech"],
      medical_history: ["atrial fibrillation"],
      current_medications: ["warfarin"],
      allergies: [],
      recommended_action: "Immediate ER — rule out subarachnoid hemorrhage or stroke.",
      clinical_summary:
        "72-year-old on warfarin with acute thunderclap headache, confusion, and dysarthria for 1 hour. Neurological emergency.",
      insufficient_information: false,
    },
    status: "pending",
    reports: SEED_REPORTS["seed-004"],
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
  },
  {
    id: "seed-005",
    patientName: "Emily Torres",
    patientAge: 41,
    transcript:
      "Lower back pain for a week after lifting boxes. It's annoying but I can still walk and no leg numbness.",
    brief: {
      patient_name: "Emily Torres",
      patient_age: 41,
      chief_complaint: "Mechanical lower back pain",
      symptoms: ["lower back pain"],
      symptom_duration: "1 week",
      severity: "mild",
      urgency_level: "routine",
      red_flags: [],
      medical_history: [],
      current_medications: ["ibuprofen as needed"],
      allergies: [],
      recommended_action: "Routine visit; conservative management with activity modification.",
      clinical_summary:
        "41-year-old with 1-week mechanical low back pain after lifting, ambulatory, no radicular symptoms.",
      insufficient_information: false,
    },
    status: "pending",
    reports: SEED_REPORTS["seed-005"],
    createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
  },
];

let cases = [...seedCases];

function normalizeBrief(brief = {}) {
  return {
    ...brief,
    complaint_category: brief.complaint_category || brief.chief_complaint || "Ophthalmology Intake",
    associated_symptoms: {
      pain: false,
      redness: false,
      watering_discharge: false,
      flashes_floaters: false,
      ...brief.associated_symptoms,
    },
    onset_type: brief.onset_type || "unknown",
    onset_context: brief.onset_context || "unknown",
    onset_details: brief.onset_details || "Not documented",
    prior_ophthalmic_care: brief.prior_ophthalmic_care || "None reported",
    past_ocular_treatment: brief.past_ocular_treatment || "None reported",
    systemic_illness: brief.systemic_illness || [],
    highlight_points: brief.highlight_points?.length ? brief.highlight_points : brief.red_flags || [],
    differential_diagnosis: brief.differential_diagnosis || [],
  };
}

function withNormalizedBrief(caseRecord) {
  if (!caseRecord) return null;
  return { ...caseRecord, brief: normalizeBrief(caseRecord.brief) };
}

function sortByUrgency(list) {
  return [...list].sort((a, b) => {
    const ua = URGENCY_ORDER[a.brief?.urgency_level] ?? 3;
    const ub = URGENCY_ORDER[b.brief?.urgency_level] ?? 3;
    if (ua !== ub) return ua - ub;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
}

export function getAllCases() {
  return sortByUrgency(cases.map(withNormalizedBrief));
}

export function getCaseById(id) {
  return withNormalizedBrief(cases.find((c) => c.id === id) || null);
}

export function createCase(payload) {
  const now = new Date().toISOString();
  const brief = normalizeBrief(payload.brief);
  const newCase = {
    id: randomUUID(),
    patientName: payload.patientName || brief?.patient_name || "Unknown",
    patientAge: payload.patientAge ?? brief?.patient_age ?? null,
    transcript: payload.transcript || "",
    brief,
    reports: payload.reports || generateReportsForCase(brief || {}),
    patientSnapshot: payload.patientSnapshot || null,
    visualObservation: payload.visualObservation || null,
    status: payload.status || "pending",
    createdAt: now,
    updatedAt: now,
  };
  cases.unshift(newCase);
  return newCase;
}

export function updateCase(id, updates) {
  const index = cases.findIndex((c) => c.id === id);
  if (index === -1) return null;

  cases[index] = {
    ...cases[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  return withNormalizedBrief(cases[index]);
}
