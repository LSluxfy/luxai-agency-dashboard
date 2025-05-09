
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Configuration constants
const REPLICATE_API_TOKEN = "r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE"
const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions"
const SDXL_MODEL_VERSION = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
const REALISTIC_VISION_MODEL_VERSION = "6eb633a82ab3e7a4417d0af2e84e24b4b419c76f86f6e837824d02ae6845dc81"

/**
 * Handles checking the status of an existing prediction
 */
async function handleStatusCheck(predictionId: string) {
  console.log("Checking status for prediction:", predictionId)
      
  console.log("Sending status check request to Replicate API")
  const response = await fetch(`${REPLICATE_API_URL}/${predictionId}`, {
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  })
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (Status ${response.status}):`, errorText);
    return new Response(
      JSON.stringify({ error: `API Error: ${response.statusText}`, details: errorText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
    );
  }
  
  const prediction = await response.json()
  console.log("Status check complete response:", JSON.stringify(prediction));
  
  // More detailed logging of the output field
  if (prediction.output) {
    console.log("Output received:", typeof prediction.output, Array.isArray(prediction.output));
    if (Array.isArray(prediction.output)) {
      console.log("Output array length:", prediction.output.length);
      console.log("First output item:", prediction.output[0]);
    }
  }
  
  return new Response(JSON.stringify(prediction), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Handles direct text-to-image generation using SDXL model
 */
async function handleSdxlGeneration(prompt: string) {
  console.log("Generating image directly with SDXL model")
  
  const sdxlResponse = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: SDXL_MODEL_VERSION,
      input: {
        width: 1024,
        height: 1024,
        prompt: prompt,
        refine: "expert_ensemble_refiner",
        scheduler: "K_EULER",
        lora_scale: 0.6,
        num_outputs: 1,
        guidance_scale: 7.5,
        apply_watermark: false,
        high_noise_frac: 0.8,
        negative_prompt: "blurry, bad quality, distorted image, disfigured, low resolution",
        prompt_strength: 0.8,
        num_inference_steps: 30,
      },
    }),
  });

  if (!sdxlResponse.ok) {
    const errorText = await sdxlResponse.text();
    console.error(`API Error (Status ${sdxlResponse.status}):`, errorText);
    return new Response(
      JSON.stringify({ error: `API Error: ${sdxlResponse.statusText}`, details: errorText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: sdxlResponse.status }
    );
  }
  
  const prediction = await sdxlResponse.json();
  console.log("SDXL generation response:", JSON.stringify(prediction));
  
  return new Response(JSON.stringify({ prediction }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Handles image-to-image transformation using Realistic Vision model
 */
async function handleRealisticVision(imageData: string, prompt: string, strength: number, seed?: number) {
  // Random seed if not provided
  const actualSeed = seed || Math.floor(Math.random() * 1000000);
  console.log("Using seed:", actualSeed);
  
  // Build request body for Realistic Vision model
  const replicateBody = {
    version: REALISTIC_VISION_MODEL_VERSION,
    input: {
      image: imageData,
      prompt: prompt || "Foto profissional do produto em fundo branco, luz natural, alta qualidade, 4K",
      seed: actualSeed,
      strength: strength || 0.21, // Default strength from the request
      negative_prompt: "blurry, low quality, distorted"
    }
  }

  console.log("Sending request to Replicate API with model:", REALISTIC_VISION_MODEL_VERSION)
  console.log("Request parameters:", JSON.stringify({
    version: replicateBody.version,
    input: {
      ...replicateBody.input,
      image: replicateBody.input.image.substring(0, 30) + "..." // Truncate the image data for logging
    }
  }))
  
  const response = await fetch(REPLICATE_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(replicateBody),
  })

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`API Error (Status ${response.status}):`, errorText);
    return new Response(
      JSON.stringify({ error: `API Error: ${response.statusText}`, details: errorText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
    );
  }

  // Parse the response
  const prediction = await response.json()
  console.log("Initial prediction response:", JSON.stringify(prediction))
  
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
        status: prediction.status,
        model: "realistic-vision"
      } 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
}

/**
 * Main request handler function
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()

    // If it's a status check request
    if (body.predictionId) {
      return await handleStatusCheck(body.predictionId)
    }
    
    // For direct text-to-image generation with SDXL
    if (body.directGeneration && body.prompt) {
      return await handleSdxlGeneration(body.prompt)
    }

    // Continue with image-to-image generation (Realistic Vision)
    // Validate required fields
    if (!body.image) {
      return new Response(
        JSON.stringify({ error: "Missing required field: image" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // The image should be either a base64 data URI or a public URL that Replicate can access
    const imageData = body.image;
    console.log("Image data format check:", imageData.substring(0, 30) + "...")
    
    return await handleRealisticVision(
      imageData, 
      body.prompt, 
      body.strength, 
      body.seed
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
