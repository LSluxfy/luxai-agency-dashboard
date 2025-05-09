
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent
} from "@/components/ui/tabs";
import FAQSection from "@/components/support/FAQSection";
import SystemStatusCard from "@/components/support/SystemStatusCard";
import TicketsList from "@/components/support/TicketsList";
import NewTicketForm from "@/components/support/NewTicketForm";

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

const Support = () => {
  const { user } = useAuth();
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingFAQ, setLoadingFAQ] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [systemStatus, setSystemStatus] = useState<{ [key: string]: boolean }>({
    ai: true,
    database: true,
    storage: true,
    api: true,
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
          <TabsTrigger value="new" data-value="new">Novo Ticket</TabsTrigger>
        </TabsList>
        
        {/* FAQ Tab */}
        <TabsContent value="faq">
          <FAQSection 
            faqItems={faqItems} 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            loadingFAQ={loadingFAQ}
          />
          <SystemStatusCard systemStatus={systemStatus} />
        </TabsContent>
        
        {/* User Tickets Tab */}
        <TabsContent value="tickets">
          <TicketsList 
            user={user} 
            tickets={tickets}
            loadingTickets={loadingTickets}
            navigateToNewTicketTab={navigateToNewTicketTab}
          />
        </TabsContent>
        
        {/* New Ticket Tab */}
        <TabsContent value="new">
          <NewTicketForm 
            user={user}
            onTicketSubmitted={fetchUserTickets}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Support;
