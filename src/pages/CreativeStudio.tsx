
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CreativeGenerator from "@/components/creative-studio/CreativeGenerator";
import CreativeGallery from "@/components/creative-studio/CreativeGallery";
import { GenerateWanVideoButton } from "@/components/creative-studio/GenerateWanVideoButton";
import StableDiffusionGenerator from "@/components/creative-studio/StableDiffusionGenerator";
import VideoGenerator from "@/components/creative-studio/video/VideoGenerator";

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
          Modelo Stable Diffusion XL para geração de imagens ultra-realistas, SVD para vídeos a partir de imagens e WAN 2.1 para geração de vídeo.
        </p>
        {/* Updated troubleshooting hint */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="text-amber-800 font-medium">Dicas para melhores resultados</h3>
          <p className="text-amber-700 text-sm">
            • Use imagens claras e com boa qualidade para melhores resultados<br/>
            • O Stable Diffusion XL oferece imagens de alta qualidade em até 1024x1024<br/>
            • O Stable Video Diffusion transforma imagens em vídeos curtos com movimento natural<br/>
            • Prompts detalhados ajudam a obter resultados mais precisos<br/>
            • A geração de imagens e vídeos pode levar alguns segundos para ser concluída
          </p>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="create">Criar Novo</TabsTrigger>
          <TabsTrigger value="stable-diffusion">Stable Diffusion XL</TabsTrigger>
          <TabsTrigger value="stability-video">Image-to-Video</TabsTrigger>
          <TabsTrigger value="wan-video">Vídeo com WAN 2.1</TabsTrigger>
          <TabsTrigger value="gallery">Meus Criativos Salvos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-0">
          <CreativeGenerator />
        </TabsContent>

        <TabsContent value="stable-diffusion" className="mt-0">
          <StableDiffusionGenerator />
        </TabsContent>
        
        <TabsContent value="stability-video" className="mt-0">
          <VideoGenerator />
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
