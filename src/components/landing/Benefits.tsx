
import { Star, Zap, TrendingUp, Clock, Award, Shield } from "lucide-react";

const benefits = [
  {
    icon: Star,
    title: "Criação automatizada",
    description: "Campanhas completas criadas pela IA em segundos, sem necessidade de conhecimento técnico"
  },
  {
    icon: TrendingUp,
    title: "Otimização contínua",
    description: "Algoritmos avançados ajustam sua campanha diariamente para maximizar resultados"
  },
  {
    icon: Zap,
    title: "Menor custo por lead",
    description: "Reduza até 40% o custo de aquisição com segmentação inteligente e anúncios otimizados"
  },
  {
    icon: Clock,
    title: "Tempo economizado",
    description: "O que levaria dias agora é feito em minutos, liberando seu tempo para o que realmente importa"
  },
  {
    icon: Award,
    title: "Resultados superiores",
    description: "Performance comprovadamente melhor que campanhas criadas manualmente por especialistas"
  },
  {
    icon: Shield,
    title: "Conformidade total",
    description: "Suas campanhas sempre em conformidade com as políticas mais recentes do Facebook"
  }
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Por que escolher a <span className="text-primary">LuxAI</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossa plataforma revoluciona a forma como você gerencia suas campanhas de marketing digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div 
              key={index}
              className="flex gap-5 p-6 rounded-xl hover:bg-card/60 transition-all hover:shadow-md group"
            >
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <benefit.icon size={24} />
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
