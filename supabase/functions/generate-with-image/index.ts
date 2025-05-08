
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
    
    // Use a different model that's publicly available for image-to-image generation
    // Build request body for Replicate API
    const replicateBody = {
      version: "565a2caa080cd9e2c2fb89062ac8e22a276a4a502af8a5a1fe722b9f94feb67b", // stable-diffusion-img2img model
      input: {
        image: imageData,
        prompt: body.prompt || "Create a professional, high-quality, enhanced version of this image",
        num_inference_steps: 30,
        guidance_scale: 7.5
      }
    }

    // Call Replicate API to start the generation
    console.log("Sending request to Replicate API using model:", replicateBody.version)
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(replicateBody),
    })

    const prediction = await response.json()
    console.log("Generation started response:", prediction)

    if (prediction.error) {
      return new Response(
        JSON.stringify({ error: prediction.error }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    return new Response(
      JSON.stringify({ prediction }), {
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
