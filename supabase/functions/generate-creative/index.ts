
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, referenceImages } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Enhanced prompt that includes reference to the uploaded images
    let enhancedPrompt = prompt;
    if (referenceImages && referenceImages.length > 0) {
      enhancedPrompt += `\n\nContexto adicional: O usuário enviou ${referenceImages.length} imagem(ns) de referência que você deve considerar ao criar o anúncio. As imagens são importantes para o contexto da campanha.`;
      
      // Log for debugging
      console.log(`Generating creative with ${referenceImages.length} reference images`);
    }

    // 1. Generate campaign strategy and ad texts with GPT-4
    const contextPrompt = `Você é um especialista em tráfego pago. Crie uma estratégia de campanha para Facebook Ads com base neste comando e gere os textos (headline, descrição e CTA).
    
    Comando do usuário: ${enhancedPrompt}
    
    Responda em formato JSON com a seguinte estrutura:
    {
      "strategy": "estratégia detalhada em até 3 parágrafos",
      "headline": "título impactante para o anúncio em português",
      "description": "descrição persuasiva para o anúncio em português",
      "cta": "chamada para ação curta em português"
    }`;

    console.log("Requesting text generation from OpenAI...");
    
    const textResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using available model as specified in the docs
        messages: [{ role: "user", content: contextPrompt }],
        temperature: 0.7,
      }),
    });

    const textData = await textResponse.json();
    
    if (!textData.choices || textData.choices.length === 0) {
      console.error("OpenAI API error:", textData);
      return new Response(
        JSON.stringify({ error: "Failed to generate text content", details: textData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let textContent;
    try {
      // Extract the JSON from the response
      const contentText = textData.choices[0].message.content;
      textContent = JSON.parse(contentText);
    } catch (error) {
      console.error("Error parsing JSON from OpenAI response:", error);
      // If JSON parsing fails, use the raw text and structure it manually
      const rawContent = textData.choices[0].message.content;
      textContent = {
        strategy: rawContent.split("\n\n")[0] || "Estratégia personalizada baseada no seu briefing",
        headline: rawContent.split("\n\n")[1] || "Título gerado pela IA com base no seu briefing",
        description: rawContent.split("\n\n")[2] || "Descrição gerada pela IA que combina elementos do seu comando",
        cta: "COMPRAR AGORA"
      };
    }

    // 2. Generate creative image with DALL-E
    console.log("Requesting image generation from DALL-E...");
    
    // Enhanced image prompt that includes reference to uploaded images if available
    let imagePrompt = `Create a high-quality Facebook advertisement image based on this brief: ${prompt}.`;
    if (referenceImages && referenceImages.length > 0) {
      imagePrompt += ` Use the uploaded reference images as inspiration for style and content. The image should be professional, eye-catching, and suitable for a marketing campaign.`;
    } else {
      imagePrompt += ` The image should be professional, eye-catching, and suitable for a marketing campaign.`;
    }
    
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    const imageData = await imageResponse.json();
    
    if (!imageData.data || imageData.data.length === 0) {
      console.error("DALL-E API error:", imageData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate image", 
          details: imageData,
          textContent: textContent // Return the text content even if image generation fails
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Combine results and return
    const result = {
      strategy: textContent.strategy,
      headline: textContent.headline,
      description: textContent.description,
      cta: textContent.cta,
      imageUrl: imageData.data[0].url,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in generate-creative function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
