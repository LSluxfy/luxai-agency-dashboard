
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AIChat from "@/components/ai-assessor/AIChat";
import AIConversationHistory from "@/components/ai-assessor/AIConversationHistory";
import AIConversationFilters from "@/components/ai-assessor/AIConversationFilters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, History } from "lucide-react";
import { toast } from "sonner";
import type { AIConversation } from "@/components/ai-assessor/AIConversationHistory";

const AssessorAI = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("chat");
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [showNewChat, setShowNewChat] = useState(true);

  const fetchConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Use a tipagem mais genérica para evitar o erro de tipo
      const { data, error } = await supabase
        .from('ia_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(result => {
          // Adicionar tipagem explícita ao resultado
          return {
            data: result.data as AIConversation[] | null,
            error: result.error
          };
        });

      if (error) {
        console.error("Erro ao buscar conversas:", error);
        toast.error("Erro ao carregar conversas");
        return;
      }

      setConversations(data || []);
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
  }, [user, selectedFilter]);

  const handleFilterChange = (type: string | null) => {
    setSelectedFilter(type);
  };

  const handleNewChat = () => {
    setActiveTab("chat");
    setShowNewChat(true);
  };

  const handleConversationAdded = () => {
    fetchConversations();
  };

  return (
    <div className="container mx-auto p-4 pt-6">
      <h1 className="text-3xl font-bold mb-6">Assessor IA</h1>

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
          Nova Estratégia
        </Button>
      </div>

      <TabsContent value="chat" className="mt-2">
        {showNewChat && user && (
          <AIChat 
            userId={user.id}
            onConversationAdded={handleConversationAdded}
          />
        )}
      </TabsContent>

      <TabsContent value="history" className="mt-2">
        <div className="bg-card rounded-lg border p-4">
          <AIConversationFilters onFilterChange={handleFilterChange} />
          <AIConversationHistory 
            conversations={conversations}
            isLoading={isLoading}
          />
        </div>
      </TabsContent>
    </div>
  );
};

export default AssessorAI;
