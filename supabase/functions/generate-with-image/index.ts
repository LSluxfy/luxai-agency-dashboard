
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
      
      // Add more detailed logging to debug response issues
      console.log("Sending status check request to Replicate API")
      const response = await fetch(`https://api.replicate.com/v1/predictions/${body.predictionId}`, {
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
    
    // For direct text-to-image generation with SDXL
    if (body.directGeneration && body.prompt) {
      console.log("Generating image directly with SDXL model")
      
      const sdxlResponse = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc", // SDXL model
          input: {
            width: 768,
            height: 768,
            prompt: body.prompt,
            refine: "expert_ensemble_refiner",
            apply_watermark: false,
            num_inference_steps: 25,
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

    // Continue with image-to-image generation (Realistic Vision v3)
    // Validate required fields
    if (!body.image) {
      return new Response(
        JSON.stringify({ error: "Missing required field: image" }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // The Realistic Vision v3 model
    const modelVersion = "6eb633a82ab3e7a4417d0af2e84e24b4b419c76f86f6e837824d02ae6845dc81"
    
    console.log(`Generating image with Realistic Vision v3 model`)
    
    // The image should be either a base64 data URI or a public URL that Replicate can access
    const imageData = body.image;
    console.log("Image data format check:", imageData.substring(0, 30) + "...")
    
    // Random seed if not provided
    const seed = body.seed || Math.floor(Math.random() * 1000000);
    console.log("Using seed:", seed);
    
    // Build request body for Realistic Vision v3 model
    const replicateBody = {
      version: modelVersion,
      input: {
        image: imageData,
        prompt: body.prompt || "Foto profissional do produto em fundo branco, luz natural, alta qualidade, 4K",
        seed: seed,
        strength: body.strength || 0.21, // Lower strength to preserve more of original image
        negative_prompt: "blurry, low quality, distorted"
      }
    }

    console.log("Sending request to Replicate API with model:", modelVersion)
    console.log("Request parameters:", JSON.stringify({
      version: replicateBody.version,
      input: {
        ...replicateBody.input,
        image: replicateBody.input.image.substring(0, 30) + "..." // Truncate the image data for logging
      }
    }))
    
    const response = await fetch("https://api.replicate.com/v1/predictions", {
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
