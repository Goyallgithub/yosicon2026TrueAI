function pickImaging(chiefComplaint = "", urgency = "routine") {
  const cc = chiefComplaint.toLowerCase();
  if (
    cc.includes("vision") ||
    cc.includes("eye") ||
    cc.includes("visual") ||
    cc.includes("cataract") ||
    cc.includes("retina") ||
    cc.includes("float") ||
    cc.includes("red")
  ) {
    return [
      { id: "oct", type: "OCT Macula", modality: "OCT", status: "completed", finding: "Central macular thickness WNL. No cystoid changes." },
      { id: "fundus", type: "Dilated Fundoscopy", modality: "Ophthalmology", status: "completed", finding: "Disc cupping 0.4 OU. Macula dry. Vessels WNL." },
      { id: "biometry", type: "Biometry / A-Scan", modality: "Ultrasound", status: urgency === "urgent" ? "pending" : "completed", finding: "Axial length 23.8 mm OD, 23.6 mm OS." },
    ];
  }
  if (cc.includes("chest") || cc.includes("breath") || cc.includes("heart")) {
    return [
      { id: "cxr", type: "Chest X-Ray", modality: "X-Ray", status: "completed", finding: "No acute infiltrate. Mild cardiomegaly." },
      { id: "ecg", type: "ECG 12-Lead", modality: "Cardiac", status: "completed", finding: "Sinus rhythm. No ST elevation." },
    ];
  }
  if (cc.includes("head") || cc.includes("neuro")) {
    return [
      { id: "ct-head", type: "CT Head", modality: "CT", status: urgency === "emergency" ? "urgent" : "completed", finding: "Pending radiologist read." },
      { id: "fundus", type: "Retinal Fundoscopy", modality: "Ophthalmology", status: "completed", finding: "Disc margins sharp. No hemorrhage." },
    ];
  }
  if (cc.includes("back") || cc.includes("spine")) {
    return [
      { id: "lumbar-xr", type: "Lumbar Spine X-Ray", modality: "X-Ray", status: "completed", finding: "Mild degenerative changes L4-L5." },
    ];
  }
  return [
    { id: "slit-lamp", type: "Slit-Lamp Examination", modality: "Ophthalmology", status: "completed", finding: "Anterior segment WNL." },
    { id: "fundus", type: "Dilated Fundoscopy", modality: "Ophthalmology", status: "completed", finding: "Posterior segment — pending full examination." },
  ];
}

function pickLabs(urgency = "routine") {
  return [
    { name: "HbA1c", value: urgency === "emergency" ? "8.1" : "6.4", unit: "%", ref: "<7.0", flag: urgency === "emergency" ? "high" : "normal" },
    { name: "FBS", value: urgency === "emergency" ? "142" : "98", unit: "mg/dL", ref: "70–100", flag: urgency === "emergency" ? "high" : "normal" },
    { name: "Hemoglobin", value: "13.8", unit: "g/dL", ref: "12.0–16.0", flag: "normal" },
    { name: "ESR", value: urgency === "urgent" ? "28" : "12", unit: "mm/hr", ref: "<20", flag: urgency === "urgent" ? "high" : "normal" },
    { name: "CRP", value: urgency === "urgent" ? "18" : "4", unit: "mg/L", ref: "<10", flag: urgency === "urgent" ? "high" : "normal" },
  ];
}

export function generateReportsForCase(brief = {}) {
  const urgency = brief.urgency_level || "routine";
  const chief = brief.chief_complaint || "";

  return {
    imaging: pickImaging(chief, urgency),
    labs: pickLabs(urgency),
    vitals: {
      bp: urgency === "emergency" ? "158/94" : "122/78",
      hr: urgency === "emergency" ? "108" : "76",
      temp: urgency === "urgent" ? "101.2°F" : "98.4°F",
      spo2: urgency === "emergency" ? "93%" : "98%",
      rr: urgency === "emergency" ? "22" : "16",
    },
    documents: [
      { title: "Ophthalmology Intake Sheet", type: "pdf", status: "ready" },
      { title: "Voice Transcript", type: "transcript", status: "ready" },
      { title: "Triage Assessment", type: "report", status: "ready" },
    ],
    aiInsight:
      urgency === "emergency"
        ? "Ophthalmic emergency — urgent slit-lamp and dilated fundoscopy required. Do not miss sight-threatening pathology."
        : urgency === "urgent"
          ? "Urgent ophthalmology review within 24h. Assess for retinal tear, acute glaucoma, or corneal involvement."
          : "Routine ophthalmology follow-up. Complete refraction and dilated fundus examination.",
  };
}

export const SEED_REPORTS = {
  "seed-001": generateReportsForCase({ chief_complaint: "Decreased vision OU", urgency_level: "emergency" }),
  "seed-002": generateReportsForCase({ chief_complaint: "Red eye with discharge", urgency_level: "urgent" }),
  "seed-003": generateReportsForCase({ chief_complaint: "Progressive blurred vision", urgency_level: "routine" }),
  "seed-004": generateReportsForCase({ chief_complaint: "Sudden floaters and flashes OD", urgency_level: "emergency" }),
  "seed-005": generateReportsForCase({ chief_complaint: "Eye pain post trauma", urgency_level: "urgent" }),
};
