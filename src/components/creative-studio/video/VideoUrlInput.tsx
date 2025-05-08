
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

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
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700 text-sm font-medium">Requisitos para o URL da imagem</AlertTitle>
        <AlertDescription className="text-blue-600 text-xs">
          • A imagem deve estar publicamente acessível via HTTPS<br />
          • Use URLs diretos da imagem que terminem com extensão (.jpg, .png, etc)<br />
          • Recomendado: imgur.com (copie o link direto clicando com botão direito na imagem)<br />
          • Evite URLs com parâmetros de consulta (após o símbolo ?)<br />
          • Não use URLs encurtados ou redirecionados<br />
          • Se usar Google Drive, certifique-se de gerar um link direto público<br />
          • Para melhores resultados, use imagens claras e de alta qualidade
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default VideoUrlInput;
