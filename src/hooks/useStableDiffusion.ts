
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fileToDataUri, resizeImageToNearestValidDimension } from "@/utils/imageUtils";
import type { StabilityRequestBody } from "@/components/creative-studio/stable-diffusion/sdConstants";

export const useStableDiffusion = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [lastError, setLastError] = useState<string | null>(null);
  
  // Progress simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isGenerating && generationProgress < 90) {
      interval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90));
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating, generationProgress]);

  const generateImage = async (
    prompt: string,
    engineId: string,
    imageFile: File | null = null,
    dimensions: string = "1024x1024",
    imageStrength?: number
  ) => {
    if (!prompt || prompt.trim() === "") {
      toast.error("Erro", {
        description: "Por favor, digite um prompt para gerar a imagem."
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);
    setGeneratedImage(null);
    setLastError(null);
    
    try {
      let requestBody: StabilityRequestBody = {
        prompt: prompt,
        engineId: engineId,
        dimensions: dimensions
      };
      
      // If image file exists, include it for img2img generation
      if (imageFile) {
        console.log("Processing image file for image-to-image generation");
        
        // Get the image data
        let imageData = await fileToDataUri(imageFile);
        
        // Resize image to ensure compatible dimensions
        if (engineId.includes("xl-1024") || engineId.includes("xl-beta")) {
          console.log("Resizing image for SDXL model");
          imageData = await resizeImageToNearestValidDimension(imageData, true); // true for SDXL
        } else {
          console.log("Resizing image for SD 1.6 model");
          imageData = await resizeImageToNearestValidDimension(imageData, false); // false for SD 1.6
        }
        
        // Add image data and strength to the request
        requestBody = { 
          ...requestBody, 
          initImage: imageData,
          // Use provided imageStrength or default to 0.35
          imageStrength: imageStrength !== undefined ? imageStrength : 0.35
        };
        
        console.log("Image-to-image request prepared with strength:", requestBody.imageStrength);
      }
      
      console.log("Sending generation request with prompt:", prompt, "and engineId:", engineId);
      
      // Call the Supabase Edge Function to generate the image
      const { data, error } = await supabase.functions.invoke("generate-with-stability", {
        body: requestBody
      });
      
      if (error) {
        console.error("Supabase Edge Function error:", error);
        throw new Error(error.message || "Erro ao chamar API");
      }
      
      if (data.errors) {
        // Handle error response from the Edge Function
        console.error("API errors:", data.errors);
        const errorMessage = Array.isArray(data.errors) ? data.errors.join(". ") : data.error || "Erro na API";
        throw new Error(errorMessage);
      }
      
      if (data.error) {
        console.error("API error:", data.error);
        throw new Error(data.error);
      }
      
      // Update the UI with the generated image
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Sucesso", {
          description: "Imagem gerada com sucesso!"
        });
      } else {
        throw new Error("Resposta inesperada da API");
      }
      
      setGenerationProgress(100);
    } catch (error) {
      console.error("Error generating image:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setLastError(errorMessage);
      
      // Handle 404 errors specifically (model not available)
      if (errorMessage.includes("não está disponível") || errorMessage.includes("not available")) {
        toast.error("Erro de modelo", {
          description: `O modelo selecionado não está disponível na sua conta Stability AI. Por favor, verifique seu acesso ou use um modelo diferente.`
        });
      } else {
        toast.error("Erro", {
          description: `Falha ao gerar imagem: ${errorMessage}`
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedImage,
    generationProgress,
    generateImage,
    setGenerationProgress,
    setGeneratedImage,
    lastError
  };
};
