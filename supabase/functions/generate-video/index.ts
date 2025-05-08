
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

    const { imageUrl } = await req.json();
    console.log("Iniciando geração de vídeo com a imagem");

    if (!imageUrl) {
      throw new Error("URL da imagem não fornecida. Por favor, forneça uma URL de imagem válida.");
    }

    // Determine if the image is a data URI or a regular URL
    let requestBody;
    if (imageUrl.startsWith("data:image/")) {
      // It's a data URI, we'll use it directly
      console.log("Usando Data URI para a geração de vídeo");
      requestBody = JSON.stringify({
        "promptImage": imageUrl
      });
    } else {
      // It's a regular URL
      console.log("Usando URL de imagem para a geração de vídeo:", imageUrl);
      requestBody = JSON.stringify({
        "promptImage": imageUrl
      });
    }

    // Make the API call to Runway
    const response = await fetch("https://api.runwayml.com/v1/image-to-video", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06",
        "Content-Type": "application/json",
      },
      body: requestBody,
    });

    // Log the response status for debugging
    console.log("Runway API response status:", response.status);
    
    // Handle non-200 responses
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
        id: prediction.id || prediction.requestId,
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
