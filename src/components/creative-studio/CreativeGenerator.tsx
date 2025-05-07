
import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import CreativePreview from "./CreativePreview";

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
}

export interface GeneratedCreative {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  cta: string;
  createdAt: string;
}

const CreativeGenerator = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCreative, setGeneratedCreative] = useState<GeneratedCreative | null>(null);

  const handleImagesUploaded = useCallback((images: UploadedImage[]) => {
    setUploadedImages(images);
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleGenerateCreative = useCallback(() => {
    // Validation checks
    if (uploadedImages.length === 0) {
      toast.error("Por favor, faça o upload de pelo menos uma imagem de referência.");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Por favor, escreva um comando para a IA.");
      return;
    }

    // Start generation process
    setIsGenerating(true);

    // Simulating AI generation - this would be replaced with actual API call
    setTimeout(() => {
      const mockCreative: GeneratedCreative = {
        id: `creative-${Date.now()}`,
        imageUrl: uploadedImages[0].url, // Just using the first image as a placeholder
        title: "Título gerado pela IA com base no seu briefing",
        description: "Descrição gerada pela IA que combina elementos do seu comando com as imagens de referência fornecidas.",
        cta: "COMPRAR AGORA",
        createdAt: new Date().toISOString(),
      };
      
      setGeneratedCreative(mockCreative);
      setIsGenerating(false);
      toast.success("Criativo gerado com sucesso!");
    }, 3000);
  }, [uploadedImages, prompt]);

  const handleSaveCreative = useCallback(() => {
    if (!generatedCreative) return;
    
    // This would save to the user's account in a real implementation
    toast.success("Criativo salvo na sua galeria!");
    
    // Reset the form for a new creative
    setGeneratedCreative(null);
    setPrompt("");
    setUploadedImages([]);
  }, [generatedCreative]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full">1</span>
            Envie imagens de referência
          </CardTitle>
          <CardDescription>
            Faça upload de até 5 imagens que servirão como referência para a IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader 
            onImagesUploaded={handleImagesUploaded}
            uploadedImages={uploadedImages}
            maxImages={5}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full">2</span>
            Escreva seu comando para a IA
          </CardTitle>
          <CardDescription>
            Detalhe o que deseja criar para obter melhores resultados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Crie um criativo para público feminino, produto de emagrecimento, usando a imagem de referência e tom emocional."
            className="min-h-[120px] mb-4"
            value={prompt}
            onChange={handlePromptChange}
          />
          <Button 
            onClick={handleGenerateCreative} 
            disabled={isGenerating || uploadedImages.length === 0 || !prompt.trim()}
            className="w-full sm:w-auto btn-pulse"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Criativo...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Criativo com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCreative && (
        <CreativePreview 
          creative={generatedCreative} 
          onSave={handleSaveCreative}
        />
      )}
    </div>
  );
};

export default CreativeGenerator;
