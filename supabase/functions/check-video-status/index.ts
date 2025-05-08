
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API token
    if (!RUNWAY_API_KEY) {
      console.error("RUNWAY_API_KEY is not set in environment variables");
      throw new Error("Runway API key not found in environment variables.");
    }
    
    const { id } = await req.json();
    console.log("Verificando status do vídeo com ID:", id);

    if (!id) {
      throw new Error("ID da geração não fornecido");
    }

    try {
      const response = await fetch(`https://api.runwayml.com/v1/image_to_video/${id}`, {
        headers: {
          "Authorization": `Bearer ${RUNWAY_API_KEY}`,
          "Content-Type": "application/json",
          "X-Runway-Version": "2024-11-06"
        },
      });

      // Log the response status for debugging
      console.log("Runway status check response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro ao verificar status:", response.status, errorText);
        throw new Error(`API respondeu com status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Status atual da geração:", result.status);
      
      // Also log the full result object for debugging purposes
      console.log("Full result object:", JSON.stringify(result));
      
      // Map Runway API status to our application status
      let status = result.status;
      let output = null;
      
      if (result.status === "COMPLETED" || result.status === "completed") {
        status = "succeeded";
        // Com a versão 2024-11-06, o campo pode ter uma estrutura diferente
        output = result.video || result.video_url || result.output || 
                (result.videos && result.videos.length > 0 ? result.videos[0] : null);
      } else if (result.status === "FAILED" || result.status === "failed") {
        status = "failed";
      } else if (result.status === "PROCESSING" || result.status === "QUEUED" || result.status === "processing" || result.status === "queued") {
        status = "processing";
      }

      return new Response(
        JSON.stringify({
          status: status,
          output: output,
          rawResponse: result
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Erro na chamada de verificação de status:", error);
      throw error; // Re-throw para ser capturado pelo catch externo
    }

  } catch (error) {
    console.error("Erro na verificação de status:", error);
    
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Erro desconhecido ao verificar status"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
