
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
import { GeneratedCreative } from "./CreativeGenerator";

interface CreativePreviewProps {
  creative: GeneratedCreative;
  onSave: () => void;
}

const CreativePreview = ({ creative, onSave }: CreativePreviewProps) => {
  const handleDownload = () => {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = creative.imageUrl;
    link.download = `creative-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Prévia do Criativo</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image Preview */}
          <div className="aspect-video bg-muted relative">
            <img 
              src={creative.imageUrl} 
              alt="Creative preview" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Text Content */}
          <div className="p-6 border-t md:border-t-0 md:border-l">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Headline:</h4>
                <p className="text-lg font-medium">{creative.title}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">Descrição:</h4>
                <p className="text-sm">{creative.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground">CTA:</h4>
                <div className="mt-1">
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-sm font-medium rounded">
                    {creative.cta}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end p-4 pt-0 mt-4 border-t">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download Imagem
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
