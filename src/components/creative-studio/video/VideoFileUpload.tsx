
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface VideoFileUploadProps {
  onFileSelected: (file: File) => void;
}

const VideoFileUpload: React.FC<VideoFileUploadProps> = ({ onFileSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreview(reader.result);
        setFileName(file.name);
        onFileSelected(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleClearFile = () => {
    setPreview(null);
    setFileName(null);
  };

  return (
    <div className="space-y-4">
      {!preview ? (
        <div className="border-2 border-dashed rounded-lg p-6 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
          <input 
            type="file" 
            id="video-file-upload" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
          <label htmlFor="video-file-upload" className="cursor-pointer w-full h-full block">
            <div className="flex flex-col items-center justify-center gap-2">
              <Upload className="h-8 w-8 text-slate-400" />
              <p className="text-sm font-medium">Clique para fazer upload ou arraste uma imagem aqui</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, ou GIF (Máximo 5MB)
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{fileName}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFile} 
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remover arquivo</span>
            </Button>
          </div>
          <div className="relative aspect-video rounded-md overflow-hidden border">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Para melhores resultados, use imagens nítidas com rostos bem definidos.
      </p>
    </div>
  );
};

export default VideoFileUpload;
