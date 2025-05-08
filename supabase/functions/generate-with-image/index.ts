
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const REPLICATE_API_TOKEN = "r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE"
    const body = await req.json()

    // If it's a status check request
    if (body.predictionId) {
      console.log("Checking status for prediction:", body.predictionId)
      const response = await fetch(`https://api.replicate.com/v1/predictions/${body.predictionId}`, {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      })
      
      const prediction = await response.json()
      console.log("Status check response:", prediction)
      
      return new Response(JSON.stringify(prediction), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate required fields
    if (!body.image) {
      return new Response(
        JSON.stringify({ error: "Missing required field: image" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log("Generating image with reference image")
    
    // The image should be either a base64 data URI or a public URL that Replicate can access
    // We'll check what we've received and ensure it's in the right format
    const imageData = body.image;
    console.log("Image data format check:", imageData.substring(0, 30) + "...")
    
    // Build request body for Replicate API
    const replicateBody = {
      version: "15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d",
      input: {
        image: imageData,
        prompt: body.prompt || "Create a professional, high-quality, enhanced version of this image",
        num_inference_steps: 25
      }
    }

    console.log("Sending request to Replicate API")
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(replicateBody),
    })

    // Parse the response
    const prediction = await response.json()
    console.log("Initial prediction response:", prediction)
    
    if (prediction.error) {
      console.error("Error from Replicate API:", prediction.error)
      return new Response(
        JSON.stringify({ error: prediction.error }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Return the prediction ID for client-side polling
    return new Response(
      JSON.stringify({ 
        prediction: {
          id: prediction.id,
          status: prediction.status
        } 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error("Error in generate-with-image function:", error)
    return new Response(
      JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
