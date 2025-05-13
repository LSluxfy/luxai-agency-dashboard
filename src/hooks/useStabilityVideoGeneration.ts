
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
  const [engineId, setEngineId] = useState<string>("stable-video-diffusion");
  // Define polling related state variables with correct types
  const [pollingTimeout, setPollingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [pollingCount, setPollingCount] = useState<number>(0);

  const generateVideo = async (options: VideoGenerationOptions) => {
    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setGenerationProgress(10);
    
    // Store the engine ID for later use
    setEngineId(options.engineId || "stable-video-diffusion");

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

      console.log(`Iniciando geração de vídeo com Stability API (Engine: ${options.engineId || "stable-video-diffusion"})`);
      console.log(`Opções: motion=${options.motionBucketId}, steps=${options.steps}, tamanho=${options.width}x${options.height}`);
      
      // Call the Supabase Edge Function to initiate video generation
      const { data, error: initError } = await supabase.functions.invoke("generate-stability-video", {
        body: {
          image: imageData,
          motionBucketId: options.motionBucketId || 127,
          prompt: options.prompt || "",
          engineId: options.engineId || "stable-video-diffusion",
          width: options.width || 1024,
          height: options.height || 1024,
          steps: options.steps || 30
        }
      });

      if (initError) {
        console.error("Erro ao invocar a função generate-stability-video:", initError);
        throw new Error(`Erro ao iniciar geração: ${initError.message}`);
      }

      if (!data) {
        console.error("Resposta da função sem dados");
        throw new Error("Não foi possível iniciar a geração de vídeo: resposta vazia");
      }

      console.log("Resposta da API:", data);

      if (data.error) {
        console.error("Erro retornado pela API:", data.error);
        
        // Mensagens de erro mais amigáveis baseadas no tipo de erro
        let errorMessage = data.error;
        if (data.error.includes("not found") || data.error.includes("404")) {
          errorMessage = "O modelo de vídeo (SVD) não foi encontrado. Verifique se ele está habilitado na sua conta Stability AI.";
        } else if (data.error.includes("402") || data.error.includes("payment")) {
          errorMessage = "Sua conta não possui créditos suficientes para gerar vídeos com o SVD. Adicione créditos na sua conta Stability AI.";
        } else if (data.error.includes("401") || data.error.includes("Unauthorized")) {
          errorMessage = "Chave de API inválida ou expirada. Verifique suas credenciais da Stability AI.";
        }
        
        throw new Error(errorMessage);
      }

      if (!data.id) {
        console.error("Resposta da função sem ID:", data);
        throw new Error("Não foi possível iniciar a geração de vídeo: ID não recebido");
      }

      console.log("Geração iniciada com ID:", data.id);
      setPredictionId(data.id);
      setGenerationProgress(20);
      toast.success("Geração de vídeo iniciada com sucesso!", {
        description: "Aguardando processamento. Isso pode levar até 1 minuto."
      });

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
              engineId: options.engineId || "stable-video-diffusion"
            }
          });

          if (statusError) {
            console.error("Erro ao verificar status:", statusError);
            throw new Error(`Erro ao verificar status: ${statusError.message}`);
          }

          if (!statusData) {
            console.error("Resposta vazia ao verificar status");
            throw new Error("Resposta vazia ao verificar status");
          }

          console.log("Resposta de status:", statusData);
          
          if (statusData.error) {
            throw new Error(`Falha na geração: ${statusData.error}`);
          }
          
          if (statusData.status === "succeeded") {
            // Success! We have our video
            if (pollingTimeout !== null) {
              clearTimeout(pollingTimeout);
              setPollingTimeout(null);
            }
            setPollingCount(0);
            setGenerationProgress(100);

            // Store video URL
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
              const timeout = setTimeout(checkStatus, 5000); // Verificar a cada 5 segundos
              setPollingTimeout(timeout);
              setPollingCount(attempts);
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          } else {
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 85);
            setGenerationProgress(progressValue);
            setPollingCount(attempts);
            
            if (attempts < maxAttempts) {
              const timeout = setTimeout(checkStatus, 5000);
              setPollingTimeout(timeout);
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          }
        } catch (err: any) {
          console.error("Erro ao verificar status:", err);
          setError(err.message || "Erro ao verificar status da geração");
          setIsGenerating(false);
          toast.error("Erro na geração do vídeo", {
            description: err.message || "Erro desconhecido"
          });
          
          // Clear any existing timeout
          if (pollingTimeout !== null) {
            clearTimeout(pollingTimeout);
            setPollingTimeout(null);
          }
        }
      };

      // Start polling
      const initialTimeout = setTimeout(checkStatus, 5000); // Primeira verificação após 5 segundos
      setPollingTimeout(initialTimeout);

    } catch (err: any) {
      console.error("Erro ao gerar vídeo:", err);
      
      // Handle 404 error specially for better user experience
      let errorMessage = err.message || "Erro ao gerar vídeo";
      if (errorMessage.includes("404") || errorMessage.includes("not found") || errorMessage.includes("não foi encontrado")) {
        errorMessage = "O modelo de vídeo não foi encontrado. Verifique se o modelo está habilitado na sua conta Stability AI.";
      } else if (errorMessage.includes("Edge Function returned a non-2xx status code")) {
        errorMessage = "Houve um problema na comunicação com a API Stability. Verifique sua chave de API e se o modelo SVD está disponível na sua conta.";
      }
      
      setError(errorMessage);
      setIsGenerating(false);
      setGenerationProgress(0);
      toast.error("Erro ao iniciar a geração de vídeo", {
        description: errorMessage
      });
      
      // Clear any existing timeout
      if (pollingTimeout !== null) {
        clearTimeout(pollingTimeout);
        setPollingTimeout(null);
      }
    }
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
    engineId,
    pollingCount
  };
};
