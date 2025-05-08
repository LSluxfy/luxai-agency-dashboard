
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function GenerateVideoButton({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);
  const [checkCount, setCheckCount] = useState<number>(0);

  // Limpar o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Gerenciar a verificação de status quando temos um ID de previsão
  useEffect(() => {
    if (!predictionId) return;
    
    const maxChecks = 60; // Aumentado para cerca de 3 minutos (3s * 60)
    
    // Iniciar a verificação a cada 3 segundos
    const interval = window.setInterval(async () => {
      // Incrementar o contador
      setCheckCount(prev => {
        const newCount = prev + 1;
        
        // Atualizar o progresso (0-95%)
        const newProgress = Math.min(5 + (newCount * 90 / maxChecks), 95);
        setProgress(newProgress);
        
        // Se atingir o número máximo de verificações, parar
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
        // Verificar o status da geração do vídeo
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
          // Vídeo gerado com sucesso
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setProgress(100);
          setLoading(false);
          
          const output = data.output;
          if (output && typeof output === "string") {
            setVideoUrl(output);
            toast.success("Vídeo gerado com sucesso!");
          } else if (Array.isArray(output) && output.length > 0) {
            setVideoUrl(output[0]);
            toast.success("Vídeo gerado com sucesso!");
          } else {
            throw new Error("Formato de output inválido: " + JSON.stringify(output));
          }
        } else if (data.status === "failed") {
          // Falha na geração
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
          const errorMsg = data.error || "Falha na geração do vídeo";
          setError(`Falha na geração: ${errorMsg}`);
          toast.error(`Falha na geração: ${errorMsg}`);
        }
      } catch (err: any) {
        console.error("Erro ao verificar o status:", err);
        // Apenas mostramos o erro se for a última tentativa ou se for um erro crítico
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
    
    // Limpar o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, [predictionId, checkCount]);

  const handleGenerateVideo = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, forneça uma descrição para o vídeo");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setPredictionId(null);
    setProgress(5); // Iniciar com 5% para feedback visual
    setCheckCount(0);
    toast.info("Iniciando geração de vídeo com IA...");

    try {
      console.log("Enviando requisição para gerar vídeo com o prompt:", prompt);
      
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { prompt: prompt.trim() }
      });
      
      if (error) {
        console.error("Erro da função de borda:", error);
        throw new Error(error.message || "Erro ao iniciar a geração do vídeo");
      }
      
      console.log("Resposta da função generate-video:", data);
      
      if (data.id) {
        // Temos um ID de previsão para acompanhar
        setPredictionId(data.id);
        toast.info("Geração de vídeo iniciada, por favor aguarde...");
      } else if (data.output) {
        // Resultado disponível imediatamente (improvável, mas possível)
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
        // Resposta inesperada
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

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGenerateVideo} 
        disabled={loading || !prompt.trim()} 
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando vídeo...
          </>
        ) : (
          "Gerar Vídeo com IA"
        )}
      </Button>

      {loading && predictionId && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Gerando vídeo ({progress.toFixed(0)}%)... Isso pode levar alguns minutos.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erro na geração do vídeo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {videoUrl && (
        <div>
          <video
            src={videoUrl}
            controls
            className="mt-4 w-full rounded-lg shadow-lg"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            Se o vídeo não carregar, <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline flex items-center">
              clique aqui para abrir em uma nova aba <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
