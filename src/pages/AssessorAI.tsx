
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AIChat from "@/components/ai-assessor/AIChat";
import AIConversationHistory from "@/components/ai-assessor/AIConversationHistory";
import AIConversationFilters from "@/components/ai-assessor/AIConversationFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, History, Search } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import type { AIConversation } from "@/components/ai-assessor/AIConversationHistory";
import { Card, CardContent } from "@/components/ui/card";

// Sugestões rápidas para o usuário
const quickSuggestions = [
  { text: "Criar campanha para meu produto", prompt: "Crie uma estratégia de campanha para divulgar meu produto" },
  { text: "Gerar nome de marca", prompt: "Sugira 5 nomes criativos para uma marca de" },
  { text: "Escrever texto para anúncio", prompt: "Escreva um texto persuasivo para anúncio de" },
  { text: "Gerar ideia de vídeo", prompt: "Proponha um roteiro para vídeo sobre" },
];

const AssessorAI = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestedPrompt, setSuggestedPrompt] = useState("");

  console.log("AssessorAI component rendered, user:", user?.id);

  const fetchConversations = async () => {
    if (!user) return;
    
    console.log("Fetching conversations for user:", user.id);
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('ia_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (selectedFilter) {
        query = query.eq('type', selectedFilter);
      }
      
      if (searchQuery) {
        query = query.or(`message.ilike.%${searchQuery}%,response.ilike.%${searchQuery}%`);
      }
      
      const { data, error } = await query;
          
      if (error) {
        console.error("Erro ao buscar conversas:", error);
        toast.error("Erro ao carregar conversas");
        return;
      }

      console.log("Conversations fetched:", data?.length);
      setConversations(data as AIConversation[]);
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
      toast.error("Erro ao carregar conversas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user, selectedFilter, searchQuery]);

  const handleFilterChange = (type: string | null) => {
    setSelectedFilter(type);
  };

  const handleNewChat = () => {
    setActiveTab("chat");
    setShowNewChat(true);
    setSuggestedPrompt("");
  };

  const handleConversationAdded = () => {
    fetchConversations();
  };

  const handleSuggestionClick = (prompt: string) => {
    setSuggestedPrompt(prompt);
    setActiveTab("chat");
    setShowNewChat(true);
  };

  return (
    <div className="container mx-auto p-4 pt-6">
      <h1 className="text-3xl font-bold mb-4">Assessor IA</h1>
      
      {/* Bloco de boas-vindas / introdução */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-lg mb-4">
            Converse com seu Assessor IA para receber ideias, estratégias, campanhas e materiais criativos de marketing para o seu negócio.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            {quickSuggestions.map((suggestion, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="justify-start text-left"
                onClick={() => handleSuggestionClick(suggestion.prompt)}
              >
                {suggestion.text}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Chat
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History size={16} />
              Histórico de Conversas
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handleNewChat} className="ml-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conversa
        </Button>
      </div>

      <TabsContent value="chat" className="mt-2">
        {showNewChat && user && (
          <AIChat 
            userId={user.id}
            onConversationAdded={handleConversationAdded}
            suggestedPrompt={suggestedPrompt}
          />
        )}
      </TabsContent>

      <TabsContent value="history" className="mt-2">
        <div className="bg-card rounded-lg border p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start">
            <div className="w-full sm:flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar nas conversas..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <AIConversationFilters onFilterChange={handleFilterChange} />
          <AIConversationHistory 
            conversations={conversations}
            isLoading={isLoading}
            onConversationSelect={() => {
              // Implementação futura: carregar conversa completa
              toast.info("Funcionalidade em desenvolvimento");
            }}
          />
        </div>
      </TabsContent>
    </div>
  );
};

export default AssessorAI;
