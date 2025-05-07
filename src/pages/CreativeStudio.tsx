
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
