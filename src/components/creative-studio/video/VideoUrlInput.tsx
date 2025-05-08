
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface VideoUrlInputProps {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}

const VideoUrlInput = ({ imageUrl, setImageUrl }: VideoUrlInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="image-url">URL da Imagem (HTTPS):</Label>
      <Input
        id="image-url"
        value={imageUrl}
        onChange={(e) => setImageUrl(e.target.value)}
        placeholder="https://exemplo.com/imagem.jpg"
        className="w-full"
      />
      <p className="text-xs text-muted-foreground">
        Certifique-se de que a imagem esteja publicamente acessível via HTTPS.
      </p>
    </div>
  );
};

export default VideoUrlInput;
