

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
    
    // Using the model version you suggested
    // Build request body for Replicate API
    const replicateBody = {
      version: "15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6feb1d66087d",
      input: {
        image: imageData,
        prompt: body.prompt || "Create a professional, high-quality, enhanced version of this image",
        num_inference_steps: 25
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

    // Parse the initial response
    let prediction = await response.json()
    console.log("Initial response from Replicate:", prediction)
    
    if (prediction.error) {
      return new Response(
        JSON.stringify({ error: prediction.error }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Poll for the result if the prediction is not complete
    const maxAttempts = 30;
    let attempts = 0;
    
    while (prediction.status !== "succeeded" && prediction.status !== "failed" && attempts < maxAttempts) {
      console.log(`Polling attempt ${attempts + 1}, status: ${prediction.status}`);
      
      // Wait 2 seconds between polling attempts
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Poll for the result
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      
      prediction = await pollResponse.json();
      attempts++;
    }
    
    console.log("Final prediction status:", prediction.status);
    
    if (prediction.status === "succeeded") {
      console.log("Generated image URL:", prediction.output);
      return new Response(
        JSON.stringify({ 
          status: "succeeded",
          output: prediction.output 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      console.error("Image generation failed or timed out:", prediction);
      return new Response(
        JSON.stringify({ 
          error: "Image generation failed or timed out", 
          details: prediction 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
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

