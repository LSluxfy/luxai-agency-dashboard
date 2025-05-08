
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como a IA da LuxAI cria campanhas de Facebook Ads?",
    answer: "Nossa IA analisa seu negócio, público-alvo e objetivos para gerar campanhas otimizadas automaticamente. Ela utiliza aprendizado de máquina para criar segmentações precisas, textos persuasivos e selecionar os melhores criativos para sua campanha. Todo o processo leva apenas alguns minutos."
  },
  {
    question: "Preciso ter conhecimento em Facebook Ads para usar a plataforma?",
    answer: "Não, a LuxAI foi projetada para ser usada tanto por iniciantes quanto por profissionais experientes. Nossa interface intuitiva e o processo guiado permitem que qualquer pessoa crie campanhas profissionais sem conhecimento técnico prévio."
  },
  {
    question: "Como a LuxAI consegue reduzir o custo por lead?",
    answer: "Nossa IA otimiza continuamente suas campanhas, testando diferentes combinações de públicos, criativos e configurações para encontrar a melhor performance. Além disso, nosso sistema de aprendizado utiliza dados de todas as campanhas para identificar padrões de sucesso, o que permite reduções de até 40% no custo por lead."
  },
  {
    question: "Posso migrar minhas campanhas atuais para a LuxAI?",
    answer: "Sim! Temos uma funcionalidade de importação que permite trazer suas campanhas existentes para dentro da plataforma. A IA irá analisar o histórico de performance e sugerir melhorias para otimização imediata."
  },
  {
    question: "Como funciona o teste gratuito?",
    answer: "Oferecemos 7 dias de teste gratuito com acesso a todos os recursos do plano Iniciante. Não é necessário cartão de crédito para começar, e você poderá criar até 2 campanhas completas durante este período para avaliar a plataforma."
  },
  {
    question: "Que tipo de suporte vocês oferecem?",
    answer: "Todos os planos incluem suporte por email. Nos planos Profissional e Agência, oferecemos suporte prioritário e, no plano Agência, você terá acesso a um gerente de conta dedicado para ajudar com estratégias personalizadas."
  },
  {
    question: "É possível integrar a LuxAI com outras plataformas?",
    answer: "Sim, oferecemos integrações nativas com as principais plataformas de CRM, e-commerce e analytics. Para o plano Agência, disponibilizamos também uma API completa para integrações personalizadas com seus sistemas internos."
  },
];

const Faq = () => {
  return (
    <section id="faq" className="py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Perguntas <span className="text-primary">Frequentes</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa saber sobre a LuxAI e como podemos ajudar seu negócio
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-b">
              <AccordionTrigger className="text-lg font-medium text-left py-4">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default Faq;
