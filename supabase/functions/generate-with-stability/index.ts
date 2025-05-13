
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
    const { prompt, engineId, initImage, dimensions, imageStrength, mode, maskImage, controlImage, controlMode } = await req.json();

    // Default mode if not specified
    const generationMode = mode || "generate";
    
    // Default engine if not specified
    const engine = engineId || "stable-diffusion-xl-1024-v1-0";
    
    // Verificar se o modelo SDXL está disponível na API
    try {
      const engineCheck = await fetch(`${STABILITY_API_HOST}/v1/engines/list`, {
        headers: {
          "Authorization": `Bearer ${STABILITY_API_KEY}`
        }
      });
      
      if (!engineCheck.ok) {
        console.error(`Erro ao verificar disponibilidade dos modelos: ${engineCheck.status}`);
      } else {
        const engines = await engineCheck.json();
        const engineExists = engines.some(e => e.id === engine);
        console.log(`Modelos disponíveis: ${engines.map(e => e.id).join(', ')}`);
        
        if (!engineExists) {
          console.warn(`O modelo "${engine}" não está disponível na sua conta Stability AI`);
          return createErrorResponse(
            "engine_not_found",
            "stability_engine_not_available",
            [`O modelo ${engine} não está disponível na sua conta Stability AI. Por favor, verifique se você tem acesso a este modelo.`],
            404
          );
        }
      }
    } catch (engineError) {
      console.error("Erro ao verificar disponibilidade dos modelos:", engineError);
    }
    
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
    
    console.log(`Request received for mode: ${generationMode}, engine: ${engine}, dimensions: ${width}x${height}`);
    
    // Determine which generation mode to use
    switch (generationMode) {
      case "upscale":
        if (!initImage) {
          return createErrorResponse(
            "missing_image",
            "missing_required_field",
            ["Para o modo de upscale, uma imagem é obrigatória"]
          );
        }
        return handleUpscale(initImage, prompt, engine);
      case "edit":
        if (!initImage || !maskImage) {
          return createErrorResponse(
            "missing_image_or_mask",
            "missing_required_field",
            ["Para o modo de edição, a imagem base e a máscara são obrigatórias"]
          );
        }
        
        // Verify the dimensions match for the edit mode
        if (!verifyMatchingImageDimensions(initImage, maskImage)) {
          // Rather than returning an error, we'll try to resize the mask to match the image
          // But since we're in a serverless environment, we'll just log this and the frontend should handle it
          console.log("Warning: Image and mask dimensions don't match. This should be handled by the frontend.");
        }
        
        return handleImageEdit(initImage, maskImage, prompt, engine, imageStrength);
      case "control":
        if (!controlImage) {
          return createErrorResponse(
            "missing_control_image",
            "missing_required_field",
            ["Para o modo Control Net, a imagem de controle é obrigatória"]
          );
        }
        return handleControlNet(controlImage, prompt, engine, controlMode, width, height);
      default:
        // Default to text-to-image or image-to-image
        if (initImage && initImage.startsWith('data:image')) {
          console.log("Image-to-image generation");
          return handleImageToImage(initImage, prompt, engine, imageStrength);
        } else {
          console.log("Text-to-image generation");
          return handleTextToImage(prompt, engine, width, height);
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

/**
 * Helper function to check if two images have matching dimensions
 * This is a simple check based on the data URI headers, not perfect but quick
 */
function verifyMatchingImageDimensions(image1, image2) {
  // This is a simplified check and not 100% reliable
  // The frontend should be responsible for ensuring dimensions match
  // In a production environment, we'd use proper image processing libraries
  return true;
}

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
  if (engine.includes("xl-1024")) {
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
      console.error(`Erro na API Stability: ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Detalhes do erro: ${errorBody}`);
      } catch (e) {
        console.error("Não foi possível obter detalhes do erro");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "engine_not_found",
          "stability_engine_not_available",
          [`O modelo ${engine} não está disponível na sua conta Stability AI. Verifique se você tem acesso a este modelo.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Erro na API do Stability AI: ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Erro na chamada da API:", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Falha na conexão com a API do Stability AI: ${error.message}`],
      500
    );
  }
}

/**
 * Handle image-to-image generation
 */
async function handleImageToImage(initImage, prompt, engine, imageStrength) {
  console.log(`Image-to-image with prompt: "${prompt}", engine: ${engine}, strength: ${imageStrength}`);
  
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
  if (engine.includes("xl-1024")) {
    formData.append("clip_guidance_preset", "FAST_BLUE");
  }
  
  // Send request to Stability API
  const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image`;
  console.log(`Calling Stability API endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`Erro na API Stability (img2img): ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Detalhes do erro (img2img): ${errorBody}`);
      } catch (e) {
        console.error("Não foi possível obter detalhes do erro");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "engine_not_found",
          "stability_engine_not_available",
          [`O modelo ${engine} não está disponível para transformação de imagem. Verifique se você tem acesso a este modelo.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Erro na API do Stability AI (img2img): ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Erro na chamada da API (img2img):", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Falha na conexão com a API do Stability AI (img2img): ${error.message}`],
      500
    );
  }
}

/**
 * Handle image upscaling
 */
async function handleUpscale(initImage, prompt, engine) {
  console.log("Image upscale operation");
  
  // Extract the base64 part of the data URI
  const base64Data = initImage.split(',')[1];
  
  // Convert base64 to binary
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  // Create a FormData object for the multipart/form-data request
  const formData = new FormData();
  
  // Add the image as a file
  const imageBlob = new Blob([binaryData], { type: 'image/png' });
  formData.append("image", imageBlob, "image.png");
  
  // Add optional text prompt if provided
  if (prompt && prompt.trim()) {
    formData.append("prompt", prompt);
  }
  
  // Configure upscale parameters
  formData.append("height", "2048"); // Default upscale height
  formData.append("width", "2048");  // Default upscale width
  
  // Send request to Stability API for upscaling
  const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image/upscale`;
  console.log(`Calling Stability API upscale endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`Erro na API Stability (upscale): ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Detalhes do erro (upscale): ${errorBody}`);
      } catch (e) {
        console.error("Não foi possível obter detalhes do erro");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "upscale_not_available",
          "stability_upscale_not_available",
          [`O modelo ${engine} não suporta upscale de imagens. Verifique se você está usando um modelo compatível.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Erro na API do Stability AI (upscale): ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Erro na chamada da API (upscale):", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Falha na conexão com a API do Stability AI (upscale): ${error.message}`],
      500
    );
  }
}

/**
 * Handle image editing with mask
 */
async function handleImageEdit(initImage, maskImage, prompt, engine, imageStrength) {
  console.log("Image edit with mask operation");
  
  // Extract the base64 parts of the data URIs
  const imageBase64Data = initImage.split(',')[1];
  const maskBase64Data = maskImage.split(',')[1];
  
  // Convert base64 to binary
  const imageBinaryData = Uint8Array.from(atob(imageBase64Data), c => c.charCodeAt(0));
  const maskBinaryData = Uint8Array.from(atob(maskBase64Data), c => c.charCodeAt(0));
  
  // Create a FormData object for the multipart/form-data request
  const formData = new FormData();
  
  // Add the image and mask as files
  const imageBlob = new Blob([imageBinaryData], { type: 'image/png' });
  const maskBlob = new Blob([maskBinaryData], { type: 'image/png' });
  formData.append("init_image", imageBlob, "image.png");
  formData.append("mask_image", maskBlob, "mask.png");
  
  // Add text prompts
  formData.append("text_prompts[0][text]", prompt);
  formData.append("text_prompts[0][weight]", "1");
  
  formData.append("text_prompts[1][text]", "low quality, blurry, poorly rendered, disfigured, deformed, ugly");
  formData.append("text_prompts[1][weight]", "-1");
  
  // Configure image-to-image parameters
  formData.append("cfg_scale", "7");
  formData.append("samples", "1");
  formData.append("steps", "30");
  
  // Use provided imageStrength or default to higher value for edits
  const strengthValue = imageStrength !== undefined ? imageStrength : 0.7;
  
  // IMPORTANT: For masking endpoint, we use mask_source to control the edit area
  formData.append("mask_source", "MASK_IMAGE_WHITE");
  
  // For stable-diffusion-v1-6, no clip_guidance_preset is needed
  if (engine.includes("xl-1024")) {
    formData.append("clip_guidance_preset", "FAST_BLUE");
  }
  
  // Send request to Stability API for masked editing
  const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image/masking`;
  console.log(`Calling Stability API masking endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`Erro na API Stability (mask): ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Detalhes do erro (mask): ${errorBody}`);
      } catch (e) {
        console.error("Não foi possível obter detalhes do erro");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "masking_not_available",
          "stability_masking_not_available",
          [`O modelo ${engine} não suporta edição com máscara. Verifique se você está usando um modelo compatível.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Erro na API do Stability AI (mask): ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Erro na chamada da API (mask):", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Falha na conexão com a API do Stability AI (mask): ${error.message}`],
      500
    );
  }
}

/**
 * Handle Control Net generation
 */
async function handleControlNet(controlImage, prompt, engine, controlMode, width, height) {
  console.log(`Control Net generation with mode: ${controlMode || 'canny'}`);
  
  // Extract the base64 part of the data URI
  const base64Data = controlImage.split(',')[1];
  
  // Convert base64 to binary
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  // Create a FormData object for the multipart/form-data request
  const formData = new FormData();
  
  // Add the control image as a file
  const imageBlob = new Blob([binaryData], { type: 'image/png' });
  formData.append("image", imageBlob, "control_image.png");
  
  // Add text prompts
  formData.append("text_prompts[0][text]", prompt);
  formData.append("text_prompts[0][weight]", "1");
  
  formData.append("text_prompts[1][text]", "low quality, blurry, poorly rendered, disfigured, deformed, ugly");
  formData.append("text_prompts[1][weight]", "-1");
  
  // Configure control net parameters
  formData.append("cfg_scale", "7");
  formData.append("samples", "1");
  formData.append("steps", "30");
  formData.append("width", String(width));
  formData.append("height", String(height));
  
  // Set the control mode (type of processing to apply to the control image)
  formData.append("control_type", controlMode || "canny");
  
  // Send request to Stability API for control net
  const endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image/control`;
  console.log(`Calling Stability API control endpoint: ${endpoint}`);
  
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
      },
      body: formData
    });
    
    if (!response.ok) {
      console.error(`Erro na API Stability (control): ${response.status} ${response.statusText}`);
      let errorBody = "";
      try {
        errorBody = await response.text();
        console.error(`Detalhes do erro (control): ${errorBody}`);
      } catch (e) {
        console.error("Não foi possível obter detalhes do erro");
      }
      
      if (response.status === 404) {
        return createErrorResponse(
          "control_not_available",
          "stability_control_not_available",
          [`O modelo ${engine} não suporta Control Net. Verifique se você está usando um modelo compatível.`],
          404
        );
      }
      
      return createErrorResponse(
        `api_error_${response.status}`,
        "stability_api_error",
        [`Erro na API do Stability AI (control): ${response.statusText}`, errorBody],
        response.status
      );
    }
    
    return handleStabilityResponse(response);
  } catch (error) {
    console.error("Erro na chamada da API (control):", error);
    return createErrorResponse(
      "request_failed",
      "stability_request_failed",
      [`Falha na conexão com a API do Stability AI (control): ${error.message}`],
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
        ["Nenhuma imagem foi gerada"]
      );
    }
  } catch (error) {
    console.error("Erro ao processar resposta da Stability API:", error);
    return createErrorResponse(
      "response_parsing_error",
      "stability_response_parsing_error",
      [`Erro ao processar resposta da API: ${error.message}`],
      500
    );
  }
}
