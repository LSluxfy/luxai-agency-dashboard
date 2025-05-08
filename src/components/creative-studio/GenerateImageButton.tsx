
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function GenerateImageButton({ prompt, onImageGenerated }: { prompt: string; onImageGenerated?: (imageUrl: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, forneça um prompt para gerar a imagem.");
      return;
    }
    
    setLoading(true);
    toast("Gerando imagem com SDXL...");

    try {
      // Use our Supabase Edge Function instead of direct API call
      const { data, error } = await supabase.functions.invoke('generate-with-image', {
        body: {
          directGeneration: true,
          prompt: prompt
        }
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar imagem");
      }

      if (!data || !data.prediction) {
        throw new Error("Dados de resposta inválidos");
      }
      
      if (data.prediction.status === "succeeded" && Array.isArray(data.prediction.output) && data.prediction.output.length > 0) {
        const generatedImageUrl = data.prediction.output[0];
        setImageUrl(generatedImageUrl);
        if (onImageGenerated) {
          onImageGenerated(generatedImageUrl);
        }
        toast.success("Imagem gerada com sucesso!");
      } else if (data.prediction.id) {
        // If the prediction is still processing, we need to poll for results
        await pollForResults(data.prediction.id);
      } else {
        toast.error("Erro ao gerar imagem.");
        console.error("Resposta inesperada:", data);
      }
    } catch (err) {
      console.error("Erro ao gerar imagem:", err);
      toast.error(err instanceof Error ? err.message : "Falha na geração da imagem.");
    } finally {
      setLoading(false);
    }
  };
  
  const pollForResults = async (predictionId: string) => {
    const maxAttempts = 20;
    let attempts = 0;
    
    const checkStatus = async () => {
      if (attempts >= maxAttempts) {
        toast.error("Tempo limite excedido. A imagem pode estar sendo gerada em segundo plano.");
        setLoading(false);
        return;
      }
      
      attempts++;
      toast.info(`Verificando status da imagem (${attempts}/${maxAttempts})...`);
      
      try {
        const { data, error } = await supabase.functions.invoke('generate-with-image', {
          body: { predictionId }
        });
        
        if (error) throw new Error(error.message);
        
        if (data.status === "succeeded" && Array.isArray(data.output) && data.output.length > 0) {
          const generatedImageUrl = data.output[0];
          setImageUrl(generatedImageUrl);
          if (onImageGenerated) {
            onImageGenerated(generatedImageUrl);
          }
          toast.success("Imagem gerada com sucesso!");
          setLoading(false);
        } else if (data.status === "failed") {
          toast.error("Falha ao gerar a imagem: " + (data.error || "Erro desconhecido"));
          setLoading(false);
        } else {
          // Still processing, poll again after delay
          setTimeout(checkStatus, 3000);
        }
      } catch (err) {
        console.error("Erro durante verificação de status:", err);
        toast.error("Erro ao verificar status da imagem");
        setLoading(false);
      }
    };
    
    // Start polling
    setTimeout(checkStatus, 3000);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button onClick={handleGenerate} disabled={loading} className="flex gap-2 items-center">
        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
        {loading ? "Gerando..." : "Gerar Imagem com SDXL"}
      </Button>

      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="Imagem gerada pela IA"
            className="rounded-lg shadow-md max-w-full h-auto"
          />
        </div>
      )}
    </div>
  );
}
