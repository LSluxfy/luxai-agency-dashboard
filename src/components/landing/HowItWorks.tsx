
import { CheckCircle, Settings, LineChart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Conecte sua conta",
    description: "Integre a LuxAI com sua conta do Facebook Ads em apenas um clique.",
    icon: CheckCircle,
  },
  {
    title: "Configure sua campanha",
    description: "Defina seu objetivo, público-alvo e orçamento em uma interface simples.",
    icon: Settings,
  },
  {
    title: "A IA otimiza tudo",
    description: "Nossa inteligência artificial cria e otimiza anúncios automaticamente.",
    icon: Zap,
  },
  {
    title: "Analise os resultados",
    description: "Acompanhe métricas em tempo real e veja o desempenho da sua campanha.",
    icon: LineChart,
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Como <span className="text-primary">Funciona</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Um processo simplificado que transforma a maneira como você cria
            e gerencia suas campanhas de marketing.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 transform -translate-y-1/2 z-0"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10">
            {steps.map((step, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-all bg-card hover:scale-105">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
                    <step.icon size={32} />
                  </div>
                  
                  <div className="mb-3 text-2xl font-semibold flex items-center space-x-2">
                    <span className="text-primary">{index + 1}.</span>
                    <span>{step.title}</span>
                  </div>
                  
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
