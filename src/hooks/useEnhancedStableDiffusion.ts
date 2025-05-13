
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fileToDataUri, resizeImageToNearestValidDimension } from "@/utils/imageUtils";

export const useEnhancedStableDiffusion = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  // Progress simulation
  const simulateProgress = () => {
    setGenerationProgress(10);
    let progress = 10;
    const interval = setInterval(() => {
      progress += 5;
      setGenerationProgress(Math.min(progress, 90));
      if (progress >= 90) {
        clearInterval(interval);
      }
    }, 1000);
    return interval;
  };

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
    if (!prompt && mode !== "upscale") {
      toast.error("Erro", {
        description: "Por favor, digite um prompt para gerar a imagem."
      });
      return;
    }
    
    // Validation for specific modes
    if (mode === "upscale" && !imageFile) {
      toast.error("Erro", {
        description: "Por favor, selecione uma imagem para melhorar a resolução."
      });
      return;
    }
    
    if (mode === "edit" && (!imageFile || !maskImage)) {
      toast.error("Erro", {
        description: "Para edição com máscara, é necessário uma imagem e uma máscara."
      });
      return;
    }
    
    if (mode === "control" && !controlImage) {
      toast.error("Erro", {
        description: "Para usar o Control Net, é necessário uma imagem de controle."
      });
      return;
    }

    setIsGenerating(true);
    const progressInterval = simulateProgress();
    setGeneratedImage(null);
    
    try {
      console.log(`Starting ${mode} operation with engine: ${engineId}, dimensions: ${dimensions}`);
      
      // Prepare request body
      const requestBody: any = {
        prompt,
        engineId,
        dimensions,
        mode
      };
      
      // Process files if provided
      if (imageFile) {
        let imageData = await fileToDataUri(imageFile);
        
        // Only resize for generate and img2img modes
        if (mode === "generate" || mode === "edit") {
          const isSDXL = engineId.includes("xl-1024");
          imageData = await resizeImageToNearestValidDimension(imageData, isSDXL);
        }
        
        requestBody.initImage = imageData;
        
        if (imageStrength !== undefined) {
          requestBody.imageStrength = imageStrength;
        }
      }
      
      // Add mask image if provided
      if (maskImage && mode === "edit") {
        const maskData = await fileToDataUri(maskImage);
        requestBody.maskImage = maskData;
      }
      
      // Add control image if provided
      if (controlImage && mode === "control") {
        const controlData = await fileToDataUri(controlImage);
        requestBody.controlImage = controlData;
        requestBody.controlMode = controlMode || "canny";
      }
      
      console.log("Sending request to generate-with-stability function");
      
      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("generate-with-stability", {
        body: requestBody
      });
      
      clearInterval(progressInterval);
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Erro ao chamar função Edge");
      }
      
      if (data.errors || data.id) {
        // Structured error response from our Edge Function
        console.error("API errors:", data.errors || data);
        
        let errorMessage = "Erro na API";
        
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMessage = data.errors.join(". ");
        } else if (typeof data.errors === 'string') {
          errorMessage = data.errors;
        } else if (data.name) {
          errorMessage = `${data.name}: ${Array.isArray(data.errors) ? data.errors.join(". ") : "Erro desconhecido"}`;
        }
        
        throw new Error(errorMessage);
      }
      
      if (data.error) {
        console.error("General error:", data.error);
        throw new Error(data.error);
      }
      
      // Update UI with generated image
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success("Sucesso", {
          description: `Imagem ${mode === "upscale" ? "ampliada" : "gerada"} com sucesso!`
        });
        setGenerationProgress(100);
      } else {
        throw new Error("Não foi possível gerar a imagem");
      }
      
    } catch (error) {
      console.error("Error in generateImage:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes("não está disponível") || 
          errorMessage.toLowerCase().includes("not available") ||
          errorMessage.toLowerCase().includes("engine_not_found")) {
        toast.error("Erro de modelo", {
          description: "O modelo selecionado não está disponível na sua conta Stability AI. Verifique se você tem acesso a este modelo ou use outro modelo."
        });
      } else {
        toast.error("Erro", {
          description: `Falha ao ${mode === "upscale" ? "ampliar" : "gerar"} imagem: ${errorMessage}`
        });
      }
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedImage,
    generationProgress,
    generateImage,
    setGeneratedImage
  };
};
