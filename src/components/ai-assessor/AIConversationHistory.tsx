
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export type AIConversation = {
  id: string;
  message: string;
  response: string;
  type: string;
  created_at: string;
};

type AIConversationHistoryProps = {
  conversations: AIConversation[];
  isLoading: boolean;
  onConversationSelect?: (conversation: AIConversation) => void;
};

const ConversationTypeLabel = ({ type }: { type: string }) => {
  const typeMap: Record<string, { label: string; color: string }> = {
    "estrategia": { label: "Estratégias de marketing", color: "bg-blue-100 text-blue-800" },
    "criativos": { label: "Criativos para anúncios", color: "bg-purple-100 text-purple-800" },
    "roteiros": { label: "Roteiros para vídeos", color: "bg-green-100 text-green-800" },
    "nomes": { label: "Nomes de produtos/marcas", color: "bg-yellow-100 text-yellow-800" },
    "copias": { label: "Cópias de páginas", color: "bg-pink-100 text-pink-800" },
    "outros": { label: "Outros", color: "bg-gray-100 text-gray-800" },
  };

  const { label, color } = typeMap[type] || typeMap["outros"];

  return (
    <Badge variant="outline" className={`${color} border-0`}>
      {label}
    </Badge>
  );
};

const AIConversationHistory = ({ conversations, isLoading, onConversationSelect }: AIConversationHistoryProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-2" />
              <Skeleton className="h-4 w-4/5" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          Nenhuma conversa encontrada. Comece uma conversa com o Assessor IA.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {conversations.map((conversation) => (
        <Card 
          key={conversation.id} 
          className="overflow-hidden hover:border-primary/50 transition-all cursor-pointer"
          onClick={() => onConversationSelect && onConversationSelect(conversation)}
        >
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ConversationTypeLabel type={conversation.type} />
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {format(new Date(conversation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              </div>
              <span className="text-sm text-muted-foreground sm:hidden">
                {format(new Date(conversation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {formatDistanceToNow(new Date(conversation.created_at), { 
                  addSuffix: true, 
                  locale: ptBR
                })}
              </span>
            </div>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="mb-4">
              <h4 className="font-medium">Sua pergunta:</h4>
              <p className="mt-1 line-clamp-2">{conversation.message}</p>
            </div>
            <div>
              <h4 className="font-medium">Resposta da IA:</h4>
              <p className="mt-1 line-clamp-3 opacity-75">{conversation.response}</p>
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onConversationSelect && onConversationSelect(conversation);
                }}
              >
                Ver detalhes
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AIConversationHistory;
