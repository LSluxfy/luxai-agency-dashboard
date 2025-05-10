
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
    const { id, engineId = "stable-diffusion-xl-1024-v1-0" } = await req.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID é obrigatório" }),
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
    
    // Make request to Stability API to check status
    console.log(`Verificando status da geração de vídeo com ID: ${id} (Engine: ${engineId})`);
    
    // Use the correct endpoint for checking status
    const endpoint = `${STABILITY_API_HOST}/v1/generation/${engineId}/image-to-video/result/${id}`;
    console.log(`Usando endpoint: ${endpoint}`);
    
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    // Handle non-successful responses
    if (!response.ok) {
      // If we get a 404, it might mean the generation is still in queue or processing
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ 
            status: "processing", 
            message: "Geração em fila ou em processamento" 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      let errorMessage = `Erro da API (${response.status}): ${response.statusText}`;
      let errorData = null;
      
      try {
        // Try to get text response first
        const errorText = await response.text();
        console.log("Texto da resposta de erro:", errorText);
        
        try {
          if (errorText.trim()) {
            // Try to parse as JSON if possible
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
    
    // Parse the response as JSON
    const result = await response.json();
    console.log("Resposta de verificação de status:", result);
    
    // Prepare response based on generation status
    let responseData = {
      status: result.status,
      videoUrl: result.video_url || result.video,  // Compatibilidade com diferentes formatos de resposta
      engineId: engineId,
      error: null
    };
    
    if (result.status === "failed") {
      responseData.error = result.error || "Falha na geração sem mensagem de erro";
    }
    
    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Erro na função check-stability-video:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Um erro inesperado ocorreu" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
