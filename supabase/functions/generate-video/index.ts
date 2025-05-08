
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");

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
    if (!REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set in environment variables");
      throw new Error("Replicate API token not found in environment variables.");
    }

    const { prompt } = await req.json();
    console.log("Iniciando geração de vídeo com o prompt:", prompt);

    // Use the minimax/video-01 model as requested
    const modelVersion = "minimax/video-01";
    
    // Make the API call to Replicate
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify({
        version: "latest",
        input: {
          prompt: prompt || "a woman is walking through a busy Tokyo street at night, she is wearing dark sunglasses"
        }
      }),
    });

    // Log the response status for debugging
    console.log("Replicate API response status:", response.status);
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta da API Replicate:", response.status, errorText);
      throw new Error(`API Replicate respondeu com status ${response.status}: ${errorText}`);
    }

    const prediction = await response.json();
    console.log("Resposta da API Replicate (inicio):", prediction);

    // Return the prediction data for tracking
    if (prediction.id) {
      console.log("Geração de vídeo iniciada, ID:", prediction.id);
      
      return new Response(
        JSON.stringify({ 
          status: prediction.status, 
          id: prediction.id,
          message: "Geração de vídeo iniciada"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If already complete
    if (prediction.output) {
      console.log("Vídeo gerado com sucesso:", prediction.output);
      return new Response(
        JSON.stringify({ 
          status: "succeeded",
          output: prediction.output 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle unexpected response
    return new Response(
      JSON.stringify({ 
        status: "unknown",
        message: "Status desconhecido da geração", 
        prediction 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro na função de geração de vídeo:", error);
    
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Erro desconhecido ao gerar vídeo"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
