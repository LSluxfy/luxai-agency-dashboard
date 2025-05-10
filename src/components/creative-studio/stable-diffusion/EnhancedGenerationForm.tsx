
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Loader2, Wand2, ArrowUp, Pencil, Sliders } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VALID_DIMENSIONS, SD_MODELS, SD_MODES } from "./sdConstants";
import { toast } from "@/components/ui/use-toast";

interface EnhancedGenerationFormProps {
  onGenerate: (
    prompt: string,
    engineId: string,
    imageFile: File | null,
    dimensions: string,
    mode: string,
    imageStrength?: number,
    maskImage?: File | null,
    controlImage?: File | null,
    controlMode?: string
  ) => Promise<void>;
  isGenerating: boolean;
  generationProgress: number;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (preview: string | null) => void;
}

export const EnhancedGenerationForm: React.FC<EnhancedGenerationFormProps> = ({
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
  const [mode, setMode] = useState<string>("generate");
  const [maskImage, setMaskImage] = useState<File | null>(null);
  const [maskPreview, setMaskPreview] = useState<string | null>(null);
  const [controlImage, setControlImage] = useState<File | null>(null);
  const [controlPreview, setControlPreview] = useState<string | null>(null);
  const [controlMode, setControlMode] = useState<string>("canny");

  // Reset form when mode changes
  useEffect(() => {
    if (mode !== "edit") {
      setMaskImage(null);
      setMaskPreview(null);
    }
    if (mode !== "control") {
      setControlImage(null);
      setControlPreview(null);
      setControlMode("canny");
    }
  }, [mode]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'mask' | 'control') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast({
        title: "Formato inválido",
        description: "Apenas imagens JPEG, PNG, WEBP e GIF são permitidas.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'main') {
        setImageFile(file);
        setImagePreview(reader.result as string);
        toast({
          title: "Imagem será redimensionada automaticamente",
          description: "A imagem será ajustada para as dimensões compatíveis com o modelo selecionado."
        });
      } else if (type === 'mask') {
        setMaskImage(file);
        setMaskPreview(reader.result as string);
        toast({
          title: "Máscara adicionada",
          description: "A máscara será usada para edição de imagem."
        });
      } else if (type === 'control') {
        setControlImage(file);
        setControlPreview(reader.result as string);
        toast({
          title: "Imagem de controle adicionada",
          description: "A imagem será usada para Control Net."
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetImage = (type: 'main' | 'mask' | 'control') => {
    if (type === 'main') {
      setImageFile(null);
      setImagePreview(null);
    } else if (type === 'mask') {
      setMaskImage(null);
      setMaskPreview(null);
    } else if (type === 'control') {
      setControlImage(null);
      setControlPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation based on selected mode
    if (mode === "upscale" && !imageFile) {
      toast({
        title: "Imagem necessária",
        description: "Por favor, faça upload de uma imagem para melhorar a resolução.",
        variant: "destructive"
      });
      return;
    }
    
    if (mode === "edit" && (!imageFile || !maskImage)) {
      toast({
        title: "Imagens necessárias",
        description: "Por favor, faça upload da imagem base e da máscara para edição.",
        variant: "destructive"
      });
      return;
    }
    
    if (mode === "control" && !controlImage) {
      toast({
        title: "Imagem de controle necessária",
        description: "Por favor, faça upload de uma imagem de controle para Control Net.",
        variant: "destructive"
      });
      return;
    }
    
    await onGenerate(
      prompt, 
      engineId, 
      imageFile, 
      dimensions, 
      mode, 
      imageStrength,
      maskImage,
      controlImage,
      controlMode
    );
  };

  // Get appropriate dimensions based on selected model
  const getDimensionsOptions = () => {
    if (engineId.includes("xl-1024")) {
      // SDXL models use specific dimensions
      return VALID_DIMENSIONS.filter(dim => dim.sdxl);
    } else {
      // SD 1.6 and other models can use any dimensions
      return VALID_DIMENSIONS;
    }
  };

  // Update dimensions when model changes to ensure compatibility
  const handleEngineChange = (value: string) => {
    setEngineId(value);
    
    // Set appropriate default dimensions for the model
    if (value.includes("xl-1024")) {
      if (!dimensions.includes("1024") && !VALID_DIMENSIONS.find(d => d.sdxl && d.value === dimensions)) {
        setDimensions("1024x1024");
      }
    } else {
      // For SD 1.6, default to 512x512 if coming from SDXL
      if (dimensions === "1024x1024") {
        setDimensions("512x512"); 
      }
    }
    
    // Notify user if they've already uploaded an image
    if (imageFile) {
      toast({
        title: "Imagem de referência",
        description: "A imagem será redimensionada automaticamente para o novo modelo.",
      });
    }
  };

  const renderModeIcon = () => {
    switch (mode) {
      case "upscale":
        return <ArrowUp className="mr-2 h-5 w-5" />;
      case "edit":
        return <Pencil className="mr-2 h-5 w-5" />;
      case "control":
        return <Sliders className="mr-2 h-5 w-5" />;
      default:
        return <Wand2 className="mr-2 h-5 w-5" />;
    }
  };

  const getModeButtonText = () => {
    switch (mode) {
      case "upscale":
        return "Melhorar Resolução";
      case "edit":
        return "Editar Imagem";
      case "control":
        return "Gerar com Control Net";
      default:
        return "Gerar Imagem";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="mode-select">Modo</Label>
        <Select 
          value={mode} 
          onValueChange={setMode}
          disabled={isGenerating}
        >
          <SelectTrigger id="mode-select" className="w-full">
            <SelectValue placeholder="Selecione o modo" />
          </SelectTrigger>
          <SelectContent>
            {SD_MODES.map((modeOption) => (
              <SelectItem key={modeOption.value} value={modeOption.value}>
                {modeOption.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="engine-select">Modelo</Label>
        <Select 
          value={engineId} 
          onValueChange={handleEngineChange}
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
      
      {/* Image Upload Fields Based on Mode */}
      <div className="space-y-4">
        {/* Base Image Upload - for all modes except pure text-to-image generation */}
        {(mode === "upscale" || mode === "edit" || (mode === "generate" && true)) && (
          <div>
            <Label htmlFor="image-upload" className="block text-sm font-medium mb-2">
              {mode === "upscale" ? "Imagem para Melhorar" : 
               mode === "edit" ? "Imagem Base para Edição" : 
               "Imagem de Referência (Opcional)"}
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'main')}
              disabled={isGenerating}
              required={mode === "upscale" || mode === "edit"}
            />
            {imagePreview && (
              <div className="mt-2">
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Visualização" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResetImage('main')} 
                  className="mt-2"
                  type="button"
                >
                  Remover imagem
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Mask Image Upload - only for edit mode */}
        {mode === "edit" && (
          <div>
            <Label htmlFor="mask-upload" className="block text-sm font-medium mb-2">
              Máscara de Edição (áreas brancas serão modificadas)
            </Label>
            <Input
              id="mask-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, 'mask')}
              disabled={isGenerating}
              required
            />
            {maskPreview && (
              <div className="mt-2">
                <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                  <img 
                    src={maskPreview} 
                    alt="Máscara" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleResetImage('mask')} 
                  className="mt-2"
                  type="button"
                >
                  Remover máscara
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Control Image Upload - only for control mode */}
        {mode === "control" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="control-upload" className="block text-sm font-medium mb-2">
                Imagem de Controle
              </Label>
              <Input
                id="control-upload"
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'control')}
                disabled={isGenerating}
                required
              />
              {controlPreview && (
                <div className="mt-2">
                  <div className="relative w-full h-32 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={controlPreview} 
                      alt="Controle" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleResetImage('control')} 
                    className="mt-2"
                    type="button"
                  >
                    Remover imagem de controle
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="control-mode">Modo de Controle</Label>
              <Select 
                value={controlMode} 
                onValueChange={setControlMode}
                disabled={isGenerating}
              >
                <SelectTrigger id="control-mode" className="w-full">
                  <SelectValue placeholder="Selecione o modo de controle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="canny">Canny Edge</SelectItem>
                  <SelectItem value="depth">Depth Map</SelectItem>
                  <SelectItem value="pose">Pose</SelectItem>
                  <SelectItem value="seg">Segmentação</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
      
      {/* Prompt Field - not required for upscale mode */}
      <div>
        <Label htmlFor="prompt" className="block text-sm font-medium mb-2">
          {mode === "upscale" 
            ? "Instruções (opcional)" 
            : "Prompt de Geração"}
        </Label>
        <Textarea
          id="prompt"
          placeholder={
            mode === "upscale" 
              ? "Instruções opcionais para melhorar a imagem..." 
              : mode === "edit"
              ? "Descreva como deseja alterar as áreas marcadas pela máscara..."
              : mode === "control"
              ? "Descreva a imagem que você deseja gerar com base na imagem de controle..."
              : "Descreva em detalhes a imagem que você deseja gerar..."
          }
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          rows={4}
          className="resize-none"
          required={mode !== "upscale"}
        />
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="advanced">
          <AccordionTrigger className="text-sm">Configurações avançadas</AccordionTrigger>
          <AccordionContent>
            {mode === "generate" && !imageFile && (
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
                    {getDimensionsOptions().map((dim) => (
                      <SelectItem key={dim.value} value={dim.value}>
                        {dim.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {engineId.includes("xl-1024") 
                    ? "Modelos SDXL exigem dimensões específicas"
                    : "Stable Diffusion 1.6 é mais flexível com dimensões"}
                </p>
              </div>
            )}

            {(imageFile || mode === "edit") && (
              <div className="mb-4">
                <Label htmlFor="image-strength" className="block text-sm font-medium mb-2">
                  {mode === "edit" 
                    ? "Intensidade da edição: " 
                    : "Força da imagem original: "}
                  {imageStrength}
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
                  {mode === "edit" 
                    ? "Valores mais altos resultam em mudanças mais significativas nas áreas mascaradas."
                    : "Valores mais baixos mantêm mais da imagem original, valores mais altos permitem mais criatividade."}
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <Button 
        type="submit" 
        disabled={isGenerating || (mode !== "upscale" && !prompt.trim())} 
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            {renderModeIcon()}
            {getModeButtonText()}
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
