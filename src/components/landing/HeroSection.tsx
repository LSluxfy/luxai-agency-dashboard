
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Boxes } from "@/components/ui/background-boxes";

interface HeroSectionProps {
  onStartTrial: () => void;
  onWatchDemo: () => void;
}

const HeroSection = ({ onStartTrial, onWatchDemo }: HeroSectionProps) => {
  return (
    <section
      id="about"
      className="relative min-h-[90vh] flex items-center overflow-hidden pt-20"
    >
      <div className="absolute inset-0 bg-background/80 z-10" />
      
      {/* Boxes Background */}
      <div className="absolute inset-0 z-0 bg-slate-900 w-full h-full">
        <div className="absolute inset-0 z-0 bg-slate-900 w-full h-full">
          <div className="absolute inset-0 w-full h-full bg-slate-900 [mask-image:radial-gradient(transparent,white)]" />
          <Boxes />
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-20 z-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="text-primary">Crie campanhas</span> com IA em{" "}
              <span className="text-primary">1 clique</span>
            </h1>
            
            <p className="text-xl text-foreground/80 md:pr-10 max-w-xl">
              A primeira agência de marketing automatizada por inteligência artificial. 
              Conecte sua conta, defina seu objetivo e nossa IA faz todo o trabalho.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Button 
                onClick={onStartTrial} 
                size="lg" 
                className="text-base py-6 px-8 font-medium flex items-center"
              >
                Comece agora <ArrowRight className="ml-2" />
              </Button>
              
              <Button 
                onClick={onWatchDemo} 
                size="lg" 
                variant="outline" 
                className="text-base py-6 px-8 font-medium flex items-center"
              >
                <Play size={18} className="mr-2" /> Ver demonstração
              </Button>
            </div>
            
            <div className="mt-8 text-sm text-muted-foreground">
              ✓ Teste gratuito por 7 dias ✓ Sem necessidade de cartão de crédito
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full transform -translate-y-10 scale-75 animate-pulse"></div>
              <div className="relative border-4 border-primary/20 bg-card/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h3 className="text-2xl font-bold text-center mb-4">Marketing Automatizado</h3>
                <p className="text-center text-lg mb-4">
                  Nossa IA cria, otimiza e gerencia suas campanhas de forma automatizada para maximizar seus resultados.
                </p>
                <div className="flex justify-center">
                  <Button onClick={onStartTrial} className="w-full max-w-xs">
                    Experimente agora
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowRight size={24} className="rotate-90 text-primary" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
