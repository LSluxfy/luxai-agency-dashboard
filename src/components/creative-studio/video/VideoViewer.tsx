
import { ExternalLink } from "lucide-react";

interface VideoViewerProps {
  videoUrl: string | null;
}

const VideoViewer = ({ videoUrl }: VideoViewerProps) => {
  if (!videoUrl) return null;
  
  return (
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
  );
};

export default VideoViewer;
