
import { Loader2 } from "lucide-react";

interface ImagePreviewAreaProps {
  imagePreview: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
}

export const ImagePreviewArea: React.FC<ImagePreviewAreaProps> = ({
  imagePreview,
  generatedImage,
  isGenerating,
}) => {
  return (
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
  );
};
