
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useEnhancedStableDiffusion } from "@/hooks/useEnhancedStableDiffusion";
import { EnhancedGenerationForm } from "@/components/creative-studio/stable-diffusion/EnhancedGenerationForm";
import { ImagePreviewArea } from "@/components/creative-studio/stable-diffusion/ImagePreviewArea";

export default function StableDiffusionGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const {
    isGenerating,
    generatedImage,
    generationProgress,
    generateImage,
  } = useEnhancedStableDiffusion();

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
    // Call generate with all required parameters
    await generateImage(
      prompt, 
      engineId, 
      imageFile, 
      dimensions, 
      mode,
      imageStrength,
      maskImage || null,
      controlImage || null,
      controlMode
    );
  };

  return (
    <Card>
      <CardContent className="pt-6 grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Stable Diffusion XL</h2>
          <p className="text-muted-foreground">
            Gere e edite imagens de alta qualidade com o modelo Stable Diffusion XL da Stability AI.
            Agora com opções de upscale, edição com máscara e controle.
          </p>
          
          <EnhancedGenerationForm 
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            generationProgress={generationProgress}
            imageFile={imageFile}
            setImageFile={setImageFile}
            imagePreview={imagePreview}
            setImagePreview={setImagePreview}
          />
        </div>
        
        <ImagePreviewArea 
          imagePreview={imagePreview}
          generatedImage={generatedImage}
          isGenerating={isGenerating}
        />
      </CardContent>
    </Card>
  );
}
