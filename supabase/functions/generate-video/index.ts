
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const REPLICATE_API_TOKEN = Deno.env.get("REPLICATE_API_TOKEN") || "r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE";

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
    const { prompt } = await req.json();
    console.log("Iniciando geração de vídeo com o prompt:", prompt);

    // Updated model ID - using a valid and popular text-to-video model on Replicate
    // This is Zeroscope V2 XL model which is publicly available
    const modelVersion = "cjwbw/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee4e44cedc1c3b71ecee78de31715";
    
    // Primeira chamada para iniciar a geração
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt: prompt || "a woman is walking through a busy Tokyo street at night, she is wearing dark sunglasses",
          fps: 24,
          num_frames: 24,
          width: 576,
          height: 320,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na resposta da API Replicate:", response.status, errorText);
      throw new Error(`API Replicate respondeu com status ${response.status}: ${errorText}`);
    }

    const prediction = await response.json();
    console.log("Resposta da API Replicate (inicio):", prediction);

    // Se a previsão está em andamento, vamos verificar o status
    if (prediction.status === "starting" || prediction.status === "processing") {
      console.log("Geração de vídeo iniciada, ID:", prediction.id);
      
      // Vamos retornar o ID para que o frontend possa verificar o status depois
      return new Response(
        JSON.stringify({ 
          status: prediction.status, 
          id: prediction.id,
          message: "Geração de vídeo iniciada"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Se já tiver um resultado disponível
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

    // Caso não tenha nem resultado nem seja processamento em andamento
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
