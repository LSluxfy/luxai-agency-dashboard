
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Play, Pause, Edit, Image, Video, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

// Mock campaign data
const mockCampaign = {
  id: "1",
  name: "Campanha de Leads - E-commerce",
  objective: "Leads",
  status: "active" as "active" | "paused" | "draft" | "completed",
  createdAt: "2025-04-24",
  budget: 2500,
  location: "brasil",
  creatives: [
    { name: "banner-principal.jpg", type: "image" },
    { name: "produto-demo.mp4", type: "video" },
    { name: "catalogo.pdf", type: "pdf" }
  ],
  strategy: `# Estratégia de Marketing Digital

## Visão Geral
Esta campanha foi criada para maximizar a geração de leads qualificados para o seu e-commerce, focando em um público interessado em seus produtos principais.

## Canais Recomendados
- **Facebook e Instagram Ads**: Anúncios de formulário de leads e carrossel de produtos
- **Google Ads**: Campanha de pesquisa com extensão de formulário de lead
- **LinkedIn**: Anúncios de geração de leads para público B2B

## Segmentação de Público
- Idade: 25-45 anos
- Interesses: Compras online, tecnologia, lifestyle
- Comportamento: Visitantes frequentes de e-commerces

## Ciclo de Nutrição Recomendado
1. Lead capture via formulário
2. Email de boas-vindas com oferta especial (24h)
3. Apresentação dos produtos mais vendidos (3 dias)
4. Case de sucesso/depoimento (5 dias)
5. Oferta com desconto por tempo limitado (7 dias)

## Métricas a Monitorar
- Custo por Lead (CPL)
- Taxa de conversão dos formulários
- ROAS (Return on Ad Spend)
- Taxa de abertura e clique dos emails
`,
  metrics: {
    impressions: 12540,
    clicks: 837,
    conversions: 126,
    ctr: 6.67,
    cpc: 2.14,
    cpl: 18.75
  }
};

const statusConfig = {
  active: { label: "Ativa", color: "bg-green-100 text-green-800" },
  paused: { label: "Pausada", color: "bg-yellow-100 text-yellow-800" },
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-800" },
  completed: { label: "Concluída", color: "bg-blue-100 text-blue-800" },
};

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState(mockCampaign);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Function to toggle campaign status
  const toggleStatus = () => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    setCampaign({ ...campaign, status: newStatus });
    
    toast({
      title: newStatus === "active" ? "Campanha ativada" : "Campanha pausada",
      description: `A campanha foi ${newStatus === "active" ? "ativada" : "pausada"} com sucesso.`,
    });
  };
  
  // Function to handle clicking edit
  const handleEdit = () => {
    navigate(`/onboarding?edit=${id}`);
  };
  
  const { label, color } = statusConfig[campaign.status] || statusConfig.draft;
  
  const getCreativeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };
  
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate("/dashboard")}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
          <div className="flex items-center gap-2">
            <Badge className={color}>{label}</Badge>
            <span className="text-sm text-muted-foreground">
              Criada em {new Date(campaign.createdAt).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <CardHeader className="pb-0">
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="overview" className="flex-1 sm:flex-initial">Visão Geral</TabsTrigger>
                <TabsTrigger value="analytics" className="flex-1 sm:flex-initial">Analytics</TabsTrigger>
                <TabsTrigger value="config" className="flex-1 sm:flex-initial">Configuração</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-6">
              <TabsContent value="overview" className="m-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">Objetivo</h3>
                    <p>{campaign.objective}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Estratégia da IA</h3>
                    <Collapsible
                      open={isExpanded}
                      onOpenChange={setIsExpanded}
                      className="bg-accent/50 rounded-md p-4"
                    >
                      <div className="whitespace-pre-line">
                        {isExpanded 
                          ? campaign.strategy 
                          : campaign.strategy.substring(0, 300) + "..."}
                      </div>
                      <CollapsibleTrigger asChild className="w-full pt-2">
                        <Button variant="ghost" size="sm" className="mt-2 w-full border-t border-border">
                          {isExpanded ? (
                            <div className="flex items-center">
                              <ChevronUp className="h-4 w-4 mr-2" />
                              <span>Ver menos</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <ChevronDown className="h-4 w-4 mr-2" />
                              <span>Ver estratégia completa</span>
                            </div>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent />
                    </Collapsible>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-2">Orçamento</h3>
                      <p className="font-semibold">
                        R$ {campaign.budget.toLocaleString("pt-BR")} /mês
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Localização</h3>
                      <p className="capitalize">
                        {campaign.location === "brasil" 
                          ? "Todo o Brasil" 
                          : `Região ${campaign.location}`}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="analytics" className="m-0">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-accent/50 rounded-md">
                      <p className="text-sm text-muted-foreground">Impressões</p>
                      <p className="text-xl font-semibold">{campaign.metrics.impressions.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-md">
                      <p className="text-sm text-muted-foreground">Cliques</p>
                      <p className="text-xl font-semibold">{campaign.metrics.clicks.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-md">
                      <p className="text-sm text-muted-foreground">Conversões</p>
                      <p className="text-xl font-semibold">{campaign.metrics.conversions.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-md">
                      <p className="text-sm text-muted-foreground">CTR</p>
                      <p className="text-xl font-semibold">{campaign.metrics.ctr}%</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-md">
                      <p className="text-sm text-muted-foreground">CPC</p>
                      <p className="text-xl font-semibold">R$ {campaign.metrics.cpc}</p>
                    </div>
                    <div className="p-4 bg-accent/50 rounded-md">
                      <p className="text-sm text-muted-foreground">CPL</p>
                      <p className="text-xl font-semibold">R$ {campaign.metrics.cpl}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground text-center">
                      Dados dos últimos 30 dias
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="config" className="m-0">
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Configurações avançadas da campanha estarão disponíveis em breve.
                  </p>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Criativos</CardTitle>
              <CardDescription>
                Arquivos usados na campanha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {campaign.creatives.map((creative, index) => (
                  <li key={index} className="flex items-center p-2 bg-accent/50 rounded-md">
                    <div className="p-1.5 bg-background rounded mr-3">
                      {getCreativeIcon(creative.type)}
                    </div>
                    <span className="text-sm truncate">{creative.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ações</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col space-y-2">
              {campaign.status === "active" ? (
                <Button onClick={toggleStatus} variant="outline" className="w-full">
                  <Pause className="mr-2 h-4 w-4" />
                  Pausar Campanha
                </Button>
              ) : (
                <Button onClick={toggleStatus} variant="default" className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  Ativar Campanha
                </Button>
              )}
              <Button onClick={handleEdit} variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Editar Campanha
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;
