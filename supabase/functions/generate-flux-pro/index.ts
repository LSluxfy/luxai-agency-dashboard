
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { prompt, referenceImage } = await req.json()
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Missing required field: prompt" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const REPLICATE_API_TOKEN = "r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE"
    
    console.log("Generating image with Flux Pro model")
    console.log("Prompt:", prompt)
    console.log("Reference image?", referenceImage ? "Yes" : "No")
    
    // Prepare request body
    const requestBody = {
      input: {
        width: 1024,
        height: 1024,
        prompt: prompt
      }
    }
    
    // Add reference image if provided
    if (referenceImage) {
      requestBody.input.image = referenceImage
    }
    
    // Call the Replicate API
    const replicateResponse = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-pro/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify(requestBody)
    })

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text()
      console.error(`API Error (Status ${replicateResponse.status}):`, errorText)
      return new Response(
        JSON.stringify({ error: `API Error: ${replicateResponse.statusText}`, details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: replicateResponse.status }
      )
    }

    const result = await replicateResponse.json()
    console.log("Generation successful, received output")
    
    return new Response(
      JSON.stringify({ image: result.output }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error("Error in generate-flux-pro function:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
