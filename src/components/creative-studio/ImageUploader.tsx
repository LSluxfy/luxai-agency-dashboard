
import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, X, Image } from "lucide-react";
import { toast } from "sonner";
import { UploadedImage } from "./CreativeGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ImageUploaderProps {
  onImagesUploaded: (images: UploadedImage[]) => void;
  uploadedImages: UploadedImage[];
  maxImages: number;
  savedImages?: any[];
}

const ImageUploader = ({ onImagesUploaded, uploadedImages, maxImages, savedImages = [] }: ImageUploaderProps) => {
  const [activeTab, setActiveTab] = useState<string>("upload");

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    
    // Check file count limit
    if (files.length + uploadedImages.length > maxImages) {
      toast.error(`Você pode fazer upload de no máximo ${maxImages} imagens.`);
      return;
    }
    
    // Process each file
    const newImages: UploadedImage[] = files.map(file => {
      // Check file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/i)) {
        toast.error(`O arquivo ${file.name} não é um tipo de imagem válido.`);
        return null;
      }
      
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`O arquivo ${file.name} excede o limite de 5MB.`);
        return null;
      }
      
      return {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: URL.createObjectURL(file)
      };
    }).filter(Boolean) as UploadedImage[];
    
    if (newImages.length > 0) {
      onImagesUploaded([...uploadedImages, ...newImages]);
    }
    
    // Reset input
    e.target.value = '';
  }, [uploadedImages, maxImages, onImagesUploaded]);
  
  const handleRemoveImage = useCallback((id: string) => {
    const filteredImages = uploadedImages.filter(img => img.id !== id);
    onImagesUploaded(filteredImages);
  }, [uploadedImages, onImagesUploaded]);
  
  const handleSelectSavedImage = useCallback((imageUrl: string) => {
    // Check if we already have this image
    const existingImage = uploadedImages.find(img => img.url === imageUrl);
    if (existingImage) {
      toast.info("Esta imagem já foi selecionada");
      return;
    }
    
    // Check file count limit
    if (uploadedImages.length >= maxImages) {
      toast.error(`Você pode selecionar no máximo ${maxImages} imagens.`);
      return;
    }
    
    // Add the image to selected images
    const newImage: UploadedImage = {
      id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: new File([], "saved-image.jpg"), // dummy file
      url: imageUrl
    };
    
    onImagesUploaded([...uploadedImages, newImage]);
    toast.success("Imagem adicionada às referências");
  }, [uploadedImages, maxImages, onImagesUploaded]);
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">Upload de Imagens</TabsTrigger>
          <TabsTrigger value="gallery" disabled={savedImages.length === 0}>Minha Galeria</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative group">
                <div className="aspect-square rounded-md border overflow-hidden bg-muted">
                  <img 
                    src={img.url} 
                    alt="Imagem de referência" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <button 
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(img.id)}
                  type="button"
                  aria-label="Remover imagem"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {uploadedImages.length < maxImages && (
              <label className="aspect-square flex flex-col items-center justify-center rounded-md border border-dashed cursor-pointer hover:bg-accent/50 transition-colors">
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  multiple
                  onChange={handleFileChange}
                />
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  Adicionar imagem
                </span>
              </label>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            <p>Formatos aceitos: JPG, PNG, GIF</p>
            <p>Tamanho máximo: 5MB por arquivo</p>
          </div>
        </TabsContent>
        
        <TabsContent value="gallery">
          {savedImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {savedImages.map((image) => (
                <div 
                  key={image.id} 
                  className="aspect-square rounded-md border overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleSelectSavedImage(image.image_url)}
                >
                  <img 
                    src={image.image_url} 
                    alt={image.title || "Imagem salva"} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Você ainda não tem imagens salvas</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {uploadedImages.length > 0 && (
        <div className="mt-4 p-4 bg-muted/30 rounded-md">
          <h4 className="font-medium mb-2">Imagens selecionadas ({uploadedImages.length}/{maxImages})</h4>
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((img) => (
              <div key={img.id} className="relative">
                <div className="h-16 w-16 rounded border overflow-hidden">
                  <img 
                    src={img.url} 
                    alt="Miniatura" 
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm"
                  onClick={() => handleRemoveImage(img.id)}
                  aria-label="Remover"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
