
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define valid dimensions for SDXL and SD 1.6
const SDXL_DIMENSIONS = [
  { value: "1024x1024", label: "1024x1024 (1:1)" },
  { value: "1152x896", label: "1152x896 (9:7)" },
  { value: "896x1152", label: "896x1152 (7:9)" },
  { value: "1216x832", label: "1216x832 (19:13)" },
  { value: "832x1216", label: "832x1216 (13:19)" },
  { value: "1344x768", label: "1344x768 (7:4)" },
  { value: "768x1344", label: "768x1344 (4:7)" },
  { value: "1536x640", label: "1536x640 (12:5)" },
  { value: "640x1536", label: "640x1536 (5:12)" }
];

// Available models
const MODELS = [
  { value: "stable-video-diffusion", label: "Stable Video Diffusion" }
];

const VideoGenerator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [motionAmount, setMotionAmount] = useState<number>(127); // Default middle value
  const [engineId, setEngineId] = useState<string>("stable-video-diffusion");
  const [dimensions, setDimensions] = useState<string>("1024x1024");
  const [width, setWidth] = useState<number>(1024);
  const [height, setHeight] = useState<number>(1024);
  const [steps, setSteps] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<string>("svd");
  
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
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setEngineId("stable-video-diffusion");
    setDimensions("1024x1024");
    setWidth(1024);
    setHeight(1024);
  };
  
  const handleSDXLDimensionChange = (value: string) => {
    setDimensions(value);
    const [w, h] = value.split("x").map(Number);
    setWidth(w);
    setHeight(h);
  };
  
  const handleGenerateVideo = async () => {
    if (imageFile) {
      await generateVideo({
        imageSource: imageFile,
        motionBucketId: motionAmount,
        prompt: prompt,
        engineId: engineId,
        width: width,
        height: height,
        steps: steps
      });
    } else if (imageUrl) {
      await generateVideo({
        imageSource: imageUrl,
        motionBucketId: motionAmount,
        prompt: prompt,
        engineId: engineId,
        width: width,
        height: height,
        steps: steps
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
                <h4 className="text-sm font-medium mb-1">Dimensões</h4>
                <Select value={dimensions} onValueChange={handleSDXLDimensionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione as dimensões" />
                  </SelectTrigger>
                  <SelectContent>
                    {SDXL_DIMENSIONS.map((dim) => (
                      <SelectItem key={dim.value} value={dim.value}>
                        {dim.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-1">Quantidade de Steps (1-50)</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm min-w-12 text-right">{steps}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mais steps = melhor qualidade, mas mais lento e maior custo (padrão: 30)
                </p>
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
                  Gerar Vídeo com Stable Video Diffusion
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
              <li>Certifique-se de que sua conta Stability AI tenha o modelo SVD ativado</li>
              <li>Imagens com fundos simples geralmente funcionam melhor</li>
              <li>Objetos centralizados e bem definidos produzem movimentos mais naturais</li>
              <li>Pessoas e animais em poses naturais funcionam bem</li>
              <li>Se ocorrerem erros, verifique se sua conta tem créditos suficientes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoGenerator;
