
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { InfoCircle } from "lucide-react";

interface VideoUrlInputProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

const VideoUrlInput = ({ imageUrl, setImageUrl }: VideoUrlInputProps) => {
  return (
    <div className="space-y-3">
      <Label htmlFor="image-url">URL da Imagem (HTTPS):</Label>
      <Input
        id="image-url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg"
        className="w-full"
      />
      
      <Alert className="bg-blue-50 border-blue-200">
        <InfoCircle className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700 text-sm font-medium">Requisitos para o URL da imagem</AlertTitle>
        <AlertDescription className="text-blue-600 text-xs">
          • A imagem deve estar publicamente acessível via HTTPS<br />
          • URLs de sites como Imgur, Postimages ou Drive público funcionam melhor<br />
          • Certifique-se de que o link termine com uma extensão de imagem (.jpg, .png, etc)
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VideoUrlInput;
