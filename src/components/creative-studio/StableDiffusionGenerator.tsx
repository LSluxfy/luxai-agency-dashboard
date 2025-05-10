
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Wand2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the request body type
interface StabilityRequestBody {
  prompt: string;
  engineId: string;
  initImage?: string; // Make initImage optional
}

export default function StableDiffusionGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [engineId, setEngineId] = useState<string>("stable-diffusion-xl-1024-v1-0");

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset generated image when new image is selected
    setGeneratedImage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt || prompt.trim() === "") {
      toast({
        title: "Erro",
        description: "Por favor, digite um prompt para gerar a imagem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setGenerationProgress(10);
    setGeneratedImage(null);
    
    try {
      let requestBody: StabilityRequestBody = {
        prompt: prompt,
        engineId: engineId
      };
      
      // If image file exists, include it for img2img generation
      if (imageFile) {
        const reader = new FileReader();
        const imagePromise = new Promise<string>((resolve) => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(imageFile);
        });
        
        const imageData = await imagePromise;
        requestBody = { ...requestBody, initImage: imageData };
      }
      
      // Call the Supabase Edge Function to generate the image
      const { data, error } = await supabase.functions.invoke("generate-with-stability", {
        body: requestBody
      });
      
      if (error) {
        throw new Error(error.message || "Erro ao chamar API");
      }
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Update the UI with the generated image
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast({
          title: "Sucesso",
          description: "Imagem gerada com sucesso!",
        });
      } else {
        throw new Error("Resposta inesperada da API");
      }
      
      setGenerationProgress(100);
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro",
        description: `Falha ao gerar imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Stable Diffusion XL</h2>
          <p className="text-muted-foreground">
            Gere imagens de alta qualidade com o modelo Stable Diffusion XL da Stability AI.
            Forneça um prompt detalhado para obter os melhores resultados.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="engine-select">Modelo</Label>
              <Select 
                value={engineId} 
                onValueChange={setEngineId}
                disabled={isGenerating}
              >
                <SelectTrigger id="engine-select" className="w-full">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stable-diffusion-xl-1024-v1-0">Stable Diffusion XL (1024)</SelectItem>
                  <SelectItem value="stable-diffusion-xl-beta-v2-2-2">SDXL Beta v2.2.2</SelectItem>
                  <SelectItem value="stable-diffusion-v1-6">Stable Diffusion 1.6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                Imagem de Referência (Opcional)
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Faça upload de uma imagem para guiar a geração (opcional).
              </p>
            </div>
            
            <div>
              <Label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Prompt de Geração
              </Label>
              <Textarea
                id="prompt"
                placeholder="Descreva em detalhes a imagem que você deseja gerar..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={4}
                className="resize-none"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isGenerating || !prompt.trim()} 
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Gerar Imagem
                </>
              )}
            </Button>
            
            {isGenerating && (
              <div className="mt-2">
                <Progress value={generationProgress} className="h-2" />
                <p className="text-xs text-center mt-1 text-muted-foreground">
                  {generationProgress}% concluído
                </p>
              </div>
            )}
          </form>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Visualização</h3>
          <div className="grid gap-4 grid-cols-2">
            {imagePreview && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Imagem de Referência</p>
                <div className="border rounded-md overflow-hidden aspect-square">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            
            <div className={imagePreview ? "" : "col-span-2"}>
              <p className="text-sm text-muted-foreground mb-2">Imagem Gerada</p>
              {generatedImage ? (
                <div className="border rounded-md overflow-hidden aspect-square">
                  <img
                    src={generatedImage}
                    alt="Generated"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="border border-dashed rounded-md flex items-center justify-center aspect-square bg-muted">
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-xs text-muted-foreground">Gerando imagem...</p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Aguardando geração</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {generatedImage && (
            <div className="mt-4">
              <a 
                href={generatedImage} 
                download="stable-diffusion-xl.png"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Abrir em Nova Aba / Baixar
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
