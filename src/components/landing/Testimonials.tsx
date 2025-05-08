
import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    quote: "A LuxAI foi um divisor de águas para nossa estratégia digital. Conseguimos aumentar o ROAS em mais de 300% em apenas 2 meses.",
    author: "Maria Silva",
    role: "Diretora de Marketing, TechCorp",
    avatar: "MS",
    rating: 5,
  },
  {
    quote: "Economizamos mais de 30 horas por semana que antes dedicávamos a ajustes manuais das campanhas. A IA faz tudo melhor que fazíamos antes.",
    author: "Carlos Mendes",
    role: "Especialista em Aquisição, E-commerce XYZ",
    avatar: "CM",
    rating: 5,
  },
  {
    quote: "Reduzi meu CPL em 42% no primeiro mês usando a plataforma. O suporte é excelente e a interface é muito intuitiva.",
    author: "Ana Ferreira",
    role: "Proprietária, Boutique Online",
    avatar: "AF",
    rating: 5,
  },
];

const companyLogos = [
  "https://placehold.co/400x100/e0e0e0/cccccc?text=Logo+1",
  "https://placehold.co/400x100/e0e0e0/cccccc?text=Logo+2",
  "https://placehold.co/400x100/e0e0e0/cccccc?text=Logo+3",
  "https://placehold.co/400x100/e0e0e0/cccccc?text=Logo+4",
  "https://placehold.co/400x100/e0e0e0/cccccc?text=Logo+5",
];

const Testimonials = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const prev = () => {
    setCurrentTestimonial((current) => 
      current === 0 ? testimonials.length - 1 : current - 1
    );
  };

  const next = () => {
    setCurrentTestimonial((current) => 
      current === testimonials.length - 1 ? 0 : current + 1
    );
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            O que nossos <span className="text-primary">clientes</span> dizem
          </h2>
        </div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto mb-20 relative">
          <div className="bg-card rounded-2xl p-8 md:p-10 border shadow-lg">
            <div className="flex flex-col justify-between h-full">
              <div>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-5 w-5",
                        i < testimonials[currentTestimonial].rating
                          ? "text-yellow-500 fill-yellow-500"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <blockquote className="text-xl md:text-2xl font-medium italic mb-8">
                  "{testimonials[currentTestimonial].quote}"
                </blockquote>
              </div>
              
              <div className="flex items-center">
                <Avatar className="h-12 w-12 mr-4 border-2 border-primary">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {testimonials[currentTestimonial].avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">
                    {testimonials[currentTestimonial].author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {testimonials[currentTestimonial].role}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex justify-center mt-8 space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prev}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline" 
              size="icon"
              onClick={next}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Logos Section */}
        <div className="mt-20">
          <p className="text-center text-sm uppercase tracking-wider text-muted-foreground mb-8">
            Empresas que confiam na LuxAI
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center items-center opacity-70 grayscale">
            {companyLogos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center">
                <img
                  src={logo}
                  alt={`Cliente ${index + 1}`}
                  className="max-h-12 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
