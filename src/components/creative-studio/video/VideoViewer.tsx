
import { ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoViewerProps {
  videoUrl: string | null;
}

const VideoViewer = ({ videoUrl }: VideoViewerProps) => {
  if (!videoUrl) return null;
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `runway-video-${new Date().getTime()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 border rounded-lg p-4 bg-slate-50">
      <h3 className="font-medium mb-3 text-slate-700">Vídeo gerado</h3>
      <video
        src={videoUrl}
        controls
        className="w-full rounded-lg shadow-lg"
        playsInline
        autoPlay
        loop
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" /> Baixar vídeo
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          asChild
        >
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" /> Abrir em nova aba
          </a>
        </Button>
      </div>
      <p className="text-xs text-slate-500 mt-2">
        Este vídeo foi gerado usando Runway Gen-4 Turbo e tem 5 segundos de duração.
      </p>
    </div>
  );
};

export default VideoViewer;
