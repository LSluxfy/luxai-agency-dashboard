
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GenerateVideoButton({ prompt }: { prompt: string }) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleGenerateVideo = async () => {
    setLoading(true);
    toast("Gerando vídeo com IA...");

    try {
      const response = await fetch("https://api.replicate.com/v1/models/minimax/video-01/predictions", {
        method: "POST",
        headers: {
          Authorization: "Bearer r8_D9h5KighG1MjcYbcDKlxc6jxJO0cABt4eJzaE",
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          input: {
            prompt: prompt || "a woman is walking through a busy Tokyo street at night, she is wearing dark sunglasses",
          },
        }),
      });

      const result = await response.json();
      const output = result?.output;

      if (output && typeof output === "string") {
        setVideoUrl(output);
        toast.success("Vídeo gerado com sucesso!");
      } else {
        throw new Error("Nenhum link de vídeo retornado.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar o vídeo.");
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

      {videoUrl && (
        <video
          src={videoUrl}
          controls
          className="mt-4 w-full rounded-lg shadow-lg"
        />
      )}
    </div>
  );
}
