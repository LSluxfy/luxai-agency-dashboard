
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
    const { id } = await req.json();
    
    if (!id) {
      return new Response(
        JSON.stringify({ error: "ID é obrigatório" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Make request to Stability API to check status
    console.log(`Checking status for video generation with ID: ${id}`);
    
    const response = await fetch(`${STABILITY_API_HOST}/v2beta/stable-video/image-to-video/result/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    
    // Use text() to get the response body first
    const responseText = await response.text();
    
    if (!response.ok) {
      // Try to parse the error if possible
      let errorMessage = `API Error (${response.status}): ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If parsing fails, use the response text
        console.error("Failed to parse error response:", e);
      }
      
      console.error("Stability API error:", errorMessage);
      
      // If we get a 404, it might mean the generation is still in queue or processing
      if (response.status === 404) {
        return new Response(
          JSON.stringify({ status: "processing", message: "Geração em fila" }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(errorMessage);
    }
    
    // Parse the text response
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse response:", responseText);
      throw new Error("Invalid response from Stability API");
    }
    
    // Prepare response based on generation status
    let responseData = {
      status: result.status,
      videoUrl: result.video_url,
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
    console.error("Error in check-stability-video function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Um erro inesperado ocorreu" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
