
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stability AI API key
const STABILITY_API_KEY = Deno.env.get("STABILITY_API_KEY") || "";
const STABILITY_API_HOST = "https://api.stability.ai";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { image, motionBucketId = 127, prompt = "", engineId = "stable-diffusion-xl-1024-v1-0", width = 1024, height = 1024, steps = 30 } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: "Imagem é obrigatória" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if API key is configured
    if (!STABILITY_API_KEY) {
      console.error("STABILITY_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Chave da API Stability não configurada" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Validate engine ID
    const allowedEngines = ["stable-diffusion-xl-1024-v1-0", "stable-diffusion-v1-6"];
    if (!allowedEngines.includes(engineId)) {
      return new Response(
        JSON.stringify({ error: `Engine ID inválido. Use um dos seguintes: ${allowedEngines.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Validate dimensions based on engine
    if (engineId === "stable-diffusion-xl-1024-v1-0") {
      const validDimensions = [
        "1024x1024", "1152x896", "896x1152", "1216x832", "832x1216",
        "1344x768", "768x1344", "1536x640", "640x1536"
      ];
      const dimensionStr = `${width}x${height}`;
      
      if (!validDimensions.includes(dimensionStr)) {
        return new Response(
          JSON.stringify({ 
            error: `Dimensões inválidas para SDXL. Use uma das seguintes: ${validDimensions.join(', ')}` 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    } else if (engineId === "stable-diffusion-v1-6") {
      // Validate SD 1.6 dimensions
      if (width < 320 || height < 320 || width > 1536 || height > 1536) {
        return new Response(
          JSON.stringify({ 
            error: "Para SD 1.6, dimensões devem ser entre 320px e 1536px" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      if (width % 64 !== 0 || height % 64 !== 0) {
        return new Response(
          JSON.stringify({ 
            error: "Para SD 1.6, dimensões devem ser múltiplos de 64px" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }
    
    // Validate steps (1-50)
    if (steps < 1 || steps > 50) {
      return new Response(
        JSON.stringify({ error: "Número de steps deve estar entre 1 e 50" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Prepare payload based on image source type
    const formData = new FormData();
    
    if (image.startsWith('data:')) {
      // Handle data URI
      const base64Data = image.split(',')[1];
      const byteString = atob(base64Data);
      const arrayBuffer = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        arrayBuffer[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([arrayBuffer], { type: image.split(';')[0].split(':')[1] });
      formData.append('image', blob, 'image.png');
    } else {
      // It's a URL, fetch the image first
      const imageResponse = await fetch(image);
      if (!imageResponse.ok) {
        throw new Error(`Falha ao buscar imagem da URL: ${imageResponse.status}`);
      }
      const imageBlob = await imageResponse.blob();
      formData.append('image', imageBlob, 'image.png');
    }
    
    // Add other parameters
    if (motionBucketId) {
      formData.append('motion_bucket_id', motionBucketId.toString());
    }
    
    if (prompt && prompt.trim()) {
      formData.append('prompt', prompt);
    }
    
    // Add steps parameter
    formData.append('steps', steps.toString());
    
    // Make request to Stability API
    console.log(`Enviando requisição para a API Stability para geração de image-to-video (${engineId})`);
    console.log(`Usando dimensões: ${width}x${height}, steps: ${steps}`);
    
    // Updated endpoint for v1beta SVD (different from v2beta)
    let endpointPath = `/v1/generation/${engineId}/image-to-video`;
    
    const endpoint = `${STABILITY_API_HOST}${endpointPath}`;
    console.log(`Usando endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
        // Don't set content-type here, it will be set by the browser with the correct boundary
      },
      body: formData,
    });
    
    // Handle non-successful responses
    if (!response.ok) {
      let errorMessage = `Erro da API (${response.status}): ${response.statusText}`;
      let errorData = null;
      
      try {
        // Try to get response as JSON first
        const errorText = await response.text();
        console.log("Texto da resposta de erro:", errorText);
        
        try {
          if (errorText.trim()) {
            errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
            console.error("Erro da API Stability (JSON):", errorData);
          }
        } catch (jsonError) {
          // Not valid JSON, use the text response
          errorMessage = `Erro da API (${response.status}): ${errorText.substring(0, 200)}`;
          console.error("Erro da API Stability (texto):", errorText);
        }
      } catch (textError) {
        console.error("Falha ao obter texto do erro:", textError);
      }
      
      console.error("Erro da API Stability:", errorMessage);
      throw new Error(errorMessage);
    }
    
    // Parse the response as JSON (should be successful at this point)
    const responseData = await response.json();
    
    console.log("Resposta bem-sucedida da API Stability:", responseData);
    
    return new Response(
      JSON.stringify({ 
        id: responseData.id,
        status: responseData.status,
        engineId: engineId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erro na função generate-stability-video:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Um erro inesperado ocorreu" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
