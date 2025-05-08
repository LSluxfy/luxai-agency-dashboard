
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RUNWAY_API_KEY = Deno.env.get('RUNWAY_API_KEY');

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
    // Check if API key exists
    if (!RUNWAY_API_KEY) {
      console.error("RUNWAY_API_KEY is not set");
      throw new Error("Runway API key is not configured.");
    }

    const { imageUrl } = await req.json();
    console.log("Iniciando geração de vídeo com a imagem");

    if (!imageUrl) {
      throw new Error("URL da imagem não fornecida. Por favor, forneça uma URL de imagem válida.");
    }

    console.log("Usando URL de imagem para a geração de vídeo:", imageUrl.substring(0, 100) + "...");
    
    // Make the API call to Runway with updated parameters
    const response = await fetch("https://api.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNWAY_API_KEY}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06"
      },
      body: JSON.stringify({
        "promptImage": imageUrl,
        "model": "gen4_turbo",
        "ratio": "1280:720",
        "duration": 5
      }),
    });

    // Log the response status for debugging
    console.log("Runway API response status:", response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta da API Runway:", response.status, errorText);
      throw new Error(`API Runway respondeu com status ${response.status}: ${errorText}`);
    }

    const prediction = await response.json();
    console.log("Resposta da API Runway:", prediction);

    // Return the prediction data
    return new Response(
      JSON.stringify({
        status: "success", 
        id: prediction.id,
        message: "Geração de vídeo iniciada"
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
