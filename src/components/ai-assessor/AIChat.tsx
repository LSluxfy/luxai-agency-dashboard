
import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoaderCircle, Send, Image } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const conversationTypes = [
  { value: "estrategia", label: "Estratégias de marketing" },
  { value: "criativos", label: "Criativos para anúncios" },
  { value: "roteiros", label: "Roteiros para vídeos" },
  { value: "nomes", label: "Nomes de produtos/marcas" },
  { value: "copias", label: "Cópias de páginas" },
  { value: "outros", label: "Outros" }
];

type AIChatProps = {
  userId: string;
  onConversationAdded?: () => void;
  isWidget?: boolean;
  suggestedPrompt?: string;
};

const AIChat = ({ userId, onConversationAdded, isWidget = false, suggestedPrompt = "" }: AIChatProps) => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [type, setType] = useState("outros");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (suggestedPrompt) {
      setMessage(suggestedPrompt);
    }
  }, [suggestedPrompt]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    if (!userId) {
      toast.error("Você precisa estar logado para usar o Assessor IA");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Enviando solicitação para a função ask-ia com userId:", userId);
      
      const response = await fetch('https://lgblicqyurcttmlguwsd.supabase.co/functions/v1/ask-ia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId,
          type
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar solicitação');
      }
      
      const data = await response.json();
      console.log("Resposta recebida:", data);
      setResponse(data.response);
      
      if (onConversationAdded) {
        onConversationAdded();
      }
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error("Erro ao obter resposta da IA. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`${isWidget ? 'border-0 shadow-none' : 'border shadow-sm'}`}>
      {!isWidget && (
        <CardHeader>
          <CardTitle>Nova Conversa</CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Em que posso ajudar? Descreva o que você precisa..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <div className="flex gap-2">
              <Select
                value={type}
                onValueChange={setType}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {conversationTypes.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                type="button" 
                variant="outline" 
                className="w-10 p-0 flex-shrink-0" 
                disabled={true} 
                title="Recurso em breve"
              >
                <Image className="h-4 w-4" />
              </Button>
            </div>
            
            <Button type="submit" disabled={isLoading || !message.trim()}>
              {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Enviar
            </Button>
          </div>
        </form>
        
        {response && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Resposta:</h3>
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIChat;
