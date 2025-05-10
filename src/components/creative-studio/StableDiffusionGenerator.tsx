
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useStableDiffusion } from "@/hooks/useStableDiffusion";
import { GenerationForm } from "@/components/creative-studio/stable-diffusion/GenerationForm";
import { ImagePreviewArea } from "@/components/creative-studio/stable-diffusion/ImagePreviewArea";

export default function StableDiffusionGenerator() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const {
    isGenerating,
    generatedImage,
    generationProgress,
    generateImage,
  } = useStableDiffusion();

  const handleGenerate = async (
    prompt: string,
    engineId: string,
    imageFile: File | null,
    dimensions: string
  ) => {
    await generateImage(prompt, engineId, imageFile, dimensions);
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
          
          <GenerationForm 
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
