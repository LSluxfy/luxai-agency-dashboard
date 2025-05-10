
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Stability AI API key
const STABILITY_API_KEY = "sk-hi1F0aMnM5x78l5jCZoA56ZrxQGsONfFGjBmGpI9LQDZoYdr";
const STABILITY_API_HOST = "https://api.stability.ai";

// Valid dimensions for SDXL models
const VALID_SDXL_DIMENSIONS = [
  "1024x1024",
  "1152x896",
  "1216x832",
  "1344x768", 
  "1536x640",
  "640x1536", 
  "768x1344", 
  "832x1216", 
  "896x1152"
];

/**
 * Helper function to create standardized error response
 */
function createErrorResponse(id, name, errors, status = 400) {
  return new Response(
    JSON.stringify({
      id,
      name,
      errors: Array.isArray(errors) ? errors : [errors]
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status 
    }
  );
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, engineId, initImage, dimensions } = await req.json();

    if (!prompt) {
      return createErrorResponse(
        "missing_prompt_error",
        "missing_required_field",
        ["O prompt é obrigatório"]
      );
    }

    // Default engine if not specified
    const engine = engineId || "stable-diffusion-xl-1024-v1-0";
    
    // Validate dimensions for SDXL models
    let width = 512;
    let height = 512;
    
    if (engine.includes("xl-1024")) {
      // SDXL model has specific dimension requirements
      if (dimensions) {
        // Check if the provided dimensions are valid for SDXL
        if (!VALID_SDXL_DIMENSIONS.includes(dimensions)) {
          return createErrorResponse(
            "invalid_sdxl_dimensions",
            "invalid_sdxl_v1_dimensions",
            [
              `Para os modelos stable-diffusion-xl-1024-v0-9 e stable-diffusion-xl-1024-v1-0, as dimensões permitidas são ${VALID_SDXL_DIMENSIONS.join(', ')}, mas recebemos ${dimensions}`
            ]
          );
        }
        
        // Parse the dimensions
        const [w, h] = dimensions.split("x").map(Number);
        width = w;
        height = h;
      } else {
        // Default for SDXL if not specified
        width = 1024;
        height = 1024;
      }
    } else {
      // For non-SDXL models like stable-diffusion-v1-6
      if (dimensions) {
        const [w, h] = dimensions.split("x").map(Number);
        width = w;
        height = h;
      }
      // Default is 512x512 for SD 1.6 if not specified
    }
    
    // Determine if we're doing text-to-image or image-to-image
    if (initImage && initImage.startsWith('data:image')) {
      console.log("Image-to-image generation");
      
      // Extract the base64 part of the data URI
      const base64Data = initImage.split(',')[1];
      
      // Convert base64 to binary
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      // Create a FormData object for the multipart/form-data request
      const formData = new FormData();
      
      // Add the image as a file
      const imageBlob = new Blob([binaryData], { type: 'image/png' });
      formData.append("init_image", imageBlob, "image.png");
      
      // Add other parameters as regular form fields
      formData.append("text_prompts[0][text]", prompt);
      formData.append("text_prompts[0][weight]", "1");
      formData.append("text_prompts[1][text]", "low quality, blurry, poorly rendered, disfigured, deformed, ugly");
      formData.append("text_prompts[1][weight]", "-1");
      formData.append("cfg_scale", "7");
      formData.append("samples", "1");
      formData.append("steps", "30");
      formData.append("image_strength", "0.35"); // Controls how much to transform the image
      
      // For stable-diffusion-v1-6, no clip_guidance_preset is needed
      if (!engine.includes("v1-6")) {
        formData.append("clip_guidance_preset", "FAST_BLUE");
      }
      
      // Send request to Stability API
      const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image`;
      console.log(`Calling Stability API endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STABILITY_API_KEY}`,
          // No Content-Type header - it will be set automatically with the FormData boundary
        },
        body: formData
      });
      
      if (!response.ok) {
        let errorData = null;
        let errorText = "Unknown error";
        
        try {
          errorData = await response.json();
          console.error(`API Error (Status ${response.status}):`, JSON.stringify(errorData));
        } catch (e) {
          try {
            errorText = await response.text();
            console.error(`API Error (Status ${response.status}):`, errorText);
          } catch (e2) {
            console.error(`API Error (Status ${response.status}): Could not parse response`);
          }
        }
        
        return createErrorResponse(
          errorData?.id || `stability_api_error_${Date.now()}`,
          errorData?.name || "stability_api_error",
          errorData?.message ? [errorData.message] : [`Erro na API de geração de imagem: ${errorText}`],
          response.status
        );
      }
      
      const responseData = await response.json();
      
      if (responseData.artifacts && responseData.artifacts.length > 0) {
        // Get the first generated image and convert from base64 to data URI
        const base64Image = responseData.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${base64Image}`;
        
        return new Response(
          JSON.stringify({ imageUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return createErrorResponse(
          "no_image_generated",
          "generation_failed",
          ["Nenhuma imagem foi gerada"]
        );
      }
    } else {
      // Text-to-image generation
      console.log("Text-to-image generation");
      console.log(`Using dimensions: ${width}x${height}`);
      
      const requestBody = {
        text_prompts: [
          {
            text: prompt,
            weight: 1
          },
          {
            text: "low quality, blurry, poorly rendered, disfigured, deformed, ugly",
            weight: -1
          }
        ],
        cfg_scale: 7,
        height: height,
        width: width,
        samples: 1,
        steps: 30,
      };
      
      // Add clip_guidance_preset for SDXL models only
      if (!engine.includes("v1-6")) {
        requestBody.clip_guidance_preset = "FAST_BLUE";
      }
      
      const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/text-to-image`;
      console.log(`Calling Stability API endpoint: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        // Try to parse as JSON first
        let errorData;
        try {
          errorData = await response.json();
          console.error(`API Error (Status ${response.status}):`, JSON.stringify(errorData));
        } catch (e) {
          const errorText = await response.text();
          console.error(`API Error (Status ${response.status}):`, errorText);
          
          return createErrorResponse(
            `stability_api_error_${Date.now()}`,
            "stability_api_error",
            [errorText || `API Error: ${response.statusText}`],
            response.status
          );
        }
        
        return createErrorResponse(
          errorData.id || `stability_api_error_${Date.now()}`,
          errorData.name || "stability_api_error",
          errorData.message ? [errorData.message] : ["Erro na API de geração de imagem"],
          response.status
        );
      }
      
      const responseData = await response.json();
      console.log("Generation successful");
      
      // The response includes an array of generated images
      if (responseData.artifacts && responseData.artifacts.length > 0) {
        // Get the first generated image and convert from base64 to data URI
        const base64Image = responseData.artifacts[0].base64;
        const imageUrl = `data:image/png;base64,${base64Image}`;
        
        return new Response(
          JSON.stringify({ imageUrl }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        return createErrorResponse(
          "no_image_generated",
          "generation_failed",
          ["Nenhuma imagem foi gerada"]
        );
      }
    }
  } catch (error) {
    console.error("Error in generate-with-stability function:", error);
    return createErrorResponse(
      `internal_error_${Date.now()}`,
      "internal_server_error",
      [error.message || "Erro interno do servidor"],
      500
    );
  }
});
