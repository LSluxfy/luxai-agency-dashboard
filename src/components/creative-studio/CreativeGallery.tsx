
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import CreativeDetailModal from "./CreativeDetailModal";
import { GeneratedCreative } from "./CreativeGenerator";

const CreativeGallery = () => {
  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCreative, setSelectedCreative] = useState<GeneratedCreative | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // In a real application, this would fetch from an API or database
    // Simulating API fetch with mock data
    const fetchCreatives = async () => {
      try {
        setLoading(true);
        
        // Simulate network latency
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockCreatives: GeneratedCreative[] = [
          {
            id: 'creative-1',
            imageUrl: 'https://placehold.co/600x400/1A73E8/FFFFFF/png?text=Criativo+1',
            title: 'Transforme sua vida com nosso produto',
            description: 'Resultados comprovados para uma vida mais saudável e feliz.',
            cta: 'EXPERIMENTE AGORA',
            createdAt: '2025-05-01T14:30:00Z'
          },
          {
            id: 'creative-2',
            imageUrl: 'https://placehold.co/600x400/1A73E8/FFFFFF/png?text=Criativo+2',
            title: 'Promoção exclusiva por tempo limitado',
            description: 'Aproveite descontos especiais em nossa linha premium.',
            cta: 'GARANTA O SEU',
            createdAt: '2025-04-28T09:15:00Z'
          },
          {
            id: 'creative-3',
            imageUrl: 'https://placehold.co/600x400/1A73E8/FFFFFF/png?text=Criativo+3',
            title: 'Novidade que vai surpreender você',
            description: 'Descubra o segredo que está transformando o mercado.',
            cta: 'SAIBA MAIS',
            createdAt: '2025-04-25T16:45:00Z'
          }
        ];
        
        setCreatives(mockCreatives);
      } catch (error) {
        console.error("Error fetching creatives:", error);
        toast.error("Erro ao carregar seus criativos.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreatives();
  }, []);

  const handleViewCreative = (creative: GeneratedCreative) => {
    setSelectedCreative(creative);
    setIsModalOpen(true);
  };
  
  const handleDownloadCreative = (creative: GeneratedCreative) => {
    // In a real app, this would download the actual files
    window.open(creative.imageUrl, '_blank');
    toast.success("Download iniciado!");
  };
  
  const handleUseInCampaign = (creative: GeneratedCreative) => {
    // In a real app, this would integrate with the campaign module
    toast.success("Criativo adicionado à campanha!");
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando seus criativos...</p>
      </div>
    );
  }
  
  if (creatives.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xl font-medium mb-4">Você ainda não tem criativos salvos</p>
        <p className="text-muted-foreground mb-6">
          Crie seu primeiro criativo na aba "Criar Novo"
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Meus Criativos Salvos</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatives.map(creative => (
          <Card key={creative.id} className="overflow-hidden hover-scale">
            <div className="aspect-video relative group">
              <img 
                src={creative.imageUrl} 
                alt={creative.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center p-4">
                <h3 className="text-white font-medium text-center mb-2">{creative.title}</h3>
                <p className="text-white/80 text-sm text-center mb-4 line-clamp-3">{creative.description}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleViewCreative(creative)}>
                    <Eye className="h-4 w-4 mr-1" /> Ver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadCreative(creative)}>
                    <Download className="h-4 w-4 mr-1" /> Baixar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleUseInCampaign(creative)}>
                    <Rocket className="h-4 w-4 mr-1" /> Usar
                  </Button>
                </div>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="font-medium truncate">{creative.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(creative.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {selectedCreative && (
        <CreativeDetailModal
          creative={selectedCreative}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownload={() => handleDownloadCreative(selectedCreative)}
          onUseInCampaign={() => handleUseInCampaign(selectedCreative)}
        />
      )}
    </div>
  );
};

export default CreativeGallery;
