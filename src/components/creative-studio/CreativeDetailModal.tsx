
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Rocket } from "lucide-react";
import { GeneratedCreative } from "./CreativeGenerator";

interface CreativeDetailModalProps {
  creative: GeneratedCreative;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onUseInCampaign: () => void;
}

const CreativeDetailModal = ({
  creative,
  isOpen,
  onClose,
  onDownload,
  onUseInCampaign
}: CreativeDetailModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Criativo</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 py-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Imagem:</p>
            <div className="rounded-md overflow-hidden border bg-muted">
              <img 
                src={creative.imageUrl} 
                alt={creative.title} 
                className="w-full h-auto"
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
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Data de Criação:</p>
              <p className="text-sm">
                {new Date(creative.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            Baixar
          </Button>
          <Button onClick={onUseInCampaign}>
            <Rocket className="mr-2 h-4 w-4" />
            Usar em Campanha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreativeDetailModal;
