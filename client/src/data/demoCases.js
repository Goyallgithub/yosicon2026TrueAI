const now = Date.now();

function caseRecord(id, name, age, urgency, chief, briefExtra, reports, status = "pending", minsAgo = 30) {
  const ts = new Date(now - minsAgo * 60 * 1000).toISOString();
  return {
    id,
    patientName: name,
    patientAge: age,
    status,
    createdAt: ts,
    updatedAt: ts,
    transcript: briefExtra.transcript || "",
    patientSnapshot: null,
    visualObservation: null,
    brief: {
      patient_name: name,
      patient_age: age,
      chief_complaint: chief,
      complaint_category: briefExtra.complaint_category || chief,
      symptoms: briefExtra.symptoms || [],
      symptom_duration: briefExtra.symptom_duration || "Unknown",
      severity: briefExtra.severity || "moderate",
      urgency_level: urgency,
      associated_symptoms: briefExtra.associated_symptoms || {
        pain: false,
        redness: false,
        watering_discharge: false,
        flashes_floaters: false,
      },
      onset_type: briefExtra.onset_type || "unknown",
      onset_context: briefExtra.onset_context || "unknown",
      onset_details: briefExtra.onset_details || "Not documented",
      prior_ophthalmic_care: briefExtra.prior_ophthalmic_care || "None reported",
      past_ocular_treatment: briefExtra.past_ocular_treatment || "None reported",
      systemic_illness: briefExtra.systemic_illness || [],
      red_flags: briefExtra.red_flags || [],
      highlight_points: briefExtra.highlight_points || [],
      differential_diagnosis: briefExtra.differential_diagnosis || [],
      medical_history: briefExtra.medical_history || [],
      current_medications: briefExtra.current_medications || [],
      allergies: briefExtra.allergies || [],
      recommended_action: briefExtra.recommended_action || "Ophthalmology review",
      clinical_summary: briefExtra.clinical_summary || "",
      insufficient_information: false,
    },
    reports,
  };
}

export const DEMO_CASES = [
  caseRecord(
    "demo-001",
    "Rajesh Kumar",
    62,
    "urgent",
    "Progressive decreased vision — OU",
    {
      transcript:
        "Patient: Namaste, mujhe 8 mahine se dono aankhon se dikhna kam ho raha hai.\nRakshak: How long and any pain or redness?\nPatient: No pain, no redness. Driving at night is difficult.\nRakshak: Any diabetes?\nPatient: Yes, Type 2 diabetes.",
      complaint_category: "Decreased Vision — OU",
      symptom_duration: "8 months, progressive",
      severity: "moderate",
      associated_symptoms: { pain: false, redness: false, watering_discharge: false, flashes_floaters: false },
      onset_type: "gradual",
      onset_context: "spontaneous",
      onset_details: "Gradual blurring, worse in dim light",
      systemic_illness: ["Type 2 Diabetes Mellitus", "Hypertension"],
      highlight_points: [
        "Bilateral progressive vision loss × 8 months — rule out visually significant cataract",
        "Type 2 DM — assess for diabetic retinopathy before surgery",
        "Night driving difficulty — functional impairment documented",
      ],
      differential_diagnosis: ["Senile cataract", "Diabetic macular edema", "Age-related macular degeneration"],
      recommended_action: "Bilateral cataract evaluation — biometry, dilated fundoscopy, medical clearance",
      clinical_summary:
        "62-year-old male with progressive painless bilateral decreased vision over 8 months, worse in dim light. Type 2 DM and HTN. No acute red flags.",
      symptoms: ["decreased vision", "night glare"],
      current_medications: ["Metformin 500mg BD", "Amlodipine 5mg OD"],
    },
    {
      imaging: [
        { id: "oct", type: "OCT Macula", modality: "OCT", finding: "CMT WNL. No macular edema." },
        { id: "fundus", type: "Dilated Fundoscopy", modality: "Ophthalmology", finding: "Nuclear sclerosis OU. Mild NPDR." },
      ],
      labs: [{ name: "HbA1c", value: "7.2", unit: "%", flag: "high" }],
      vitals: { bp: "138/86", hr: "78", temp: "98.4°F", spo2: "98%" },
      aiInsight: "Urgent ophthalmology review — cataract workup with diabetic retinopathy screening.",
    },
    "pending",
    12
  ),
  caseRecord(
    "demo-002",
    "Priya Menon",
    45,
    "emergency",
    "Sudden floaters and flashes — OD",
    {
      transcript:
        "Patient: Since 2 days I see flashes and cobweb floaters in right eye.\nRakshak: Any trauma? Vision loss?\nPatient: No trauma. Vision slightly blurred OD.",
      complaint_category: "Photopsia / Floaters — OD",
      symptom_duration: "2 days",
      severity: "severe",
      associated_symptoms: { pain: false, redness: false, watering_discharge: false, flashes_floaters: true },
      onset_type: "sudden",
      onset_context: "spontaneous",
      onset_details: "Acute photopsia and floaters while reading",
      highlight_points: [
        "Acute photopsia + floaters OD — HIGH suspicion retinal tear / detachment",
        "Myopic patient — RD risk factor",
        "Same-day dilated fundoscopy mandatory",
      ],
      differential_diagnosis: ["Posterior vitreous detachment", "Retinal tear", "Rhegmatogenous retinal detachment"],
      recommended_action: "EMERGENCY — same-day dilated fundoscopy + B-scan if indicated",
      clinical_summary: "45-year-old female with 2-day history of sudden flashes and floaters OD without trauma.",
      symptoms: ["floaters", "photopsia", "blurred vision OD"],
      past_ocular_treatment: "LASIK OD 2015",
    },
    {
      imaging: [
        { id: "bscan", type: "B-Scan Ultrasonography", modality: "Ultrasound", finding: "Vitreous opacities OD. No obvious RD on B-scan." },
        { id: "fundus", type: "Dilated Fundoscopy", modality: "Ophthalmology", finding: "Urgent read pending." },
      ],
      labs: [],
      vitals: { bp: "122/78", hr: "82", temp: "98.6°F", spo2: "99%" },
      aiInsight: "Ophthalmic emergency — rule out retinal detachment within hours.",
    },
    "pending",
    5
  ),
  caseRecord(
    "demo-003",
    "Mohammed Farhan",
    38,
    "urgent",
    "Red eye with purulent discharge — OS",
    {
      complaint_category: "Red Eye / Discharge — OS",
      symptom_duration: "3 days",
      severity: "moderate",
      associated_symptoms: { pain: false, redness: true, watering_discharge: true, flashes_floaters: false },
      onset_context: "post_event",
      onset_details: "After swimming in pool",
      systemic_illness: ["Asthma"],
      highlight_points: ["Purulent discharge OS — contagious bacterial conjunctivitis likely", "Contact lens history — rule out keratitis"],
      differential_diagnosis: ["Bacterial conjunctivitis", "Contact lens keratitis"],
      recommended_action: "Slit-lamp exam. Topical antibiotics × 7 days. Contact lens abstinence.",
      clinical_summary: "38-year-old with 3-day red left eye and mucopurulent discharge after swimming.",
      symptoms: ["redness", "discharge", "irritation"],
      allergies: ["Penicillin"],
    },
    {
      imaging: [{ id: "slit", type: "Slit-Lamp Photo", modality: "Ophthalmology", finding: "Conjunctival injection OS. Cornea clear." }],
      labs: [],
      vitals: { bp: "118/76", hr: "74", temp: "98.8°F", spo2: "98%" },
      aiInsight: "Urgent review within 24h — exclude keratitis in contact lens wearer.",
    },
    "reviewed",
    90
  ),
];

export const DEMO_SAMPLE_TRANSCRIPT = DEMO_CASES[0].transcript;

export const DEMO_SAMPLE_MESSAGES = [
  { id: "d1", role: "agent", text: "Namaste! Main Rakshak, aankh clinic se. Aaj aankh mein kya problem hai?" },
  { id: "d2", role: "user", text: "Mujhe 8 mahine se dono aankhon se dikhna kam ho raha hai." },
  { id: "d3", role: "agent", text: "Koi dard, laalpan, paani ya flashes?" },
  { id: "d4", role: "user", text: "Nahi, bas dhundla dikhta hai, raat mein aur zyada." },
  { id: "d5", role: "agent", text: "Diabetes ya BP hai? Pehle koi eye treatment?" },
  { id: "d6", role: "user", text: "Diabetes hai. Koi eye surgery nahi hui." },
  { id: "d7", role: "agent", text: "Perfect, aapki details eye doctor ko bhej di hain. Take care!" },
];

export function getDemoEmrReply(message, patient) {
  const q = message.toLowerCase();
  if (q.includes("do not miss") || q.includes("do-not-miss")) {
    return `Do-not-miss for ${patient.name}:\n${patient.highlightPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}`;
  }
  if (q.includes("ddx") || q.includes("differential") || q.includes("workup")) {
    return `DDx: ${patient.brief.differential_diagnosis.join(", ")}.\nPlan: ${patient.brief.recommended_action}`;
  }
  if (q.includes("summarize") || q.includes("hpi") || q.includes("cc")) {
    return `CC: ${patient.brief.chief_complaint}\nHPI: ${patient.brief.clinical_summary || patient.brief.onset_details}\nDuration: ${patient.brief.symptom_duration}`;
  }
  return `Pre-consultation note — ${patient.name} (${patient.mrn}): ${patient.diagnosis}. ${patient.brief.recommended_action}. Review highlight points before entering clinic.`;
}
