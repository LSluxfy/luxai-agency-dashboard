
import { useEffect, useRef } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { Rocket, Wand2, Video, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreativeStudioSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const mainControls = useAnimation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  const features = [
    {
      icon: Wand2,
      text: "Gere imagens únicas com comandos simples em português."
    },
    {
      icon: Video,
      text: "Crie vídeos realistas com o modelo WAN 2.1, transformando imagens em movimento."
    },
    {
      icon: Image,
      text: "Use IA de ponta como WAN 2.1 e Replicate SDXL, integradas ao seu painel."
    },
    {
      icon: Rocket,
      text: "Automatize campanhas com criativos gerados sob demanda."
    }
  ];

  return (
    <section 
      ref={ref}
      id="creative-studio" 
      className="relative py-24 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 z-0">
        {/* Glow elements */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-400/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-2/3 left-1/3 w-40 h-40 bg-purple-400/20 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzB6IiBmaWxsLW9wYWNpdHk9Ii4wMSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0wIDMwaDMwdjMwSDB6IiBmaWxsLW9wYWNpdHk9Ii4wMSIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0wIDBoMzB2MzBIMHoiIGZpbGwtb3BhY2l0eT0iLjAxIiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTMwIDBoMzB2MzBIMzB6IiBmaWxsLW9wYWNpdHk9Ii4wMSIgZmlsbD0iI2ZmZiIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={mainControls}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="inline-flex items-center gap-2 text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            <Wand2 className="text-primary h-6 w-6" />
            Studio de Criativos com IA
          </h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Crie imagens e vídeos profissionais<br className="hidden md:block" /> com apenas um comando de texto
          </h3>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Transforme ideias em artes visuais impressionantes sem precisar de habilidades em design. 
            Nosso Studio de Criativos com Inteligência Artificial potencializa sua criatividade.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Features */}
          <motion.div
            className="space-y-8"
            initial="hidden"
            animate={mainControls}
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1 }
            }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-start gap-4"
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 }
                }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-200 text-lg">{feature.text}</p>
                </div>
              </motion.div>
            ))}
            
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <Button 
                onClick={() => navigate("/creative-studio")}
                size="lg"
                className="mt-8 bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary text-white font-medium px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/20"
              >
                Experimente agora
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Showcase Image */}
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-2xl shadow-primary/20 border border-white/10"
            initial="hidden"
            animate={mainControls}
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              visible: { opacity: 1, scale: 1 }
            }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4">
              {/* Mock UI */}
              <div className="w-full h-full bg-slate-800/60 backdrop-blur rounded-lg border border-white/10 p-2 overflow-hidden">
                <div className="h-6 flex items-center gap-1.5 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 h-5 w-40 bg-slate-700 rounded"></div>
                </div>
                <div className="flex gap-2 h-[calc(100%-2rem)]">
                  <div className="w-1/3 bg-slate-900/60 rounded p-2">
                    <div className="h-4 w-20 bg-slate-700 rounded mb-4"></div>
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 bg-slate-800 rounded flex items-center px-2 gap-2">
                          <div className="w-6 h-6 rounded bg-primary/30"></div>
                          <div className="h-3 w-16 bg-slate-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="w-2/3 bg-slate-900/60 rounded flex flex-col p-2">
                    <div className="h-4 w-24 bg-slate-700 rounded mb-4"></div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-md aspect-square flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-primary/40 animate-pulse"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Glass overlay with sheen effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
          </motion.div>
        </div>
        
        <motion.div 
          className="text-center"
          initial="hidden"
          animate={mainControls}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <p className="text-primary font-medium inline-flex items-center gap-1">
            <span className="text-xl">👉</span> Experimente agora e veja sua criatividade ganhar escala com tecnologia
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CreativeStudioSection;
