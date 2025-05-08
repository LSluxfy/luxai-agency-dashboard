
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
    const { id } = await req.json();
    console.log("Verificando status do vídeo com ID:", id);

    if (!id) {
      throw new Error("ID da previsão não fornecido");
    }

    const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao verificar status:", response.status, errorText);
      throw new Error(`API respondeu com status ${response.status}: ${errorText}`);
    }

    const prediction = await response.json();
    console.log("Status atual da geração:", prediction.status);

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

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
