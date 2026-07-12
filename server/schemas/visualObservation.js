export const visualObservationSchema = {
  name: "visual_observation",
  strict: true,
  schema: {
    type: "object",
    properties: {
      image_quality: {
        type: "string",
        enum: ["good", "poor", "unusable"],
      },
      visible_observations: {
        type: "array",
        items: { type: "string" },
      },
      clinical_notes: { type: "string" },
      insufficient_for_analysis: { type: "boolean" },
    },
    required: [
      "image_quality",
      "visible_observations",
      "clinical_notes",
      "insufficient_for_analysis",
    ],
    additionalProperties: false,
  },
};
