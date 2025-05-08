
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import CreativeGenerator from "@/components/creative-studio/CreativeGenerator";
import CreativeGallery from "@/components/creative-studio/CreativeGallery";
import { GenerateImageButton } from "@/components/creative-studio/GenerateImageButton";
import { GenerateVideoButton } from "@/components/creative-studio/GenerateVideoButton";

const CreativeStudio = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  const [sdxlPrompt, setSdxlPrompt] = useState<string>("Imagem criativa de produto em estilo fotográfico profissional");
  
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
          Modelo Realistic Vision V3 para transformação de imagens ultra-realistas, SDXL para geração direta e Runway Gen-4 para conversão de imagem em vídeo.
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
            • Para gerar vídeo, forneça uma URL de imagem HTTPS pública
          </p>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="create">Criar Novo</TabsTrigger>
          <TabsTrigger value="sdxl">Gerar com SDXL</TabsTrigger>
          <TabsTrigger value="video">Imagem para Vídeo</TabsTrigger>
          <TabsTrigger value="gallery">Meus Criativos Salvos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-0">
          <CreativeGenerator />
        </TabsContent>
        
        <TabsContent value="sdxl" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-3">Gerar Imagem com SDXL</h2>
                <p className="text-muted-foreground mb-4">
                  Use o modelo SDXL da Stability AI para gerar imagens de alta qualidade a partir de descrições textuais.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Descrição da imagem:</label>
                  <textarea 
                    className="w-full h-24 p-2 border rounded-md" 
                    value={sdxlPrompt}
                    onChange={(e) => setSdxlPrompt(e.target.value)}
                    placeholder="Descreva a imagem que você deseja gerar..."
                  ></textarea>
                </div>
                <GenerateImageButton prompt={sdxlPrompt} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="mt-0">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold mb-3">Converter Imagem em Vídeo</h2>
                <p className="text-muted-foreground mb-4">
                  Use a tecnologia Runway Gen-4 para transformar imagens estáticas em vídeos curtos e dinâmicos.
                </p>
                <GenerateVideoButton />
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
