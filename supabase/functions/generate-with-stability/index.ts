
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Stability AI API key
const STABILITY_API_KEY = "sk-hi1F0aMnM5x78l5jCZoA56ZrxQGsONfFGjBmGpI9LQDZoYdr";
const STABILITY_API_HOST = "https://api.stability.ai";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { prompt, engineId, initImage } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "O prompt é obrigatório" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Default engine if not specified
    const engine = engineId || "stable-diffusion-xl-1024-v1-0";
    const headers = {
      "Authorization": `Bearer ${STABILITY_API_KEY}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    };

    let requestBody;
    let endpoint;

    // Determine if we're doing text-to-image or image-to-image
    if (initImage && initImage.startsWith('data:image')) {
      console.log("Image-to-image generation");
      endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/image-to-image`;
      
      // Extract the base64 part of the data URI
      const base64Data = initImage.split(',')[1];
      
      requestBody = {
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
        image: base64Data,
        cfg_scale: 7,
        clip_guidance_preset: "FAST_BLUE",
        samples: 1,
        steps: 30,
      };
    } else {
      console.log("Text-to-image generation");
      endpoint = `${STABILITY_API_HOST}/v1/generation/${engine}/text-to-image`;
      
      requestBody = {
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
        height: 1024,
        width: 1024,
        samples: 1,
        steps: 30,
      };
    }

    console.log(`Calling Stability API endpoint: ${endpoint}`);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: headers,
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
  } catch (error) {
    console.error("Error in generate-with-stability function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
