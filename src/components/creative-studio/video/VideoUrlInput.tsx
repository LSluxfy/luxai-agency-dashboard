
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VideoUrlInputProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

const VideoUrlInput: React.FC<VideoUrlInputProps> = ({ imageUrl, setImageUrl }) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="video-image-url" className="block mb-1">URL da imagem:</Label>
        <Input
          id="video-image-url"
          type="url"
          placeholder="https://exemplo.com/sua-imagem.jpg"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          className="w-full"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Insira o URL de uma imagem publicamente acessível (iniciando com http:// ou https://)
        </p>
      </div>

      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Pré-visualização da imagem:</p>
          <div className="relative aspect-video bg-slate-100 rounded-md overflow-hidden flex items-center justify-center border">
            <img 
              src={imageUrl} 
              alt="Pré-visualização" 
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                // Show broken image state
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-destructive text-sm">
                Não foi possível carregar a imagem. Verifique se o URL está correto e a imagem é publicamente acessível.
              </span>
            </div>
          </div>
        </div>
      )}

      <Alert className="bg-blue-50 border-blue-100">
        <AlertDescription className="text-blue-800 text-xs">
          Para melhores resultados, use imagens nítidas com boa iluminação. Imagens de pessoas ou rostos funcionam melhor.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VideoUrlInput;
