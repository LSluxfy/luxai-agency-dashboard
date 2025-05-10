import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Video } from "lucide-react";
import VideoFileUpload from "@/components/creative-studio/video/VideoFileUpload";
import VideoUrlInput from "@/components/creative-studio/video/VideoUrlInput";
import VideoViewer from "@/components/creative-studio/video/VideoViewer";
import VideoGenerationProgress from "@/components/creative-studio/video/VideoGenerationProgress";
import { useWanVideoGeneration } from "@/hooks/useWanVideoGeneration";
import { fileToDataUri } from "@/utils/imageUtils";

export function GenerateWanVideoButton() {
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [prompt, setPrompt] = useState("Person talking naturally");

  const {
    loading,
    videoUrl,
    error,
    progress,
    handleGenerateWanVideo
  } = useWanVideoGeneration();

  const handleFileSelected = (file: File) => {
    setImageFile(file);
    setImageUrl(""); // Clear URL when file is selected
  };
  
  const handleUrlEntered = (url: string) => {
    setImageUrl(url);
    setImageFile(null); // Clear file when URL is entered
  };

  const handleGenerateClick = async () => {
    let imageSource: string;

    if (imageFile) {
      // Convert file to data URI
      try {
        imageSource = await fileToDataUri(imageFile);
      } catch (err) {
        console.error("Failed to convert file to data URI", err);
        return;
      }
    } else if (imageUrl) {
      imageSource = imageUrl;
    } else {
      alert("Por favor, selecione uma imagem ou forneça uma URL");
      return;
    }

    // Call the generation function with the image source
    await handleGenerateWanVideo(imageSource, prompt);
  };

  return (
    <>
      <Button variant="default" onClick={() => setOpen(true)} className="flex gap-2">
        <Video className="h-4 w-4" />
        Criar Video com WAN 2.1
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerar Vídeo com WAN 2.1</DialogTitle>
            <DialogDescription>
              Transforme suas imagens em vídeos expressivos usando a tecnologia WAN 2.1 da WavesSpeedAI
            </DialogDescription>
          </DialogHeader>
          
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Upload de Imagem</h3>
                <VideoFileUpload onFileSelected={handleFileSelected} />
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Ou use uma URL de imagem</h4>
                  <VideoUrlInput onUrlEntered={handleUrlEntered} />
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-1">Prompt (opcional)</h4>
                  <Textarea
                    placeholder="Descreva o movimento desejado..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Ex: "Person talking naturally", "Person smiling", etc.
                  </p>
                </div>
                
                <Button
                  onClick={handleGenerateClick}
                  disabled={loading || (!imageFile && !imageUrl)}
                  className="w-full mt-4"
                >
                  {loading ? "Gerando..." : "Gerar Vídeo"}
                </Button>
                
                {loading && <VideoGenerationProgress progress={progress} error={error} />}
              </div>
              
              <div>
                {videoUrl ? (
                  <VideoViewer videoUrl={videoUrl} />
                ) : (
                  <div className="border rounded-lg p-8 h-full flex items-center justify-center bg-slate-50">
                    <div className="text-center text-muted-foreground">
                      <Video className="mx-auto h-12 w-12 mb-3 opacity-30" />
                      <p>O vídeo gerado aparecerá aqui</p>
                      <p className="text-xs mt-2">
                        O processo leva aproximadamente 30-60 segundos
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </DialogContent>
      </Dialog>
    </>
  );
}
