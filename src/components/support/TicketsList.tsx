
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Loader2 } from "lucide-react";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface TicketsListProps {
  user: any; // Using any for simplicity, ideally should be properly typed
  tickets: SupportTicket[];
  loadingTickets: boolean;
  navigateToNewTicketTab: () => void;
}

const TicketsList = ({ user, tickets, loadingTickets, navigateToNewTicketTab }: TicketsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Meus Tickets de Suporte
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!user ? (
          <div className="text-center py-8">
            <p>Por favor, faça login para visualizar seus tickets de suporte.</p>
          </div>
        ) : loadingTickets ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Carregando tickets...</span>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p>Você ainda não possui tickets de suporte.</p>
            <Button variant="outline" className="mt-4" onClick={navigateToNewTicketTab}>
              Criar Novo Ticket
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="bg-muted/20">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : ticket.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {ticket.status === "pending"
                        ? "Pendente"
                        : ticket.status === "in_progress"
                        ? "Em Análise"
                        : "Resolvido"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="py-2">
                  <p className="text-sm">{ticket.message}</p>
                </CardContent>
                <CardFooter className="py-2 text-xs text-muted-foreground">
                  {new Date(ticket.created_at).toLocaleString()}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketsList;
