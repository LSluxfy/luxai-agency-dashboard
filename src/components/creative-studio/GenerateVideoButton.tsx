
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUrlInput from "./video/VideoUrlInput";
import VideoFileUpload from "./video/VideoFileUpload";
import VideoGenerationProgress from "./video/VideoGenerationProgress";
import VideoViewer from "./video/VideoViewer";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { convertFileToDataUri } from "@/lib/fileUtils";

export function GenerateVideoButton() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tabValue, setTabValue] = useState<string>("url");
  
  const {
    loading,
    videoUrl,
    error,
    predictionId,
    progress,
    handleGenerateVideo
  } = useVideoGeneration();

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    // Check if we have a URL or a file
    const isUrlMode = tabValue === "url";
    
    if (isUrlMode && !imageUrl.trim()) {
      return; // Button should be disabled in this case
    }
    
    if (!isUrlMode && !selectedFile) {
      return; // Button should be disabled in this case
    }

    let imageSource;
    
    if (isUrlMode) {
      // Use the URL directly
      imageSource = imageUrl.trim();
    } else if (selectedFile) {
      // Convert the file to Data URI
      imageSource = await convertFileToDataUri(selectedFile);
    } else {
      return; // Should never happen, but TypeScript is happy now
    }
    
    await handleGenerateVideo(imageSource);
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-amber-50 border-amber-200 mb-4">
        <AlertTitle className="text-amber-800 font-medium">Sobre a geração de vídeo com Runway Gen-4</AlertTitle>
        <AlertDescription className="text-amber-700 text-sm">
          • Usando o modelo <strong>gen4_turbo</strong> da Runway para converter imagens em vídeos de 5 segundos<br />
          • A proporção do vídeo de saída será 1280x720 (widescreen)<br />
          • Imagens de alta qualidade produzem resultados melhores<br />
          • A geração pode levar de 1 a 3 minutos para ser concluída<br />
          • Certifique-se de usar imagens com permissões adequadas
        </AlertDescription>
      </Alert>

      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="url" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            URL da Imagem
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Upload de Imagem
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <VideoUrlInput imageUrl={imageUrl} setImageUrl={setImageUrl} />
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <VideoFileUpload onFileSelected={handleFileSelected} />
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleSubmit} 
        disabled={loading || (tabValue === "url" ? !imageUrl.trim() : !selectedFile)} 
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando vídeo...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Converter Imagem em Vídeo
          </>
        )}
      </Button>

      {predictionId && (
        <Alert className="bg-blue-50 border-blue-200 mt-4">
          <AlertTitle className="text-blue-800 font-medium">ID do vídeo</AlertTitle>
          <AlertDescription className="text-blue-700 text-sm font-mono">
            {predictionId}
          </AlertDescription>
        </Alert>
      )}

      <VideoGenerationProgress progress={progress} predictionId={predictionId} />

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erro na geração do vídeo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <VideoViewer videoUrl={videoUrl} />
    </div>
  );
};
