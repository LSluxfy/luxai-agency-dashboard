
// Note: This file is read-only according to your instructions. 
// The actual implementation will need to be updated separately.
// I'm providing the code that should be in this file for reference.

export const VALID_DIMENSIONS = [
  { value: "1024x1024", label: "1024x1024 (1:1)", sdxl: true },
  { value: "1152x896", label: "1152x896 (9:7)", sdxl: true },
  { value: "1216x832", label: "1216x832 (19:13)", sdxl: true },
  { value: "1344x768", label: "1344x768 (7:4)", sdxl: true },
  { value: "1536x640", label: "1536x640 (12:5)", sdxl: true },
  { value: "640x1536", label: "640x1536 (5:12)", sdxl: true },
  { value: "768x1344", label: "768x1344 (4:7)", sdxl: true },
  { value: "832x1216", label: "832x1216 (13:19)", sdxl: true },
  { value: "896x1152", label: "896x1152 (7:9)", sdxl: true },
  { value: "512x512", label: "512x512 (1:1)", sdxl: false },
  { value: "512x768", label: "512x768 (2:3)", sdxl: false },
  { value: "768x512", label: "768x512 (3:2)", sdxl: false },
  { value: "512x1024", label: "512x1024 (1:2)", sdxl: false },
  { value: "1024x512", label: "1024x512 (2:1)", sdxl: false }
];

export const SD_MODELS = [
  { value: "stable-diffusion-xl-1024-v1-0", label: "Stable Diffusion XL 1.0" },
  { value: "stable-diffusion-v1-6", label: "Stable Diffusion 1.6" }
];

export interface StabilityRequestBody {
  prompt: string;
  engineId?: string;
  dimensions?: string;
  initImage?: string;
  imageStrength?: number;
}
