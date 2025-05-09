import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, ChevronDown, MessageSquare, Loader2, HelpCircle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent
} from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
}

interface FormData {
  subject: string;
  message: string;
  category: string;
}

const Support = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingFAQ, setLoadingFAQ] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [systemStatus, setSystemStatus] = useState<{ [key: string]: boolean }>({
    ai: true,
    database: true,
    storage: true,
    api: true,
  });
  
  const form = useForm<FormData>({
    defaultValues: {
      subject: "",
      message: "",
      category: "general",
    },
  });

  useEffect(() => {
    fetchFAQItems();
    if (user) {
      fetchUserTickets();
    }
  }, [user]);

  const fetchFAQItems = async () => {
    try {
      setLoadingFAQ(true);
      const { data, error } = await supabase
        .from('faq_items')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setFaqItems(data);
      }
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
      toast({
        title: "Erro ao carregar perguntas frequentes",
        description: "Não foi possível carregar o FAQ. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoadingFAQ(false);
    }
  };

  const fetchUserTickets = async () => {
    try {
      setLoadingTickets(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setTickets(data);
      }
    } catch (error) {
      console.error('Error fetching support tickets:', error);
    } finally {
      setLoadingTickets(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para enviar um ticket de suporte.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: data.subject,
          message: data.message,
          status: 'pending'
        });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Ticket enviado com sucesso",
        description: "Seu ticket de suporte foi enviado. Responderemos em breve.",
      });
      
      // Reset form and fetch updated tickets
      form.reset({
        subject: "",
        message: "",
        category: "general",
      });
      
      fetchUserTickets();
      
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast({
        title: "Erro ao enviar ticket",
        description: "Não foi possível enviar seu ticket. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter FAQ items based on search query
  const filteredFAQItems = faqItems.filter(item => 
    searchQuery === "" || 
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Group FAQ items by category
  const faqByCategory: { [key: string]: FAQItem[] } = {};
  filteredFAQItems.forEach(item => {
    if (!faqByCategory[item.category]) {
      faqByCategory[item.category] = [];
    }
    faqByCategory[item.category].push(item);
  });

  // Status indicator component
  const StatusIndicator = ({ isOnline }: { isOnline: boolean }) => (
    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
  );

  const navigateToNewTicketTab = () => {
    // Fix: Cast to HTMLElement to use click() method
    const newTicketTab = document.querySelector('[data-value="new"]');
    if (newTicketTab && newTicketTab instanceof HTMLElement) {
      newTicketTab.click();
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">Suporte</h1>
      
      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faq">Perguntas Frequentes</TabsTrigger>
          <TabsTrigger value="tickets">Meus Tickets</TabsTrigger>
          <TabsTrigger value="new">Novo Ticket</TabsTrigger>
        </TabsList>
        
        {/* FAQ Tab */}
        <TabsContent value="faq">
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
                  {Object.keys(faqByCategory).map(category => (
                    <div key={category} className="space-y-2">
                      <h3 className="text-lg font-medium">{category}</h3>
                      <Accordion type="single" collapsible className="border rounded-md">
                        {faqByCategory[category].map(item => (
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
          
          {/* System Status Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center">
                    <StatusIndicator isOnline={systemStatus.ai} />
                    Serviços de IA
                  </span>
                  <span className={systemStatus.ai ? "text-green-600" : "text-red-600"}>
                    {systemStatus.ai ? "Operando normalmente" : "Com problemas"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center">
                    <StatusIndicator isOnline={systemStatus.database} />
                    Banco de Dados
                  </span>
                  <span className={systemStatus.database ? "text-green-600" : "text-red-600"}>
                    {systemStatus.database ? "Operando normalmente" : "Com problemas"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="flex items-center">
                    <StatusIndicator isOnline={systemStatus.storage} />
                    Armazenamento
                  </span>
                  <span className={systemStatus.storage ? "text-green-600" : "text-red-600"}>
                    {systemStatus.storage ? "Operando normalmente" : "Com problemas"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="flex items-center">
                    <StatusIndicator isOnline={systemStatus.api} />
                    APIs Externas
                  </span>
                  <span className={systemStatus.api ? "text-green-600" : "text-red-600"}>
                    {systemStatus.api ? "Operando normalmente" : "Com problemas"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 text-xs text-muted-foreground">
              Última atualização: {new Date().toLocaleString()}
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* User Tickets Tab */}
        <TabsContent value="tickets">
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
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={navigateToNewTicketTab}
                  >
                    Criar Novo Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map(ticket => (
                    <Card key={ticket.id} className="bg-muted/20">
                      <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{ticket.subject}</CardTitle>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            ticket.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {ticket.status === 'pending' ? 'Pendente' : 
                             ticket.status === 'in_progress' ? 'Em Análise' : 
                             'Resolvido'}
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
        </TabsContent>
        
        {/* New Ticket Tab */}
        <TabsContent value="new">
          <Card>
            <CardHeader>
              <CardTitle>Novo Ticket de Suporte</CardTitle>
            </CardHeader>
            <CardContent>
              {!user ? (
                <div className="text-center py-8">
                  <p>Por favor, faça login para criar um ticket de suporte.</p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">Dúvida Geral</SelectItem>
                              <SelectItem value="billing">Faturamento</SelectItem>
                              <SelectItem value="technical">Suporte Técnico</SelectItem>
                              <SelectItem value="feature">Sugestão de Funcionalidade</SelectItem>
                              <SelectItem value="bug">Reportar Bug</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="subject"
                      rules={{ required: "Assunto é obrigatório" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assunto</FormLabel>
                          <FormControl>
                            <Input placeholder="Digite o assunto do seu ticket" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="message"
                      rules={{ required: "Mensagem é obrigatória" }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva detalhadamente sua dúvida ou problema" 
                              className="min-h-[150px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Forneça o máximo de detalhes possível para ajudarmos você mais rapidamente.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        "Enviar Ticket"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
