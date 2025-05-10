
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
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status}`);
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
    console.log("Sending request to Stability API for image-to-video generation");
    
    const response = await fetch(`${STABILITY_API_HOST}/v2beta/stable-video/image-to-video`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STABILITY_API_KEY}`,
        // Don't set content-type here, it will be set by the browser with the correct boundary
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Stability API error:", errorData || await response.text());
      throw new Error(
        errorData?.message || 
        `API Error (${response.status}): ${response.statusText}`
      );
    }
    
    const result = await response.json();
    
    return new Response(
      JSON.stringify({ 
        id: result.id,
        status: result.status 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in generate-stability-video function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Um erro inesperado ocorreu" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
