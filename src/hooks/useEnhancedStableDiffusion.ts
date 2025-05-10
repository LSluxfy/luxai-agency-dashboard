
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { fileToDataUri, resizeImageToNearestValidDimension } from "@/utils/imageUtils";
import type { StabilityRequestBody } from "@/components/creative-studio/stable-diffusion/sdConstants";

export const useEnhancedStableDiffusion = () => {
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
    dimensions: string = "1024x1024",
    mode: string = "generate",
    imageStrength?: number,
    maskImage: File | null = null,
    controlImage: File | null = null,
    controlMode?: string
  ) => {
    if (mode !== "upscale" && (!prompt || prompt.trim() === "")) {
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
        dimensions: dimensions,
        mode: mode
      };
      
      // Process image files based on mode
      if (mode === "generate" && imageFile) {
        // Regular image-to-image generation
        let imageData = await fileToDataUri(imageFile);
        
        if (engineId.includes("xl-1024")) {
          imageData = await resizeImageToNearestValidDimension(imageData, true);
        } else {
          imageData = await resizeImageToNearestValidDimension(imageData, false);
        }
        
        requestBody = { 
          ...requestBody, 
          initImage: imageData,
          imageStrength: imageStrength !== undefined ? imageStrength : 0.35
        };
      } 
      else if (mode === "upscale" && imageFile) {
        // Upscaling mode
        let imageData = await fileToDataUri(imageFile);
        requestBody = { 
          ...requestBody, 
          initImage: imageData
        };
      }
      else if (mode === "edit" && imageFile && maskImage) {
        // Edit mode with mask
        let imageData = await fileToDataUri(imageFile);
        let maskData = await fileToDataUri(maskImage);
        
        if (engineId.includes("xl-1024")) {
          imageData = await resizeImageToNearestValidDimension(imageData, true);
          maskData = await resizeImageToNearestValidDimension(maskData, true);
        } else {
          imageData = await resizeImageToNearestValidDimension(imageData, false);
          maskData = await resizeImageToNearestValidDimension(maskData, false);
        }
        
        requestBody = { 
          ...requestBody, 
          initImage: imageData,
          maskImage: maskData,
          imageStrength: imageStrength !== undefined ? imageStrength : 0.7
        };
      }
      else if (mode === "control" && controlImage) {
        // Control mode
        let imageData = await fileToDataUri(controlImage);
        
        if (engineId.includes("xl-1024")) {
          imageData = await resizeImageToNearestValidDimension(imageData, true);
        } else {
          imageData = await resizeImageToNearestValidDimension(imageData, false);
        }
        
        requestBody = { 
          ...requestBody, 
          controlImage: imageData,
          controlMode: controlMode || "canny"
        };
      }
      
      console.log(`Sending ${mode} request with prompt:`, prompt, "and engineId:", engineId);
      
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
          description: `Imagem ${mode === "upscale" ? "melhorada" : "gerada"} com sucesso!`,
        });
      } else {
        throw new Error("Resposta inesperada da API");
      }
      
      setGenerationProgress(100);
    } catch (error) {
      console.error(`Error in ${mode} operation:`, error);
      toast({
        title: "Erro",
        description: `Falha ao ${
          mode === "upscale" ? "melhorar" : 
          mode === "edit" ? "editar" : 
          mode === "control" ? "controlar" : "gerar"
        } imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
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
