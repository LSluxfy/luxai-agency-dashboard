
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Stability AI API key
const STABILITY_API_KEY = Deno.env.get("STABILITY_API_KEY") || "";
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

// List of SDXL models to check for availability
const SDXL_MODELS = [
  "stable-diffusion-xl-1024-v1-0",
  "stable-diffusion-xl-beta-v2-2-2",
  "stable-diffusion-xl-1024-v0-9",
  "stable-diffusion-v1-6"
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
    // Check if API key is configured
    if (!STABILITY_API_KEY) {
      return createErrorResponse(
        "api_key_missing",
        "api_configuration_error",
        ["Stability AI API key is not configured"],
        500
      );
    }

    const { prompt, engineId, initImage, dimensions, imageStrength, mode, maskImage, controlImage, controlMode } = await req.json();

    // Default mode if not specified
    const generationMode = mode || "generate";
    
    // Default engine if not specified
    const engine = engineId || "stable-diffusion-xl-1024-v1-0";
    
    console.log(`Requested model: ${engine}`);
    console.log(`Generation mode: ${generationMode}`);
    console.log(`Has init image: ${initImage ? "yes" : "no"}`);
    
    // Check if the requested model is available in the Stability API
    let availableEngines = [];
    try {
      const engineCheck = await fetch(`${STABILITY_API_HOST}/v1/engines/list`, {
        headers: {
          "Authorization": `Bearer ${STABILITY_API_KEY}`
        }
      });
      
      if (!engineCheck.ok) {
        console.error(`Error checking model availability: ${engineCheck.status}`);
        return createErrorResponse(
          "api_connection_error",
          "stability_api_error",
          [`Error connecting to Stability AI API: ${engineCheck.statusText}`],
          engineCheck.status
        );
      }
      
      availableEngines = await engineCheck.json();
      const engineIds = availableEngines.map(e => e.id);
      console.log(`Available models: ${engineIds.join(', ')}`);
      
      const engineExists = engineIds.includes(engine);
      
      if (!engineExists) {
        console.warn(`Model "${engine}" is not available in your Stability AI account`);
        return createErrorResponse(
          "engine_not_found",
          "stability_engine_not_available",
          [`The model ${engine} is not available in your Stability AI account. Please verify your access to this model.`],
          404
        );
      }
      
      console.log(`Model "${engine}" is available, proceeding with generation.`);
    } catch (engineError) {
      console.error("Error checking model availability:", engineError);
      return createErrorResponse(
        "api_check_error",
        "stability_api_check_error",
        [`Could not verify model availability: ${engineError.message}`],
        500
      );
    }
    
    // Validate dimensions for SDXL models
    let width = 512;
    let height = 512;
    
    if (engine.includes("xl-1024") || engine.includes("xl-beta")) {
      // SDXL model has specific dimension requirements
      if (dimensions) {
        // Check if the provided dimensions are valid for SDXL
        if (!VALID_SDXL_DIMENSIONS.includes(dimensions)) {
          return createErrorResponse(
            "invalid_sdxl_dimensions",
            "invalid_sdxl_dimensions",
            [
              `For SDXL models, the allowed dimensions are ${VALID_SDXL_DIMENSIONS.join(', ')}, but received ${dimensions}`
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
    
    console.log(`Request received for mode: ${generationMode}, engine: ${engine}, dimensions: ${width}x${height}`);
    
    // Determine which generation mode to use
    if (initImage && initImage.startsWith('data:image')) {
      console.log("Image-to-image generation with reference image");
      return handleImageToImage(initImage, prompt, engine, imageStrength);
    } else {
      console.log("Text-to-image generation");
      return handleTextToImage(prompt, engine, width, height);
    }
  } catch (error) {
    console.error("Error in generate-with-stability function:", error);
    return createErrorResponse(
      `internal_error_${Date.now()}`,
      "internal_server_error",
      [error.message || "Internal server error"],
      500
    );
  }
});

/**
 * Handle text-to-image generation
 */
async function handleTextToImage(prompt, engine, width, height) {
  console.log(`Text-to-image with prompt: "${prompt}", engine: ${engine}`);
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
  if (engine.includes("xl-1024") || engine.includes("xl-beta")) {
    requestBody.clip_guidance_preset = "FAST_BLUE";
  }
  
  const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/text-to-image`;
  console.log(`Calling Stability API endpoint: ${endpoint}`);
  
  try {
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
      console.error(`Error in Stability API: ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Error details: ${errorBody}`);
      } catch (e) {
        console.error("Could not get error details");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "engine_not_found",
          "stability_engine_not_available",
          [`The model ${engine} is not available in your Stability AI account. Please verify your access to this model.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Error in Stability AI API: ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Error in API call:", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Failed to connect to Stability AI API: ${error.message}`],
      500
    );
  }
}

/**
 * Handle image-to-image generation
 */
async function handleImageToImage(initImage, prompt, engine, imageStrength) {
  console.log(`Image-to-image with prompt: "${prompt}", engine: ${engine}, strength: ${imageStrength}`);
  
  try {
    // Extract the base64 part of the data URI
    const base64Data = initImage.split(',')[1];
    
    // Convert base64 to binary
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Create a FormData object for the multipart/form-data request
    const formData = new FormData();
    
    // Add the image as a file
    const imageBlob = new Blob([binaryData], { type: 'image/png' });
    formData.append("init_image", imageBlob, "image.png");
    
    // Add text prompts - ENSURING THESE ARE PROPERLY PASSED
    // Positive prompt
    formData.append("text_prompts[0][text]", prompt);
    formData.append("text_prompts[0][weight]", "1");
    
    // Negative prompt
    formData.append("text_prompts[1][text]", "low quality, blurry, poorly rendered, disfigured, deformed, ugly");
    formData.append("text_prompts[1][weight]", "-1");
    
    formData.append("cfg_scale", "7");
    formData.append("samples", "1");
    formData.append("steps", "30");
    
    // Use provided imageStrength or default
    const strengthValue = imageStrength !== undefined ? imageStrength : 0.35;
    formData.append("image_strength", String(strengthValue));
    
    // For stable-diffusion-v1-6, no clip_guidance_preset is needed
    if (engine.includes("xl-1024") || engine.includes("xl-beta")) {
      formData.append("clip_guidance_preset", "FAST_BLUE");
    }
    
    // Send request to Stability API
    const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image`;
    console.log(`Calling Stability API endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`Error in Stability API (img2img): ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Error details (img2img): ${errorBody}`);
      } catch (e) {
        console.error("Could not get error details");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "engine_not_found",
          "stability_engine_not_available",
          [`The model ${engine} is not available for image transformation. Please verify your access to this model.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Error in Stability AI API (img2img): ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Error in API call (img2img):", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Failed to connect to Stability AI API (img2img): ${error.message}`],
      500
    );
  }
}

/**
 * Common handler for all Stability API responses
 */
async function handleStabilityResponse(response) {
  try {
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
        ["No image was generated"]
      );
    }
  } catch (error) {
    console.error("Error processing Stability API response:", error);
    return createErrorResponse(
      "response_parsing_error",
      "stability_response_parsing_error",
      [`Error processing API response: ${error.message}`],
      500
    );
  }
}
