
import { useState } from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

interface PricingProps {
  onSelect: () => void;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Iniciante",
    price: 0,
    description: "Ideal para testar e conhecer a plataforma",
    features: [
      "1 Conta do Facebook",
      "2 Campanhas por mês",
      "5 Criativos com IA",
      "Relatórios básicos",
      "Suporte por email"
    ],
    cta: "Começar teste grátis"
  },
  {
    name: "Profissional",
    price: 197,
    description: "Perfeito para profissionais e pequenas empresas",
    features: [
      "3 Contas do Facebook",
      "15 Campanhas por mês",
      "50 Criativos com IA",
      "Relatórios avançados",
      "Suporte prioritário por email",
      "Integração com CRM"
    ],
    cta: "Selecionar plano",
    popular: true
  },
  {
    name: "Agência",
    price: 497,
    description: "Solução completa para agências e grandes empresas",
    features: [
      "10 Contas do Facebook",
      "Campanhas ilimitadas",
      "200 Criativos com IA",
      "Relatórios personalizados",
      "Suporte dedicado",
      "API completa",
      "White Label"
    ],
    cta: "Falar com consultor"
  }
];

const Pricing = ({ onSelect }: PricingProps) => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Planos <span className="text-primary">para todos</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Escolha o plano ideal para seu negócio crescer com automação inteligente
          </p>
          
          <div className="mt-8 inline-flex p-1 border rounded-full bg-muted/50">
            <button
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                billingCycle === "monthly"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              )}
              onClick={() => setBillingCycle("monthly")}
            >
              Mensal
            </button>
            <button
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all relative",
                billingCycle === "annual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              )}
              onClick={() => setBillingCycle("annual")}
            >
              Anual
              <span className="absolute -top-3 -right-10 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                -20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, index) => {
            const price = billingCycle === "annual" 
              ? Math.floor(tier.price * 0.8)
              : tier.price;
              
            return (
              <div
                key={index}
                className={cn(
                  "rounded-2xl overflow-hidden relative",
                  tier.popular
                    ? "border-2 border-primary shadow-xl shadow-primary/10"
                    : "border border-border shadow-lg"
                )}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-bl-lg">
                      Mais popular
                    </div>
                  </div>
                )}
                
                <div className="p-6 md:p-8 bg-card">
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <div className="mt-4 flex items-end">
                    <div className="text-4xl font-extrabold">
                      {price === 0 ? "Grátis" : `R$${price}`}
                    </div>
                    {price > 0 && (
                      <div className="text-muted-foreground ml-2 mb-1">
                        /mês
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-muted-foreground">{tier.description}</p>
                  
                  <div className="mt-6">
                    <Button
                      onClick={onSelect}
                      className={cn(
                        "w-full justify-center py-6",
                        tier.popular 
                          ? "bg-primary hover:bg-primary/90" 
                          : ""
                      )}
                      variant={tier.popular ? "default" : "outline"}
                    >
                      {tier.cta}
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-6 md:p-8 bg-card border-t">
                  <p className="font-medium mb-4">O que está incluído:</p>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <Check size={16} className="text-green-500" />
                        </div>
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
