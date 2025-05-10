
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
    const { image, motionBucketId = 127, prompt = "" } = await req.json();
    
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
    
    // Make request to Stability API
    console.log("Enviando requisição para a API Stability para geração de image-to-video");
    
    const endpoint = `${STABILITY_API_HOST}/v2beta/stable-video/image-to-video`;
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
      
      try {
        // Try to get detailed error message if available
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If response is not JSON or has invalid JSON
        console.error("Erro ao analisar resposta de erro:", parseError);
        
        // Try to get error text if JSON parsing fails
        try {
          const errorText = await response.text();
          console.log("Texto da resposta de erro:", errorText);
          errorMessage = `Erro da API (${response.status}): ${errorText.substring(0, 200)}`;
        } catch (textError) {
          console.error("Também falhou ao obter texto do erro:", textError);
        }
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
        status: responseData.status 
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
