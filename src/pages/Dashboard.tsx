
import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import MyFiles from "./MyFiles";
import Support from "./Support";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "dashboard";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle direct navigation to the MyFiles or Support pages
  if (initialTab === "files") {
    return <Navigate to="/my-files" replace />;
  }

  if (initialTab === "support") {
    return <Navigate to="/support" replace />;
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard Principal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <div className="bg-card rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Bem-vindo ao seu Dashboard</h2>
            <p className="text-muted-foreground">
              Este é o seu painel de controle principal. Aqui você pode visualizar métricas de campanhas,
              dados de desempenho e acessar todas as funcionalidades do sistema.
            </p>
            
            {/* Dashboard content would go here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Campanhas Ativas</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Criativos Gerados</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Contas Conectadas</h3>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
              <div className="flex flex-col space-y-2">
                <a href="/onboarding" className="text-blue-600 hover:underline">Criar nova campanha</a>
                <a href="/creative-studio" className="text-blue-600 hover:underline">Gerar criativos com IA</a>
                <a href="/facebook" className="text-blue-600 hover:underline">Conectar conta Facebook</a>
                <a href="/my-files" className="text-blue-600 hover:underline">Gerenciar arquivos</a>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Sua Conta</h2>
              <div className="flex flex-col space-y-2">
                <p><span className="font-medium">Plano:</span> Iniciante</p>
                <p><span className="font-medium">Status:</span> Ativo</p>
                <p><span className="font-medium">Próxima cobrança:</span> 10/06/2025</p>
                <a href="/finance" className="text-blue-600 hover:underline">Ver detalhes do plano</a>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
