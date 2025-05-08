
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface VideoFileUploadProps {
  onFileSelected: (file: File) => void;
}

const VideoFileUpload = ({ onFileSelected }: VideoFileUploadProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validate file type (only images)
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido");
        return;
      }
      
      // Validate size (maximum 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("O arquivo é muito grande. Tamanho máximo permitido: 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Pass the file to parent component
      onFileSelected(file);
      
      // Clean up the previous URL when unmounting
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload">Upload de Imagem:</Label>
      <div className="grid gap-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="text-sm font-medium">
              Clique para fazer upload ou arraste uma imagem aqui
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, GIF até 5MB
            </span>
          </label>
        </div>
        
        {previewUrl && (
          <div className="mt-2">
            <p className="text-sm font-medium mb-2">Prévia:</p>
            <div className="relative aspect-square w-full max-w-xs mx-auto border rounded-md overflow-hidden">
              <img
                src={previewUrl}
                alt="Prévia da imagem"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {selectedFile?.name} ({(selectedFile?.size || 0) / 1024 < 1024 
                ? `${Math.round((selectedFile?.size || 0) / 1024)} KB` 
                : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoFileUpload;
