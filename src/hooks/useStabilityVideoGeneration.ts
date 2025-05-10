
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface VideoGenerationOptions {
  imageSource: File | string;
  motionBucketId?: number;
  prompt?: string;
}

export const useStabilityVideoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);

  const generateVideo = async (options: VideoGenerationOptions) => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setGenerationProgress(10);

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

      // Call the Supabase Edge Function to initiate video generation
      const { data, error: initError } = await supabase.functions.invoke("generate-stability-video", {
        body: {
          image: imageData,
          motionBucketId: options.motionBucketId || 127,
          prompt: options.prompt || ""
        }
      });

      if (initError) {
        throw new Error(`Erro ao iniciar geração: ${initError.message}`);
      }

      if (!data?.id) {
        throw new Error("Não foi possível iniciar a geração de vídeo");
      }

      setPredictionId(data.id);
      setGenerationProgress(20);

      // Start polling for results
      let attempts = 0;
      const maxAttempts = 60; // 5 minutes with 5 second intervals
      
      const checkStatus = async () => {
        attempts++;
        
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke("check-stability-video", {
            body: {
              id: data.id
            }
          });

          if (statusError) {
            throw new Error(`Erro ao verificar status: ${statusError.message}`);
          }

          if (statusData.status === "succeeded") {
            setProgress(100);
            setVideoUrl(statusData.videoUrl);
            setIsGenerating(false);
            toast({
              title: "Sucesso",
              description: "Vídeo gerado com sucesso!",
            });
            return;
          } else if (statusData.status === "failed") {
            throw new Error(`Falha na geração: ${statusData.error || "Erro desconhecido"}`);
          } else if (statusData.status === "processing") {
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 90);
            setProgress(progressValue);
            
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 5000); // Poll every 5 seconds
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          } else {
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 85);
            setProgress(progressValue);
            
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 5000);
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          }
        } catch (err: any) {
          setError(err.message || "Erro ao verificar status da geração");
          setIsGenerating(false);
          toast({
            title: "Erro",
            description: "Erro na geração do vídeo",
            variant: "destructive",
          });
        }
      };

      // Start polling
      setTimeout(checkStatus, 5000); // First check after 5 seconds

    } catch (err: any) {
      setError(err.message || "Erro ao gerar vídeo");
      setIsGenerating(false);
      setGenerationProgress(0);
      toast({
        title: "Erro",
        description: "Erro ao iniciar a geração de vídeo",
        variant: "destructive",
      });
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
    predictionId
  };
};
