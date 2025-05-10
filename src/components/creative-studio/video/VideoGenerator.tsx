
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Info } from "lucide-react";
import VideoFileUpload from "./VideoFileUpload";
import VideoUrlInput from "./VideoUrlInput";
import VideoViewer from "./VideoViewer";
import VideoGenerationProgress from "./VideoGenerationProgress";
import { useStabilityVideoGeneration } from "@/hooks/useStabilityVideoGeneration";

const VideoGenerator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [motionAmount, setMotionAmount] = useState<number>(127); // Default middle value
  
  const {
    generateVideo,
    videoUrl,
    isGenerating,
    generationProgress,
    error,
    predictionId
  } = useStabilityVideoGeneration();
  
  const handleFileSelected = (file: File) => {
    setImageFile(file);
    setImageUrl(""); // Clear URL when file is selected
  };
  
  const handleUrlEntered = (url: string) => {
    setImageUrl(url);
    setImageFile(null); // Clear file when URL is entered
  };
  
  const handleGenerateVideo = async () => {
    if (imageFile) {
      await generateVideo({
        imageSource: imageFile,
        motionBucketId: motionAmount,
        prompt: prompt
      });
    } else if (imageUrl) {
      await generateVideo({
        imageSource: imageUrl,
        motionBucketId: motionAmount,
        prompt: prompt
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Vídeo com Stable Video Diffusion</CardTitle>
          <CardDescription>
            Transforme imagens em vídeos curtos com movimento natural usando IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Upload de Imagem</h3>
              <VideoFileUpload onFileSelected={handleFileSelected} />
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Ou use uma URL de imagem</h4>
                <VideoUrlInput onUrlEntered={handleUrlEntered} />
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Prompt (opcional)</h4>
                <Textarea 
                  placeholder="Descreva como você gostaria que a imagem se movesse..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Quantidade de Movimento (1-255)</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="1"
                    max="255"
                    value={motionAmount}
                    onChange={(e) => setMotionAmount(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm">{motionAmount}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valores mais baixos = menos movimento, valores mais altos = mais movimento
                </p>
              </div>
              
              <div className="mt-6">
                <Button 
                  onClick={handleGenerateVideo}
                  disabled={isGenerating || (!imageFile && !imageUrl)}
                  className="w-full"
                >
                  Gerar Vídeo
                </Button>
              </div>
              
              {isGenerating && (
                <VideoGenerationProgress 
                  progress={generationProgress} 
                  predictionId={predictionId}
                  error={error}
                />
              )}
              
              {error && !isGenerating && (
                <div className="mt-4 p-3 bg-destructive/10 rounded-md text-sm text-destructive">
                  <p className="font-medium">Erro:</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
            
            <div>
              {videoUrl ? (
                <VideoViewer videoUrl={videoUrl} />
              ) : (
                <div className="border rounded-lg p-8 h-full flex items-center justify-center bg-slate-50">
                  <div className="text-center text-muted-foreground">
                    <Info className="mx-auto h-12 w-12 mb-3 opacity-30" />
                    <p>O vídeo gerado aparecerá aqui</p>
                    <p className="text-xs mt-2">
                      O processo leva aproximadamente 30-60 segundos
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <h4 className="font-medium text-amber-800 mb-2">Dicas para melhores resultados:</h4>
            <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
              <li>Use imagens com dimensões próximas a 1024x576, 576x1024, ou 768x768</li>
              <li>Imagens com fundos simples geralmente funcionam melhor</li>
              <li>Objetos centralizados e bem definidos produzem movimentos mais naturais</li>
              <li>Pessoas e animais em poses naturais funcionam bem</li>
              <li>O prompt pode ajudar a guiar o movimento, mas não é obrigatório</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGenerator;
