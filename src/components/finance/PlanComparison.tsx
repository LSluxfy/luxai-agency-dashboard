
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: number;
  plan_name: string;
  facebook_accounts_limit: number;
  monthly_campaigns_limit: number;
  ai_creatives_limit: number;
  price_cents: number;
}

interface PlanComparisonProps {
  plans: Plan[];
  currentPlan: string;
}

const PlanComparison = ({ plans, currentPlan }: PlanComparisonProps) => {
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    // In a real application, this would trigger the Stripe checkout
    toast({
      title: "Em desenvolvimento",
      description: `Funcionalidade de upgrade para o plano ${planName} em desenvolvimento.`,
    });
  };

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price_cents - b.price_cents);

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h2 className="text-3xl font-bold">Escolha o plano ideal para você</h2>
        <p className="text-muted-foreground mt-2">
          Compare os planos e escolha o que melhor atende às suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sortedPlans.map((plan) => {
          const isCurrentPlan = plan.plan_name === currentPlan;
          
          return (
            <Card 
              key={plan.id}
              className={`overflow-hidden ${
                isCurrentPlan 
                  ? "border-primary shadow-lg ring-2 ring-primary/30" 
                  : ""
              }`}
            >
              <div className={`p-6 ${isCurrentPlan ? "bg-primary text-primary-foreground" : ""}`}>
                <h3 className="text-2xl font-bold">{plan.plan_name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold">
                    {(plan.price_cents / 100).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0
                    })}
                  </span>
                  <span className="ml-1 text-sm">/mês</span>
                </div>
                {isCurrentPlan && (
                  <div className="mt-2 inline-block bg-primary-foreground/20 text-sm font-medium py-1 px-2 rounded">
                    Seu plano atual
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>
                      <strong>{plan.facebook_accounts_limit}</strong> {plan.facebook_accounts_limit > 1 ? 'contas' : 'conta'} do Facebook
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>
                      <strong>{plan.monthly_campaigns_limit}</strong> campanhas por mês
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>
                      <strong>{plan.ai_creatives_limit}</strong> criativos com IA
                    </span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span>Suporte por email</span>
                  </li>
                  {plan.plan_name !== 'INICIANTE' && (
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Relatórios avançados</span>
                    </li>
                  )}
                  {plan.plan_name === 'MASTER' && (
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <span>Suporte prioritário</span>
                    </li>
                  )}
                </ul>

                <div className="mt-6">
                  {isCurrentPlan ? (
                    <Button className="w-full" variant="outline" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(plan.plan_name)}
                    >
                      Fazer Upgrade
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PlanComparison;
