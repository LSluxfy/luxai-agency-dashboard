
import { PlusCircle, Activity, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import MetricCard from "@/components/ui-custom/MetricCard";
import CampaignCard from "@/components/ui-custom/CampaignCard";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Mock data for demonstration
const mockCampaigns = [
  {
    id: "1",
    name: "Campanha de Leads - E-commerce",
    objective: "Leads",
    status: "active" as const,
    createdAt: "2025-04-24",
    metrics: {
      impressions: 12540,
      clicks: 837,
      conversions: 126
    }
  },
  {
    id: "2",
    name: "Brand Awareness - Novo Produto",
    objective: "Alcance",
    status: "paused" as const,
    createdAt: "2025-04-15",
    metrics: {
      impressions: 45320,
      clicks: 2104,
      conversions: 0
    }
  },
  {
    id: "3",
    name: "Conversões - Venda de Curso",
    objective: "Conversão",
    status: "completed" as const,
    createdAt: "2025-03-10",
    metrics: {
      impressions: 28705,
      clicks: 3621,
      conversions: 482
    }
  },
  {
    id: "4",
    name: "Webinar - Inscrições",
    objective: "Leads",
    status: "draft" as const,
    createdAt: "2025-05-01"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        // Use full_name if available, otherwise fallback to username
        setUsername(data.full_name || data.username || "Usuário");
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };
    
    fetchUserProfile();
  }, [user]);

  return (
    <div>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bem-vindo, {username}!</h1>
          <p className="text-muted-foreground mt-1">
            Aqui está o resumo das suas campanhas
          </p>
        </div>
        <Button 
          onClick={() => navigate("/onboarding")} 
          className="mt-4 md:mt-0 btn-pulse" 
          size="lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Criar Nova Campanha
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <MetricCard
          title="Campanhas Ativas"
          value="2"
          description="Campanhas em execução"
          icon={<Activity className="h-5 w-5" />}
          trend={{ value: 50, positive: true }}
        />
        <MetricCard
          title="Leads Gerados"
          value="608"
          description="Últimos 30 dias"
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 12.5, positive: true }}
        />
        <MetricCard
          title="ROI Estimado"
          value="287%"
          description="Retorno sobre investimento"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 24, positive: true }}
        />
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Suas Campanhas</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCampaigns.map(campaign => (
          <CampaignCard key={campaign.id} {...campaign} />
        ))}
      </div>
      
      <div className="fixed bottom-8 right-8 md:hidden">
        <Button 
          onClick={() => navigate("/onboarding")} 
          className="rounded-full h-14 w-14 shadow-lg btn-pulse" 
          size="icon"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
