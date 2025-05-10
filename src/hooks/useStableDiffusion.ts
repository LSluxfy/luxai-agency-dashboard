
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { fileToDataUri, resizeImageToNearestValidDimension } from "@/utils/imageUtils";
import type { StabilityRequestBody } from "@/components/creative-studio/stable-diffusion/sdConstants";

export const useStableDiffusion = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  
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
    dimensions: string = "1024x1024"
  ) => {
    if (!prompt || prompt.trim() === "") {
      toast({
        title: "Erro",
        description: "Por favor, digite um prompt para gerar a imagem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);
    setGeneratedImage(null);
    
    try {
      let requestBody: StabilityRequestBody = {
        prompt: prompt,
        engineId: engineId,
        dimensions: dimensions
      };
      
      // If image file exists, include it for img2img generation
      if (imageFile) {
        let imageData = await fileToDataUri(imageFile);
        
        // Resize image if using SDXL model to ensure compatible dimensions
        if (engineId.includes("xl-1024")) {
          imageData = await resizeImageToNearestValidDimension(imageData, true); // true for SDXL
        } else {
          imageData = await resizeImageToNearestValidDimension(imageData, false); // false for SD 1.6
        }
        
        requestBody = { 
          ...requestBody, 
          initImage: imageData,
          imageStrength: 0.35 // Default image strength
        };
      }
      
      // Call the Supabase Edge Function to generate the image
      const { data, error } = await supabase.functions.invoke("generate-with-stability", {
        body: requestBody
      });
      
      if (error) {
        throw new Error(error.message || "Erro ao chamar API");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update the UI with the generated image
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Sucesso",
          description: "Imagem gerada com sucesso!",
        });
      } else {
        throw new Error("Resposta inesperada da API");
      }
      
      setGenerationProgress(100);
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro",
        description: `Falha ao gerar imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
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
  };
};
