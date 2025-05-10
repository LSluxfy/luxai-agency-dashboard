
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoGenerationOptions {
  imageSource: File | string;
  motionBucketId?: number;
  prompt?: string;
  engineId?: string;
  width?: number;
  height?: number;
  steps?: number;
}

export const useStabilityVideoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [engineId, setEngineId] = useState<string>("stable-diffusion-xl-1024-v1-0");

  const generateVideo = async (options: VideoGenerationOptions) => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setGenerationProgress(10);
    
    // Store the engine ID for later use
    setEngineId(options.engineId || "stable-diffusion-xl-1024-v1-0");

    try {
      // Prepare image data - either from file or url
      let imageData: string;

      if (typeof options.imageSource === 'string') {
        // It's a URL
        imageData = options.imageSource;
      } else {
        // It's a File, convert to data URI
        imageData = await fileToDataUri(options.imageSource);
      }

      console.log(`Iniciando geração de vídeo com Stability API (Engine: ${options.engineId || "stable-diffusion-xl-1024-v1-0"})`);
      
      // Call the Supabase Edge Function to initiate video generation
      const { data, error: initError } = await supabase.functions.invoke("generate-stability-video", {
        body: {
          image: imageData,
          motionBucketId: options.motionBucketId || 127,
          prompt: options.prompt || "",
          engineId: options.engineId || "stable-diffusion-xl-1024-v1-0",
          width: options.width || 1024,
          height: options.height || 1024,
          steps: options.steps || 30
        }
      });

      if (initError) {
        console.error("Erro ao invocar a função generate-stability-video:", initError);
        throw new Error(`Erro ao iniciar geração: ${initError.message}`);
      }

      if (!data?.id) {
        console.error("Resposta da função sem ID:", data);
        throw new Error("Não foi possível iniciar a geração de vídeo");
      }

      console.log("Geração iniciada com ID:", data.id);
      setPredictionId(data.id);
      setGenerationProgress(20);

      // Start polling for results
      let attempts = 0;
      const maxAttempts = 60; // 5 minutos com intervalos de 5 segundos
      
      const checkStatus = async () => {
        attempts++;
        
        try {
          console.log(`Verificando status da geração (tentativa ${attempts}/${maxAttempts})`);
          
          const { data: statusData, error: statusError } = await supabase.functions.invoke("check-stability-video", {
            body: {
              id: data.id,
              engineId: options.engineId || "stable-diffusion-xl-1024-v1-0"
            }
          });

          if (statusError) {
            console.error("Erro ao verificar status:", statusError);
            throw new Error(`Erro ao verificar status: ${statusError.message}`);
          }

          console.log("Resposta de status:", statusData);
          
          if (statusData.status === "succeeded") {
            setGenerationProgress(100);
            setVideoUrl(statusData.videoUrl);
            setIsGenerating(false);
            toast.success("Vídeo gerado com sucesso!");
            return;
          } else if (statusData.status === "failed") {
            throw new Error(`Falha na geração: ${statusData.error || "Erro desconhecido"}`);
          } else if (statusData.status === "processing") {
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 90);
            setGenerationProgress(progressValue);
            
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 5000); // Verificar a cada 5 segundos
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          } else {
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 85);
            setGenerationProgress(progressValue);
            
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 5000);
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          }
        } catch (err: any) {
          console.error("Erro ao verificar status:", err);
          setError(err.message || "Erro ao verificar status da geração");
          setIsGenerating(false);
          toast.error("Erro na geração do vídeo");
        }
      };

      // Start polling
      setTimeout(checkStatus, 5000); // Primeira verificação após 5 segundos

    } catch (err: any) {
      console.error("Erro ao gerar vídeo:", err);
      setError(err.message || "Erro ao gerar vídeo");
      setIsGenerating(false);
      setGenerationProgress(0);
      toast.error("Erro ao iniciar a geração de vídeo");
    }
  };

  const setProgress = (progress: number) => {
    setGenerationProgress(progress);
  };

  // Helper function to convert File to data URI
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to Data URI'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsDataURL(file);
    });
  };

  return {
    generateVideo,
    videoUrl,
    isGenerating,
    generationProgress,
    error,
    predictionId,
    engineId
  };
};
