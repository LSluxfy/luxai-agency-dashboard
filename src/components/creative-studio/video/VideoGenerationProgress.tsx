
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

interface VideoGenerationProgressProps {
  progress: number;
  predictionId: string | null;
}

const VideoGenerationProgress = ({ progress, predictionId }: VideoGenerationProgressProps) => {
  if (!predictionId) return null;
  
  return (
    <div className="mt-2">
      <div className="flex items-center gap-2 mb-1">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Gerando vídeo ({progress.toFixed(0)}%)
        </p>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground mt-1">
        Isso pode levar alguns minutos.
      </p>
    </div>
  );
};

export default VideoGenerationProgress;
