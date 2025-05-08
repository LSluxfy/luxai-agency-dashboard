
import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CreativeGenerator from "@/components/creative-studio/CreativeGenerator";
import CreativeGallery from "@/components/creative-studio/CreativeGallery";

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
          Experimente o modelo Realistic Vision para imagens ultra-realistas.
        </p>
        {/* Added troubleshooting hint for Replicate API */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <h3 className="text-amber-800 font-medium">Dica para geração de imagens</h3>
          <p className="text-amber-700 text-sm">
            Para melhores resultados com o modelo Realistic Vision, recomendamos imagens claras e com boa qualidade. 
            Se encontrar problemas ao gerar imagens, tente novamente com outra imagem ou ajuste o prompt.
          </p>
        </div>
      </header>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="create">Criar Novo</TabsTrigger>
          <TabsTrigger value="gallery">Meus Criativos Salvos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="mt-0">
          <CreativeGenerator />
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-0">
          <CreativeGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreativeStudio;
