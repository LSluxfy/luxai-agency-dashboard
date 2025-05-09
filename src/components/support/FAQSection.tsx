
import { useState } from "react";
import { Search, Loader2, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQSectionProps {
  faqItems: FAQItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  loadingFAQ: boolean;
}

const FAQSection = ({ faqItems, searchQuery, setSearchQuery, loadingFAQ }: FAQSectionProps) => {
  // Filter FAQ items based on search query
  const filteredFAQItems = faqItems.filter(
    (item) =>
      searchQuery === "" ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group FAQ items by category
  const faqByCategory: { [key: string]: FAQItem[] } = {};
  filteredFAQItems.forEach((item) => {
    if (!faqByCategory[item.category]) {
      faqByCategory[item.category] = [];
    }
    faqByCategory[item.category].push(item);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <HelpCircle className="mr-2 h-5 w-5" />
          Perguntas Frequentes
        </CardTitle>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar na base de conhecimento..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        {loadingFAQ ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando perguntas frequentes...</span>
          </div>
        ) : filteredFAQItems.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma pergunta encontrada para esta busca.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.keys(faqByCategory).map((category) => (
              <div key={category} className="space-y-2">
                <h3 className="text-lg font-medium">{category}</h3>
                <Accordion type="single" collapsible className="border rounded-md">
                  {faqByCategory[category].map((item) => (
                    <AccordionItem key={item.id} value={item.id}>
                      <AccordionTrigger className="px-4 hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FAQSection;
