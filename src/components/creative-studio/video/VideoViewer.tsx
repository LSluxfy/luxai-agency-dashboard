
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface VideoViewerProps {
  videoUrl: string | null;
}

const VideoViewer: React.FC<VideoViewerProps> = ({ videoUrl }) => {
  if (!videoUrl) return null;

  const handleDownload = () => {
    // Create a phantom anchor element
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `video-wan-${new Date().getTime()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-6 space-y-3">
      <h3 className="text-lg font-medium">Vídeo gerado:</h3>
      <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
        <video 
          src={videoUrl} 
          controls 
          className="w-full h-full" 
          autoPlay
          loop
        >
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      </div>
      <div className="flex justify-end">
        <Button 
          onClick={handleDownload}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Baixar vídeo
        </Button>
      </div>
    </div>
  );
};

export default VideoViewer;
