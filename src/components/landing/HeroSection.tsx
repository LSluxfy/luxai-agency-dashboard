
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PulseBeams } from "@/components/ui/pulse-beams";

interface HeroSectionProps {
  onStartTrial: () => void;
  onWatchDemo: () => void;
}

const beams = [
  {
    path: "M269 220.5H16.5C10.9772 220.5 6.5 224.977 6.5 230.5V398.5",
    gradientConfig: {
      initial: {
        x1: "0%",
        x2: "0%",
        y1: "80%",
        y2: "100%",
      },
      animate: {
        x1: ["0%", "0%", "200%"],
        x2: ["0%", "0%", "180%"],
        y1: ["80%", "0%", "0%"],
        y2: ["100%", "20%", "20%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 6.5, cy: 398.5, r: 6 },
      { cx: 269, cy: 220.5, r: 6 }
    ]
  },
  {
    path: "M568 200H841C846.523 200 851 195.523 851 190V40",
    gradientConfig: {
      initial: {
        x1: "0%",
        x2: "0%",
        y1: "80%",
        y2: "100%",
      },
      animate: {
        x1: ["20%", "100%", "100%"],
        x2: ["0%", "90%", "90%"],
        y1: ["80%", "80%", "-20%"],
        y2: ["100%", "100%", "0%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 851, cy: 34, r: 6.5 },
      { cx: 568, cy: 200, r: 6 }
    ]
  },
  {
    path: "M425.5 274V333C425.5 338.523 421.023 343 415.5 343H152C146.477 343 142 347.477 142 353V426.5",
    gradientConfig: {
      initial: {
        x1: "0%",
        x2: "0%",
        y1: "80%",
        y2: "100%",
      },
      animate: {
        x1: ["20%", "100%", "100%"],
        x2: ["0%", "90%", "90%"],
        y1: ["80%", "80%", "-20%"],
        y2: ["100%", "100%", "0%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 142, cy: 427, r: 6.5 },
      { cx: 425.5, cy: 274, r: 6 }
    ]
  },
  {
    path: "M493 274V333.226C493 338.749 497.477 343.226 503 343.226H760C765.523 343.226 770 347.703 770 353.226V427",
    gradientConfig: {
      initial: {
        x1: "40%",
        x2: "50%",
        y1: "160%",
        y2: "180%",
      },
      animate: {
        x1: "0%",
        x2: "10%",
        y1: "-40%",
        y2: "-20%",
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 770, cy: 427, r: 6.5 },
      { cx: 493, cy: 274, r: 6 }
    ]
  },
  {
    path: "M380 168V17C380 11.4772 384.477 7 390 7H414",
    gradientConfig: {
      initial: {
        x1: "-40%",
        x2: "-10%",
        y1: "0%",
        y2: "20%",
      },
      animate: {
        x1: ["40%", "0%", "0%"],
        x2: ["10%", "0%", "0%"],
        y1: ["0%", "0%", "180%"],
        y2: ["20%", "20%", "200%"],
      },
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop",
        ease: "linear",
        repeatDelay: 2,
        delay: Math.random() * 2,
      },
    },
    connectionPoints: [
      { cx: 420.5, cy: 6.5, r: 6 },
      { cx: 380, cy: 168, r: 6 }
    ]
  }
];

const gradientColors = {
  start: "#18CCFC",
  middle: "#6344F5",
  end: "#AE48FF"
};

const HeroSection = ({ onStartTrial, onWatchDemo }: HeroSectionProps) => {
  return (
    <section
      id="about"
      className="relative min-h-[90vh] flex items-center overflow-hidden pt-20"
    >
      <PulseBeams 
        beams={beams}
        gradientColors={gradientColors}
        className="absolute inset-0 bg-blue-950/90"
        baseColor="rgba(30, 58, 138, 0.3)"
        accentColor="rgba(37, 99, 235, 0.6)"
      >
        {/* Empty to use as background container */}
      </PulseBeams>
      
      {/* Main content */}
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
