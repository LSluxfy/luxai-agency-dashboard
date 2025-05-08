
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

    const { id } = await req.json();
    console.log("Verificando status da tarefa:", id);

    if (!id) {
      throw new Error("ID da tarefa não fornecido.");
    }

    // Call Runway API to check task status with correct API version header
    const response = await fetch(`https://api.runwayml.com/v1/tasks/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": "2024-11-06"
      }
    });

    console.log("Status da verificação:", response.status);
    console.log("Response headers:", JSON.stringify([...response.headers.entries()]));

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro ao verificar status da tarefa:", response.status, errorText);
      throw new Error(`API Runway respondeu com status ${response.status}: ${errorText}`);
    }

    const taskStatus = await response.json();
    console.log("Detalhes da tarefa:", taskStatus);

    // Handle different status states and format response
    let output = null;
    let status = "processing";

    if (taskStatus.status === "COMPLETED" && taskStatus.output?.videoUrl) {
      output = taskStatus.output.videoUrl;
      status = "succeeded";
    } else if (taskStatus.status === "FAILED") {
      status = "failed";
    }

    return new Response(
      JSON.stringify({
        status,
        output,
        original: taskStatus
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Erro ao verificar o status:", error);
    return new Response(
      JSON.stringify({
        status: "error",
        message: error.message || "Erro desconhecido ao verificar o status"
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
