
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { GeneratedCreative } from "./CreativeGenerator";

interface CreativePreviewProps {
  creative: GeneratedCreative;
  onSave: () => void;
}

const CreativePreview = ({ creative, onSave }: CreativePreviewProps) => {
  const handleDownload = () => {
    // In a real application, this would generate a downloadable file
    // For this example, we'll just open the image in a new tab
    window.open(creative.imageUrl, '_blank');
  };
  
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full">3</span>
          Criativo Gerado com IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Imagem Gerada:</p>
            <div className="aspect-video rounded-md overflow-hidden bg-muted border">
              <img 
                src={creative.imageUrl} 
                alt="Imagem gerada pela IA" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Título:</p>
              <p className="text-lg font-semibold">{creative.title}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Descrição:</p>
              <p className="text-base">{creative.description}</p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Chamada para ação (CTA):</p>
              <p className="text-base font-medium bg-primary/10 text-primary inline-block px-3 py-1 rounded">
                {creative.cta}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Baixar
        </Button>
        <Button onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Criativo
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreativePreview;
