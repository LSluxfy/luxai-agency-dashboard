
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useWanVideoGeneration() {
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const handleGenerateWanVideo = async (imageSource: string, prompt: string = "A person is talking") => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setProgress(10);

    try {
      // Chamar a função Edge no Supabase para iniciar a geração
      const { data, error: initError } = await supabase.functions.invoke("generate-wan-video", {
        body: {
          image: imageSource,
          prompt: prompt
        }
      });

      if (initError) {
        throw new Error(`Erro ao iniciar geração: ${initError.message}`);
      }

      if (!data?.predictionId) {
        throw new Error("Não foi possível iniciar a geração de vídeo");
      }

      setPredictionId(data.predictionId);
      setProgress(20);

      // Iniciar polling para verificar o status da geração
      let attempts = 0;
      const maxAttempts = 60; // 3 minutos com intervalo de 3 segundos
      
      const checkStatus = async () => {
        attempts++;
        
        try {
          const { data: statusData, error: statusError } = await supabase.functions.invoke("check-wan-video-status", {
            body: {
              predictionId: data.predictionId
            }
          });

          if (statusError) {
            throw new Error(`Erro ao verificar status: ${statusError.message}`);
          }

          // Atualizar o progresso com base no status
          if (statusData.status === "succeeded") {
            setProgress(100);
            setVideoUrl(statusData.output);
            setLoading(false);
            toast.success("Vídeo gerado com sucesso!");
            return;
          } else if (statusData.status === "failed") {
            throw new Error(`Falha na geração: ${statusData.error || "Erro desconhecido"}`);
          } else if (statusData.status === "processing") {
            // Calcular progresso aproximado
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 90);
            setProgress(progressValue);
            
            // Continuar polling
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 3000);
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          } else {
            // Para outros status, continuar polling
            const progressValue = Math.min(20 + (attempts * 60 / maxAttempts), 85);
            setProgress(progressValue);
            
            if (attempts < maxAttempts) {
              setTimeout(checkStatus, 3000);
            } else {
              throw new Error("Tempo limite excedido. A geração está demorando muito.");
            }
          }
        } catch (err) {
          setError(err.message || "Erro ao verificar status da geração");
          setLoading(false);
          toast.error("Erro na geração do vídeo");
        }
      };

      // Iniciar o polling
      setTimeout(checkStatus, 3000);

    } catch (err) {
      setError(err.message || "Erro ao gerar vídeo");
      setLoading(false);
      setProgress(0);
      toast.error("Erro ao iniciar a geração de vídeo");
    }
  };

  return {
    loading,
    videoUrl,
    error,
    predictionId,
    progress,
    handleGenerateWanVideo
  };
}
