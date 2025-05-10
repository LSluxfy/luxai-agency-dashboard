
// Valid dimensions for SDXL models
export const VALID_DIMENSIONS = [
  { value: "1024x1024", label: "Quadrado (1024x1024)" },
  { value: "1152x896", label: "Paisagem 9:7 (1152x896)" },
  { value: "1216x832", label: "Paisagem 3:2 (1216x832)" },
  { value: "1344x768", label: "Paisagem 7:4 (1344x768)" },
  { value: "1536x640", label: "Paisagem 12:5 (1536x640)" },
  { value: "640x1536", label: "Retrato 5:12 (640x1536)" },
  { value: "768x1344", label: "Retrato 4:7 (768x1344)" },
  { value: "832x1216", label: "Retrato 2:3 (832x1216)" },
  { value: "896x1152", label: "Retrato 7:9 (896x1152)" },
];

// Available SDXL models
export const SD_MODELS = [
  { value: "stable-diffusion-xl-1024-v1-0", label: "Stable Diffusion XL (1024)" },
  { value: "stable-diffusion-xl-beta-v2-2-2", label: "SDXL Beta v2.2.2" },
  { value: "stable-diffusion-v1-6", label: "Stable Diffusion 1.6" },
];

// Request body type for Stability API
export interface StabilityRequestBody {
  prompt: string;
  engineId: string;
  initImage?: string;
  dimensions?: string;
}
