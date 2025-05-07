
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableFooter 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, CreditCard, Check, Trophy, AlertCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import PlanComparison from "@/components/finance/PlanComparison";
import PaymentMethodCard from "@/components/finance/PaymentMethodCard";

type PlanLimit = {
  id: number;
  plan_name: string;
  facebook_accounts_limit: number;
  monthly_campaigns_limit: number;
  ai_creatives_limit: number;
  price_cents: number;
};

type Invoice = {
  id: string;
  amount_cents: number;
  status: string;
  issued_date: string;
  due_date: string;
  invoice_number: string;
  pdf_url: string | null;
};

const Finance = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [planLimits, setPlanLimits] = useState<PlanLimit[]>([]);
  const [userPlanLimit, setUserPlanLimit] = useState<PlanLimit | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [usageStats, setUsageStats] = useState({
    facebookAccounts: 0,
    campaigns: 0,
    aiCreatives: 0,
  });
  
  const { profile, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Fetch all plan limits
        const { data: planLimitsData, error: planLimitsError } = await supabase
          .from('plan_limits')
          .select('*');

        if (planLimitsError) throw planLimitsError;
        setPlanLimits(planLimitsData);
        
        // Find current user's plan limit
        const userPlan = profile?.plan || 'INICIANTE';
        const currentPlanLimit = planLimitsData.find(
          (plan) => plan.plan_name === userPlan
        );
        setUserPlanLimit(currentPlanLimit || null);
        
        // Fetch user invoices
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .order('issued_date', { ascending: false });
          
        if (invoicesError) throw invoicesError;
        setInvoices(invoicesData);
        
        // For demo purposes, we'll just set some sample usage stats
        // In a real app, you would fetch actual usage from your database
        setUsageStats({
          facebookAccounts: 1,
          campaigns: 2,
          aiCreatives: 5,
        });

      } catch (error) {
        console.error("Error fetching financial data:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados financeiros.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanData();
  }, [user, profile, toast]);

  const handleDownloadInvoice = (invoiceId: string) => {
    // In a real application, this would trigger a PDF download
    toast({
      title: "Download iniciado",
      description: "Sua fatura está sendo baixada.",
    });
  };

  const handleUpdatePayment = () => {
    // In a real application, this would open a payment update form/modal
    toast({
      title: "Em desenvolvimento",
      description: "Funcionalidade de atualização de pagamento em desenvolvimento.",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seu plano, faturas e formas de pagamento
        </p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
          <TabsTrigger value="payment">Pagamento</TabsTrigger>
        </TabsList>
        
        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Plano {profile?.plan || 'INICIANTE'}
              </CardTitle>
              <CardDescription>
                Seu plano atual com detalhes de uso e cobrança
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Uso de Contas do Facebook */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Contas do Facebook</span>
                    <span className="text-sm">
                      {usageStats.facebookAccounts}/{userPlanLimit?.facebook_accounts_limit || 1}
                    </span>
                  </div>
                  <Progress 
                    value={userPlanLimit?.facebook_accounts_limit 
                      ? (usageStats.facebookAccounts / userPlanLimit.facebook_accounts_limit) * 100 
                      : 0
                    } 
                  />
                </div>

                {/* Uso de Campanhas */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Campanhas Mensais</span>
                    <span className="text-sm">
                      {usageStats.campaigns}/{userPlanLimit?.monthly_campaigns_limit || 5}
                    </span>
                  </div>
                  <Progress 
                    value={userPlanLimit?.monthly_campaigns_limit 
                      ? (usageStats.campaigns / userPlanLimit.monthly_campaigns_limit) * 100 
                      : 0
                    } 
                  />
                </div>

                {/* Uso de Criativos de IA */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Criativos de IA</span>
                    <span className="text-sm">
                      {usageStats.aiCreatives}/{userPlanLimit?.ai_creatives_limit || 10}
                    </span>
                  </div>
                  <Progress 
                    value={userPlanLimit?.ai_creatives_limit 
                      ? (usageStats.aiCreatives / userPlanLimit.ai_creatives_limit) * 100 
                      : 0
                    } 
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Próxima cobrança em:</p>
                  <p className="font-medium">
                    {profile?.plan_next_billing 
                      ? formatDate(new Date(profile.plan_next_billing)) 
                      : 'N/A'
                    }
                  </p>
                </div>
                <Button onClick={() => setActiveTab("plans")}>
                  Alterar Plano
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Últimas Faturas */}
          <Card>
            <CardHeader>
              <CardTitle>Últimas Faturas</CardTitle>
              <CardDescription>
                Histórico de faturas recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.slice(0, 3).map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            {formatDate(new Date(invoice.issued_date))}
                          </TableCell>
                          <TableCell>
                            {(invoice.amount_cents / 100).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={invoice.status === 'Pago' ? 'default' : 'outline'}
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {invoices.length > 3 && (
                    <div className="mt-4 text-center">
                      <Button 
                        variant="link" 
                        onClick={() => setActiveTab("invoices")}
                      >
                        Ver todas as faturas
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma fatura encontrada.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faturas */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Todas as Faturas</CardTitle>
              <CardDescription>
                Histórico completo de faturas e pagamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                          <TableCell>
                            {formatDate(new Date(invoice.issued_date))}
                          </TableCell>
                          <TableCell>
                            {formatDate(new Date(invoice.due_date))}
                          </TableCell>
                          <TableCell>
                            {(invoice.amount_cents / 100).toLocaleString('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={invoice.status === 'Pago' ? 'default' : 'outline'}
                            >
                              {invoice.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Nenhuma fatura encontrada.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Planos */}
        <TabsContent value="plans">
          <PlanComparison 
            plans={planLimits} 
            currentPlan={profile?.plan || 'INICIANTE'}
          />
        </TabsContent>

        {/* Informações de Pagamento */}
        <TabsContent value="payment">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Forma de Pagamento</CardTitle>
                  <CardDescription>
                    Atualize sua forma de pagamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentMethodCard 
                    onUpdateClick={handleUpdatePayment}
                  />
                </CardContent>
              </Card>
            </div>
            
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Importante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Ao atualizar sua forma de pagamento, você está concordando com os 
                    nossos termos e condições. A alteração será aplicada na próxima cobrança.
                  </p>
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Próxima cobrança:</h4>
                    <p className="font-medium">
                      {profile?.plan_next_billing 
                        ? formatDate(new Date(profile.plan_next_billing)) 
                        : 'N/A'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
