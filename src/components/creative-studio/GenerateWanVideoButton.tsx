
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Video } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoUrlInput from "./video/VideoUrlInput";
import VideoFileUpload from "./video/VideoFileUpload";
import VideoGenerationProgress from "./video/VideoGenerationProgress";
import VideoViewer from "./video/VideoViewer";
import { useWanVideoGeneration } from "@/hooks/useWanVideoGeneration";
import { fileToDataUri } from "@/utils/imageUtils";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function GenerateWanVideoButton() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tabValue, setTabValue] = useState<string>("url");
  const [prompt, setPrompt] = useState<string>("Uma pessoa está falando");
  
  const {
    loading,
    videoUrl,
    error,
    predictionId,
    progress,
    handleGenerateWanVideo
  } = useWanVideoGeneration();

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
      imageSource = await fileToDataUri(selectedFile);
    } else {
      return; // Should never happen, but TypeScript is happy now
    }
    
    await handleGenerateWanVideo(imageSource, prompt.trim() || "Uma pessoa está falando");
  };

  return (
    <div className="space-y-4">
      <Alert className="bg-purple-50 border-purple-200 mb-4">
        <AlertTitle className="text-purple-800 font-medium">Sobre a geração de vídeo com WAN 2.1</AlertTitle>
        <AlertDescription className="text-purple-700 text-sm">
          • Usando o modelo <strong>WAN 2.1</strong> da WavesSpeedAI para converter imagens em vídeos curtos<br />
          • A proporção do vídeo de saída será 832x480 (formato landscape)<br />
          • Imagens de alta qualidade produzem resultados melhores<br />
          • Funciona melhor com rostos e figuras humanas<br />
          • A geração pode levar de 30 segundos a 1 minuto<br />
          • O prompt ajuda a direcionar o movimento na cena
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

      <div className="space-y-2">
        <Label htmlFor="wan-prompt">Descrição do movimento (prompt):</Label>
        <Textarea 
          id="wan-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Uma pessoa está falando, movendo as mãos, expressando emoção"
          className="min-h-[80px]"
        />
        <p className="text-xs text-muted-foreground">
          O prompt ajuda a determinar o tipo de movimento no vídeo. Seja específico sobre os movimentos desejados.
        </p>
      </div>

      <Button 
        onClick={handleSubmit} 
        disabled={loading || (tabValue === "url" ? !imageUrl.trim() : !selectedFile)} 
        className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando vídeo com WAN 2.1...
          </>
        ) : (
          <>
            <Video className="mr-2 h-4 w-4" />
            Converter com WAN 2.1
          </>
        )}
      </Button>

      {predictionId && (
        <Alert className="bg-blue-50 border-blue-200 mt-4">
          <AlertTitle className="text-blue-800 font-medium">ID da predição WAN</AlertTitle>
          <AlertDescription className="text-blue-700 text-sm font-mono">
            {predictionId}
          </AlertDescription>
        </Alert>
      )}

      <VideoGenerationProgress 
        progress={progress} 
        predictionId={predictionId} 
        error={error}
      />

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
