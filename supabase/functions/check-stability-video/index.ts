
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
    const { id, engineId = "stable-video-diffusion" } = await req.json();
    
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
    
    // Make request to Stability AI API to check status
    console.log(`Verificando status da geração de vídeo com ID: ${id} (Engine: ${engineId})`);
    
    // Use the correct endpoint for the SVD model
    const endpoint = `${STABILITY_API_HOST}/v1/generation/${engineId}/image-to-video/result/${id}`;
    console.log(`Usando endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${STABILITY_API_KEY}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });
      
      // Get full response text for better error diagnosis
      const responseText = await response.text();
      console.log(`Resposta (status ${response.status}):`, responseText);
      
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
        
        let errorMessage = `Erro da API (${response.status})`;
        
        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Not valid JSON, use the text response
          errorMessage = `${errorMessage}: ${responseText.substring(0, 200)}`;
        }
        
        console.error("Erro da API Stability:", errorMessage);
        
        return new Response(
          JSON.stringify({ error: errorMessage }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Try to parse the response as JSON
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Falha ao analisar resposta como JSON:", jsonError);
        return new Response(
          JSON.stringify({ error: "Resposta inválida da API" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      console.log("Resposta de verificação de status (análise):", result);
      
      // Prepare response based on generation status
      let responseData = {
        status: result.status || "processing",
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
    } catch (fetchError) {
      console.error("Erro na requisição para a API Stability:", fetchError);
      return new Response(
        JSON.stringify({ error: `Erro na requisição para a API: ${fetchError.message}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Erro na função check-stability-video:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Um erro inesperado ocorreu" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
