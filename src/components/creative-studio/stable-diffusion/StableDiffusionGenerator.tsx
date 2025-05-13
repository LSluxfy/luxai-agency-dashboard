
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import { EnhancedGenerationForm } from "./EnhancedGenerationForm";
import { SD_MODELS } from "./sdConstants";
import { toast } from "@/components/ui/use-toast";
import { Download, ExternalLink } from "lucide-react";

const StableDiffusionGenerator = () => {
  const {
    isGenerating,
    generatedImage,
    generationProgress,
    generateImage,
    setGeneratedImage
  } = useStableDiffusion();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleGenerate = async (
    prompt: string,
    engineId: string,
    imageFile: File | null,
    dimensions: string,
    mode: string,
    imageStrength?: number,
    maskImage?: File | null,
    controlImage?: File | null,
    controlMode?: string
  ) => {
    try {
      // For now, just use the basic generate function
      await generateImage(prompt, engineId, imageFile, dimensions, imageStrength);
    } catch (error) {
      console.error("Error in generation:", error);
      toast({
        title: "Erro na geração",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `stable-diffusion-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download iniciado",
      description: "Sua imagem está sendo baixada."
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold mb-2">Stable Diffusion XL</h2>
              <p className="text-muted-foreground mb-4">
                Use os modelos mais avançados de Stable Diffusion para gerar imagens de alta qualidade.
              </p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {SD_MODELS.map((model) => (
                  <div 
                    key={model.value} 
                    className="text-xs p-1 px-2 rounded-md bg-primary/10 text-primary-foreground flex items-center"
                  >
                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                    {model.label}
                  </div>
                ))}
              </div>
            </div>

            <EnhancedGenerationForm
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              imageFile={imageFile}
              setImageFile={setImageFile}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
            />
          </CardContent>
        </Card>
      </div>

      <div className="lg:w-1/2">
        <Card className="h-full">
          <CardContent className="pt-6 h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4">Resultado</h2>
            
            {generatedImage ? (
              <div className="flex-1 flex flex-col">
                <div className="relative aspect-square mb-4 bg-black/5 rounded-md overflow-hidden flex items-center justify-center flex-1">
                  <img 
                    src={generatedImage} 
                    alt="Imagem gerada" 
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                
                <div className="flex justify-center gap-3 mt-auto">
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.open(generatedImage, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver em tamanho real
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setGeneratedImage(null)}
                  >
                    Limpar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border-2 border-dashed border-muted rounded-md p-8">
                <div className="text-center text-muted-foreground">
                  {isGenerating ? (
                    <div className="space-y-2">
                      <div className="animate-pulse">Gerando imagem...</div>
                      <div className="text-sm">{generationProgress}% concluído</div>
                    </div>
                  ) : (
                    <div>
                      <p>A imagem gerada aparecerá aqui</p>
                      <p className="text-sm mt-2">Utilize o formulário para criar uma nova imagem</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StableDiffusionGenerator;
