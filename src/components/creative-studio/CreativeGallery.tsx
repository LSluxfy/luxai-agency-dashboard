
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Download, Rocket, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import CreativeDetailModal from "./CreativeDetailModal";
import { GeneratedCreative } from "./CreativeGenerator";

interface StoredCreative {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  image_url: string;
  generated_title: string;
  generated_description: string;
  generated_cta: string;
  created_at: string;
}

const CreativeGallery = () => {
  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCreative, setSelectedCreative] = useState<GeneratedCreative | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCreatives = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('creatives')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        // Transform from database format to component format
        const formattedCreatives = (data as StoredCreative[]).map(item => ({
          id: item.id,
          imageUrl: item.image_url,
          title: item.generated_title,
          description: item.generated_description,
          cta: item.generated_cta,
          createdAt: item.created_at,
        }));
        
        setCreatives(formattedCreatives);
      } catch (error) {
        console.error("Error fetching creatives:", error);
        toast.error("Erro ao carregar seus criativos.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCreatives();
  }, [user]);

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
