
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Wand2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { VALID_DIMENSIONS, SD_MODELS } from "./sdConstants";

interface GenerationFormProps {
  onGenerate: (
    prompt: string,
    engineId: string,
    imageFile: File | null,
    dimensions: string
  ) => Promise<void>;
  isGenerating: boolean;
  generationProgress: number;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
}

export const GenerationForm: React.FC<GenerationFormProps> = ({
  onGenerate,
  isGenerating,
  generationProgress,
  imageFile,
  setImageFile,
  imagePreview,
  setImagePreview,
}) => {
  const [prompt, setPrompt] = useState<string>("");
  const [engineId, setEngineId] = useState<string>("stable-diffusion-xl-1024-v1-0");
  const [dimensions, setDimensions] = useState<string>("1024x1024");
  const [imageStrength, setImageStrength] = useState<number>(0.35);

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
  };

  const handleResetImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate(prompt, engineId, imageFile, dimensions);
  };

  return (
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
            {SD_MODELS.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
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
        {imagePreview && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetImage} 
            className="mt-2"
            type="button"
          >
            Remover imagem
          </Button>
        )}
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
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm">Configurações avançadas</AccordionTrigger>
          <AccordionContent>
            {!imageFile && (
              <div className="mb-4">
                <Label htmlFor="dimensions" className="block text-sm font-medium mb-2">
                  Dimensões
                </Label>
                <Select 
                  value={dimensions} 
                  onValueChange={setDimensions}
                  disabled={isGenerating || !!imageFile}
                >
                  <SelectTrigger id="dimensions" className="w-full">
                    <SelectValue placeholder="Selecione as dimensões" />
                  </SelectTrigger>
                  <SelectContent>
                    {VALID_DIMENSIONS.map((dim) => (
                      <SelectItem key={dim.value} value={dim.value}>
                        {dim.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {imageFile && (
              <div className="mb-4">
                <Label htmlFor="image-strength" className="block text-sm font-medium mb-2">
                  Força da imagem original: {imageStrength}
                </Label>
                <Slider
                  id="image-strength"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={[imageStrength]}
                  onValueChange={(values) => setImageStrength(values[0])}
                  disabled={isGenerating}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Valores mais baixos mantêm mais da imagem original, valores mais altos permitem mais criatividade.
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
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
  );
};
