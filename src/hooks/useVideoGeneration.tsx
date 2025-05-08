
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VideoGenerationResult {
  loading: boolean;
  videoUrl: string | null;
  error: string | null;
  predictionId: string | null;
  progress: number;
  handleGenerateVideo: (imageSource: string) => Promise<void>;
}

export const useVideoGeneration = (): VideoGenerationResult => {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);
  const [checkCount, setCheckCount] = useState<number>(0);
  
  // Clean up interval when component unmounts
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);
  
  // Manage status checking when we have a prediction ID
  useEffect(() => {
    if (!predictionId) return;
    
    const maxChecks = 60; // Maximum of 3 minutes (3s * 60)
    
    // Start checking every 3 seconds
    const interval = window.setInterval(async () => {
      // Increment the counter
      setCheckCount(prev => {
        const newCount = prev + 1;
        
        // Update progress (0-95%)
        const newProgress = Math.min(5 + (newCount * 90 / maxChecks), 95);
        setProgress(newProgress);
        
        // If reached maximum number of checks, stop
        if (newCount >= maxChecks) {
          clearInterval(interval);
          setStatusCheckInterval(null);
          setError("Tempo limite excedido para gerar o vídeo.");
          toast.error("Tempo limite excedido. Por favor, tente novamente.");
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
        }
        
        return newCount;
      });
      
      try {
        // Check video generation status
        console.log(`Verificando status do vídeo (tentativa ${checkCount + 1})...`);
        
        const { data, error } = await supabase.functions.invoke("check-video-status", {
          body: { id: predictionId }
        });
        
        if (error) {
          console.error("Erro ao verificar status:", error);
          throw new Error(error.message || "Erro ao verificar status");
        }
        
        console.log("Resposta da verificação de status:", data);
        
        if (data.status === "succeeded") {
          // Video generated successfully
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setProgress(100);
          setLoading(false);
          
          const output = data.output;
          if (output && typeof output === "string") {
            setVideoUrl(output);
            toast.success("Vídeo gerado com sucesso!");
          } else {
            throw new Error("Formato de output inválido: " + JSON.stringify(output));
          }
        } else if (data.status === "failed") {
          // Generation failed
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
          const errorMsg = data.message || "Falha na geração do vídeo";
          setError(`Falha na geração: ${errorMsg}`);
          toast.error(`Falha na geração: ${errorMsg}`);
        }
      } catch (err: any) {
        console.error("Erro ao verificar o status:", err);
        // Only show error if it's the last attempt or a critical error
        if (checkCount >= maxChecks - 1) {
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
          setError("Erro ao verificar o status da geração do vídeo: " + err.message);
          toast.error("Erro ao verificar o status. Por favor, tente novamente.");
        }
      }
    }, 3000);
    
    setStatusCheckInterval(interval);
    
    // Clean up interval when component unmounts
    return () => clearInterval(interval);
  }, [predictionId, checkCount]);
  
  const handleGenerateVideo = async (imageSource: string) => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setPredictionId(null);
    setProgress(5); // Start with 5% for visual feedback
    setCheckCount(0);
    toast.info("Iniciando geração de vídeo com IA...");

    try {
      console.log("Enviando requisição para gerar vídeo com a imagem:", imageSource.substring(0, 30) + "...");
      
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { imageUrl: imageSource }
      });
      
      if (error) {
        console.error("Erro da função de borda:", error);
        throw new Error(error.message || "Erro ao iniciar a geração do vídeo");
      }
      
      console.log("Resposta da função generate-video:", data);
      
      if (data.id) {
        // We have a prediction ID to track
        setPredictionId(data.id);
        toast.info("Geração de vídeo iniciada, por favor aguarde...");
      } else if (data.output) {
        // Result immediately available (unlikely, but possible)
        setProgress(100);
        setLoading(false);
        
        const output = data.output;
        if (typeof output === "string") {
          setVideoUrl(output);
          toast.success("Vídeo gerado com sucesso!");
        } else if (Array.isArray(output) && output.length > 0) {
          setVideoUrl(output[0]);
          toast.success("Vídeo gerado com sucesso!");
        } else {
          throw new Error("Formato de output inválido: " + JSON.stringify(output));
        }
      } else {
        // Unexpected response
        throw new Error("Resposta inesperada da API: " + JSON.stringify(data));
      }
    } catch (err: any) {
      console.error("Erro ao gerar vídeo:", err);
      const errorMessage = err.message || "Erro desconhecido ao gerar o vídeo";
      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      toast.error(`Erro ao gerar o vídeo: ${errorMessage}`);
    }
  };

  return {
    loading,
    videoUrl,
    error,
    predictionId,
    progress,
    handleGenerateVideo
  };
};
