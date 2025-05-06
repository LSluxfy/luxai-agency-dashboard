
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { Link } from "react-router-dom";

type CampaignStatus = "active" | "paused" | "draft" | "completed";

type CampaignCardProps = {
  id: string;
  name: string;
  objective: string;
  status: CampaignStatus;
  createdAt: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
  };
};

const statusConfig = {
  active: { label: "Ativa", color: "bg-green-100 text-green-800" },
  paused: { label: "Pausada", color: "bg-yellow-100 text-yellow-800" },
  draft: { label: "Rascunho", color: "bg-gray-100 text-gray-800" },
  completed: { label: "Concluída", color: "bg-blue-100 text-blue-800" },
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("pt-BR").format(num);
};

const CampaignCard = ({ id, name, objective, status, createdAt, metrics }: CampaignCardProps) => {
  const { label, color } = statusConfig[status] || statusConfig.draft;
  
  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{name}</CardTitle>
          <Badge className={color}>{label}</Badge>
        </div>
        <CardDescription>
          {objective} • Criada em {new Date(createdAt).toLocaleDateString("pt-BR")}
        </CardDescription>
      </CardHeader>
      
      {metrics && (
        <CardContent className="pb-2">
          <div className="grid grid-cols-3 gap-2 text-sm">
            {metrics.impressions !== undefined && (
              <div>
                <p className="text-muted-foreground">Impressões</p>
                <p className="font-medium">{formatNumber(metrics.impressions)}</p>
              </div>
            )}
            {metrics.clicks !== undefined && (
              <div>
                <p className="text-muted-foreground">Cliques</p>
                <p className="font-medium">{formatNumber(metrics.clicks)}</p>
              </div>
            )}
            {metrics.conversions !== undefined && (
              <div>
                <p className="text-muted-foreground">Conversões</p>
                <p className="font-medium">{formatNumber(metrics.conversions)}</p>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      <CardFooter className="pt-2">
        <Button asChild variant="ghost" size="sm" className="ml-auto hover-scale">
          <Link to={`/campaign/${id}`}>
            <Eye className="w-4 h-4 mr-2" /> Visualizar
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CampaignCard;
