
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GenerateVideoButton({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    setLoading(true);
    setError(null);
    toast("Gerando vídeo com IA...");

    try {
      console.log("Enviando requisição para gerar vídeo com o prompt:", prompt);
      
      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: "Bearer r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: "cb23e6b8742a378bd6cef78d3113550fba25abec6a869d8f43e43b30de4b488b", // ID da versão do modelo video-01
          input: {
            prompt: prompt || "a woman is walking through a busy Tokyo street at night, she is wearing dark sunglasses",
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erro na resposta da API:", response.status, errorText);
        throw new Error(`API respondeu com status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log("Resposta completa da API:", result);
      
      // O Replicate pode não retornar o output imediatamente, verificando se é uma predição em andamento
      if (result.status === "starting" || result.status === "processing") {
        toast.info("Geração de vídeo iniciada, aguarde...");
        
        // Verificar status da geração a cada 3 segundos
        let pollCount = 0;
        const maxPolls = 40; // Cerca de 2 minutos de tentativas
        
        const pollForResult = async () => {
          if (pollCount >= maxPolls) {
            throw new Error("Tempo limite excedido para gerar o vídeo.");
          }
          
          pollCount++;
          console.log(`Verificando status do vídeo (tentativa ${pollCount})...`);
          
          const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
            headers: {
              Authorization: "Bearer r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE",
              "Content-Type": "application/json",
            },
          });
          
          const pollResult = await pollResponse.json();
          console.log("Status atual:", pollResult.status);
          
          if (pollResult.status === "succeeded") {
            const output = pollResult.output;
            console.log("Vídeo gerado com sucesso:", output);
            
            if (output && typeof output === "string") {
              setVideoUrl(output);
              toast.success("Vídeo gerado com sucesso!");
              return;
            } else if (Array.isArray(output) && output.length > 0) {
              setVideoUrl(output[0]);
              toast.success("Vídeo gerado com sucesso!");
              return;
            } else {
              throw new Error("Formato de output inválido: " + JSON.stringify(output));
            }
          } else if (pollResult.status === "failed") {
            throw new Error(`Falha na geração: ${pollResult.error || "Erro desconhecido"}`);
          } else {
            // Ainda processando, verificar novamente após 3 segundos
            setTimeout(pollForResult, 3000);
          }
        };
        
        await pollForResult();
      } else if (result.output) {
        // Se o resultado já estiver disponível imediatamente
        const output = result.output;
        
        if (typeof output === "string") {
          setVideoUrl(output);
        } else if (Array.isArray(output) && output.length > 0) {
          setVideoUrl(output[0]);
        } else {
          throw new Error("Formato de output inválido: " + JSON.stringify(output));
        }
        
        toast.success("Vídeo gerado com sucesso!");
      } else {
        throw new Error("Resposta inesperada da API: " + JSON.stringify(result));
      }
    } catch (err: any) {
      console.error("Erro ao gerar vídeo:", err);
      const errorMessage = err.message || "Erro desconhecido ao gerar o vídeo";
      setError(errorMessage);
      toast.error(`Erro ao gerar o vídeo: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleGenerateVideo} disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando vídeo...
          </>
        ) : (
          "Gerar Vídeo com IA"
        )}
      </Button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {videoUrl && (
        <div>
          <video
            src={videoUrl}
            controls
            className="mt-4 w-full rounded-lg shadow-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se o vídeo não carregar, <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">clique aqui para abrir em uma nova aba</a>
          </p>
        </div>
      )}
    </div>
  );
}
