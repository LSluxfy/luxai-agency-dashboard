
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function RealisticVisionGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);

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
    
    if (!imageFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }
    
    if (!prompt || prompt.trim() === "") {
      toast({
        title: "Erro",
        description: "Por favor, digite um prompt para transformar a imagem.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    try {
      // Convert the image to a data URL
      const imageData = imagePreview;
      
      // Call the Supabase Edge Function to generate the image
      const { data, error } = await supabase.functions.invoke("generate-with-image", {
        body: {
          image: imageData,
          prompt: prompt,
          strength: 0.6 // Higher strength means more transformation
        }
      });
      
      if (error) {
        console.error("Error calling function:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao gerar a imagem. Tente novamente.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }
      
      if (data.prediction && data.prediction.id) {
        setPredictionId(data.prediction.id);
        
        // Start polling for the result
        await checkPredictionStatus(data.prediction.id);
      } else {
        throw new Error("Resposta inesperada da API");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Erro",
        description: `Falha ao gerar imagem: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
        variant: "destructive",
      });
      setIsGenerating(false);
    }
  };
  
  // Check the status of the prediction
  const checkPredictionStatus = async (id: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes (5s intervals)
    
    const checkStatus = async () => {
      try {
        attempts++;
        
        const { data, error } = await supabase.functions.invoke("generate-with-image", {
          body: { predictionId: id }
        });
        
        if (error) {
          throw new Error(`Erro ao verificar status: ${error.message}`);
        }
        
        console.log("Status check response:", data);
        
        if (data.status === "succeeded" && data.output) {
          // Handle the successful generation
          setGeneratedImage(Array.isArray(data.output) ? data.output[0] : data.output);
          setIsGenerating(false);
          toast({
            title: "Sucesso",
            description: "Imagem gerada com sucesso!",
          });
          return;
        } else if (data.status === "failed") {
          throw new Error(`Geração falhou: ${data.error || "Erro desconhecido"}`);
        }
        
        // Continue polling if not complete and not reached max attempts
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 5000); // Check every 5 seconds
        } else {
          throw new Error("Tempo limite excedido. Tente novamente mais tarde.");
        }
      } catch (error) {
        console.error("Error checking prediction status:", error);
        toast({
          title: "Erro",
          description: `Falha ao verificar status da geração: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
          variant: "destructive",
        });
        setIsGenerating(false);
      }
    };
    
    await checkStatus();
  };

  return (
    <Card>
      <CardContent className="pt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Transformar Imagem com IA</h2>
          <p className="text-muted-foreground">
            Transforme sua imagem com o modelo Realistic Vision V5. 
            Carregue uma imagem e descreva como você deseja transformá-la.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="image-upload" className="block text-sm font-medium mb-2">
                Imagem de Referência
              </label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isGenerating}
              />
            </div>
            
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium mb-2">
                Prompt de Transformação
              </label>
              <Textarea
                id="prompt"
                placeholder="Descreva como você quer transformar a imagem..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
                rows={3}
                className="resize-none"
              />
            </div>
            
            <Button type="submit" disabled={isGenerating || !imageFile || !prompt.trim()}>
              {isGenerating ? "Gerando..." : "Gerar Imagem"}
            </Button>
          </form>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-medium">Visualização</h3>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Imagem Original</p>
              {imagePreview ? (
                <div className="border rounded-md overflow-hidden aspect-square">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="border border-dashed rounded-md flex items-center justify-center aspect-square bg-muted">
                  <p className="text-xs text-muted-foreground">Nenhuma imagem selecionada</p>
                </div>
              )}
            </div>
            
            <div>
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
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="text-xs text-muted-foreground">Gerando...</p>
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
                download="realistic-vision-generated.png"
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
