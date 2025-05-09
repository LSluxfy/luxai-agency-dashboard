
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CreativeGenerator from "@/components/creative-studio/CreativeGenerator";
import CreativeGallery from "@/components/creative-studio/CreativeGallery";
import { GenerateWanVideoButton } from "@/components/creative-studio/GenerateWanVideoButton";

const CreativeStudio = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Studio de Criativos com IA</h1>
        <p className="text-muted-foreground mt-2">
          Crie criativos profissionais para suas campanhas com comandos e imagens de referência. 
          Nossa IA gera imagens e textos prontos para anúncios.
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-2 py-0.5 rounded-sm">Novo!</span>{" "}
          Modelo Realistic Vision V3 para transformação de imagens ultra-realistas e WAN 2.1 para geração de vídeo.
        </p>
        {/* Updated troubleshooting hint */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="text-amber-800 font-medium">Dicas para melhores resultados</h3>
          <p className="text-amber-700 text-sm">
            • Use imagens claras e com boa qualidade para melhores resultados<br/>
            • O parâmetro "strength" define quanto da imagem original será mantida (0.21 = preserva mais detalhes)<br/>
            • O prompt deve descrever claramente o resultado desejado<br/>
            • A geração de imagens pode levar alguns minutos para ser concluída<br/>
            • Se a imagem não for gerada após várias tentativas, tente usar uma imagem diferente ou modificar o prompt<br/>
            • Para o botão Realistic Vision, certifique-se de que a imagem está publicamente acessível<br/>
            • Para gerar vídeo com WAN 2.1, forneça uma URL de imagem HTTPS pública
          </p>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="create">Criar Novo</TabsTrigger>
          <TabsTrigger value="wan-video">Vídeo com WAN 2.1</TabsTrigger>
          <TabsTrigger value="gallery">Meus Criativos Salvos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-0">
          <CreativeGenerator />
        </TabsContent>

        <TabsContent value="wan-video" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-3">Vídeo com WAN 2.1</h2>
                <p className="text-muted-foreground mb-4">
                  Use o modelo WAN 2.1 da WavesSpeedAI para criar vídeos realistas com movimentos naturais a partir de imagens estáticas.
                </p>
                <GenerateWanVideoButton />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-0">
          <CreativeGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreativeStudio;
