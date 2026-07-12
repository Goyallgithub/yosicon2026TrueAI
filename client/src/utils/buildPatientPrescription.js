/**
 * Builds a patient-friendly prescription sheet from case data.
 * Voice scripts use simple Hindi/Hinglish for medicine instructions.
 */

const PRESCRIPTION_TEMPLATES = {
  cataract: {
    diagnosis_simple:
      "Aapki dono aankhon mein cataract (safed parda) hai — is wajah se dikhna kam ho raha hai.",
    medicines: [
      {
        id: "m1",
        name: "Lubricating Eye Drops (Carboxymethylcellulose 0.5%)",
        form: "Eye Drops",
        instruction: "Din mein 4 baar, 1 drop dono aankhon mein daalein",
        timing: ["Subah", "Dopahar", "Shaam", "Raat"],
        duration: "15 din tak",
        voiceScript:
          "Aap ye lubricating eye drop din mein chaar baar daalein — subah, dopahar, shaam aur raat ko. Ek drop dono aankhon mein daalni hai. Halka sa sir upar karke neeche ki taraf dekhein.",
      },
      {
        id: "m2",
        name: "Timolol 0.5% Eye Drops",
        form: "Eye Drops",
        instruction: "Din mein 2 baar — subah aur raat, sirf affected eye mein",
        timing: ["Subah 8 baje", "Raat 8 baje"],
        duration: "Doctor ke bataye tak",
        voiceScript:
          "Timolol drop din mein do baar daalein — subah aur raat ko. Ek drop sirf jis aankh mein problem hai usmein. Drop daalne ke baad aankh band karke ek minute tak corner dabaye rakhein.",
      },
    ],
    precautions: [
      "Chalati gaadi ya machinery nahi chalayein jab tak doctor na kahein",
      "Aankh mein haath mat lagayein",
      "Follow-up par cataract surgery ke liye test karwayein",
    ],
    followUp: "Agle hafte eye doctor se milna zaroori hai — biometry aur surgery planning ke liye.",
  },
  floaters: {
    diagnosis_simple:
      "Aapki right aankh mein floaters aur flashes hain — doctor ko retinal tear rule out karna hai.",
    medicines: [
      {
        id: "m1",
        name: "No new eye drops until examination",
        form: "Instruction",
        instruction: "Abhi koi nayi drop mat daalein — pehle doctor ki dilated check zaroori hai",
        timing: ["—"],
        duration: "Aaj tak",
        voiceScript:
          "Abhi koi nayi eye drop mat shuru karein. Aaj hi doctor ke paas jaayein dilated fundoscopy ke liye. Agar aankh ke saamne parda ya shadow dikhe to turant emergency mein jaayein.",
      },
    ],
    precautions: [
      "Zor se khasne ya uthne-baithne se bachein",
      "Aankh par koi pressure mat daalein",
      "Curtain/shadow dikhe to turant hospital jaayein",
    ],
    followUp: "Aaj hi urgent eye check — same day appointment.",
  },
  conjunctivitis: {
    diagnosis_simple: "Aapki left aankh mein infection (conjunctivitis) hai — laalpan aur discharge ke saath.",
    medicines: [
      {
        id: "m1",
        name: "Moxifloxacin 0.5% Eye Drops",
        form: "Eye Drops",
        instruction: "Din mein 4 baar, 1-2 drop infected aankh mein",
        timing: ["Subah", "Dopahar", "Shaam", "Raat"],
        duration: "7 din poora course",
        voiceScript:
          "Aap ye Moxifloxacin eye drop din mein chaar baar daalein — subah, dopahar, shaam aur raat. Ek se do drop sirf left aankh mein. Saat din poora course complete karein, beech mein band mat karein.",
      },
      {
        id: "m2",
        name: "Artificial Tears",
        form: "Eye Drops",
        instruction: "Jab bhi aankh sukhi lage — din mein 2-3 baar",
        timing: ["Zarurat par"],
        duration: "Jab tak laalpan hai",
        voiceScript:
          "Artificial tears jab bhi aankh sukhi lage tab daalein, din mein do se teen baar. Antibiotic drop se kam se kam paanch minute ka gap rakhein.",
      },
    ],
    precautions: [
      "Apni towel aur pillow alag rakhein — infection fail sakta hai",
      "Contact lens bilkul mat pehnein",
      "Haath dhokar hi drop daalein",
    ],
    followUp: "3 din baad check-up agar laalpan na utre.",
  },
  default: {
    diagnosis_simple: "Aapki eye complaint doctor ko bhej di gayi hai. Neeche di gayi dawai ya care follow karein.",
    medicines: [
      {
        id: "m1",
        name: "Lubricating Eye Drops",
        form: "Eye Drops",
        instruction: "Din mein 3 baar, 1 drop dono aankhon mein",
        timing: ["Subah", "Dopahar", "Raat"],
        duration: "7 din",
        voiceScript:
          "Aap ye eye drop din mein teen baar daalein — subah, dopahar aur raat ko. Ek drop dono aankhon mein. Drop daalne ke baad ek minute tak aankh band rakhein.",
      },
    ],
    precautions: ["Screen time kam karein", "Direct sunlight mein bina sunglasses ke na jaayein"],
    followUp: "Doctor ne jo date di hai us din follow-up karein.",
  },
};

function pickTemplate(brief = {}) {
  const cc = `${brief.chief_complaint || ""} ${brief.complaint_category || ""} ${brief.clinical_summary || ""}`.toLowerCase();
  if (cc.includes("cataract") || cc.includes("decreased vision") || cc.includes("blur")) return PRESCRIPTION_TEMPLATES.cataract;
  if (cc.includes("float") || cc.includes("flash") || cc.includes("photopsia")) return PRESCRIPTION_TEMPLATES.floaters;
  if (cc.includes("red") || cc.includes("discharge") || cc.includes("conjunctiv")) return PRESCRIPTION_TEMPLATES.conjunctivitis;
  return PRESCRIPTION_TEMPLATES.default;
}

export function buildPatientPrescription(caseData) {
  const brief = caseData?.brief || {};
  const template = pickTemplate(brief);

  return {
    patientName: caseData?.patientName || brief.patient_name || "Patient",
    date: caseData?.createdAt ? new Date(caseData.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"),
    doctorName: "Dr. Ophthalmology Team",
    diagnosis_simple: template.diagnosis_simple,
    diagnosis_clinical: brief.chief_complaint || template.diagnosis_simple,
    urgency: brief.urgency_level || "routine",
    medicines: template.medicines,
    precautions: template.precautions,
    followUp: template.followUp,
    nextSteps: brief.recommended_action || template.followUp,
  };
}

export const DEMO_PATIENT_PRESCRIPTION = buildPatientPrescription({
  patientName: "Rajesh Kumar",
  createdAt: new Date().toISOString(),
  brief: {
    chief_complaint: "Progressive decreased vision — OU",
    urgency_level: "urgent",
    recommended_action: "Cataract evaluation within 1 week",
  },
});
