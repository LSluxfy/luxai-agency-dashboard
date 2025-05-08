
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoGenerationProgressProps {
  progress: number;
  predictionId: string | null;
  error?: string | null;
}

const VideoGenerationProgress: React.FC<VideoGenerationProgressProps> = ({ 
  progress, 
  predictionId,
  error
}) => {
  if (!predictionId || progress === 0) return null;

  const statusText = progress < 100 
    ? `Gerando vídeo... ${Math.round(progress)}%`
    : "Vídeo gerado com sucesso!";

  return (
    <div className="mt-4 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">
          {statusText}
        </span>
        <span className="text-sm text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      {!error ? (
        <p className="text-xs text-muted-foreground">
          {progress < 100 
            ? "Este processo pode levar até 1 minuto. Por favor, aguarde." 
            : "Você pode visualizar o vídeo abaixo."}
        </p>
      ) : (
        <Alert variant="destructive" className="mt-2">
          <AlertDescription className="text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default VideoGenerationProgress;
