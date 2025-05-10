
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, engineId, initImage, dimensions } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "O prompt é obrigatório" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Default engine if not specified
    const engine = engineId || "stable-diffusion-xl-1024-v1-0";
    
    // Validate dimensions
    let width = 1024;
    let height = 1024;
    
    if (dimensions) {
      // Check if the provided dimensions are valid
      if (!VALID_SDXL_DIMENSIONS.includes(dimensions)) {
        return new Response(
          JSON.stringify({ 
            id: "invalid_sdxl_dimensions",
            name: "invalid_sdxl_v1_dimensions",
            error: "Dimensões inválidas para SDXL",
            validDimensions: VALID_SDXL_DIMENSIONS
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // Parse the dimensions
      const [w, h] = dimensions.split("x").map(Number);
      width = w;
      height = h;
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
      formData.append("clip_guidance_preset", "FAST_BLUE");
      formData.append("samples", "1");
      formData.append("steps", "30");
      formData.append("image_strength", "0.35"); // Controls how much to transform the image
      
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
        const errorText = await response.text();
        console.error(`API Error (Status ${response.status}):`, errorText);
        return new Response(
          JSON.stringify({ error: `API Error: ${response.statusText}`, details: errorText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
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
        return new Response(
          JSON.stringify({ error: "Nenhuma imagem foi gerada" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
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
        clip_guidance_preset: "FAST_BLUE",
        height: height,
        width: width,
        samples: 1,
        steps: 30,
      };
      
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
        const errorText = await response.text();
        console.error(`API Error (Status ${response.status}):`, errorText);
        return new Response(
          JSON.stringify({ error: `API Error: ${response.statusText}`, details: errorText }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
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
        return new Response(
          JSON.stringify({ error: "Nenhuma imagem foi gerada" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Error in generate-with-stability function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
