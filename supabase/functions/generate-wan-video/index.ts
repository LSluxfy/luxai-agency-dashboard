
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN");
    if (!REPLICATE_API_TOKEN) {
      throw new Error("REPLICATE_API_TOKEN não está configurado");
    }

    const { image, prompt } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "Imagem não fornecida" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Iniciando geração de vídeo WAN com imagem e prompt:", prompt);

    const response = await fetch(
      "https://api.replicate.com/v1/predictions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
          "Prefer": "wait"
        },
        body: JSON.stringify({
          version: "47f1fcda37910990d4f14f2bed2511b8307d7b9770f66e45ba5b34fa5886609c",
          input: {
            image: image,
            prompt: prompt || "A person is talking",
            max_area: "832x480",
            fast_mode: "Balanced",
            lora_scale: 1,
            num_frames: 81,
            sample_shift: 3,
            sample_steps: 30,
            frames_per_second: 16,
            sample_guide_scale: 5
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Replicate API erro:", errorData);
      throw new Error(`Erro na API Replicate: ${JSON.stringify(errorData)}`);
    }

    const prediction = await response.json();
    console.log("Predição iniciada:", prediction.id);

    return new Response(
      JSON.stringify({
        predictionId: prediction.id,
        status: prediction.status,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Erro na função de geração de vídeo WAN:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
