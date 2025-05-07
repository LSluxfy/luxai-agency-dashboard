import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Facebook, CheckCircle, AlertCircle, Star, Trash2, Loader } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { useNavigate } from "react-router-dom";

// Mock data for demonstration
type FacebookAccount = {
  id: string;
  name: string;
  status: "active" | "inactive";
  isPrimary: boolean;
};

type UserPlan = "basic" | "professional" | "agency";

// Facebook App configuration
const FACEBOOK_CONFIG = {
  clientId: "123456789012345", // Replace with your actual Facebook App ID
  redirectUri: window.location.origin + "/facebook/callback", // Dynamic redirect based on current domain
  state: Math.random().toString(36).substring(2, 15), // Random state for security
  scope: "ads_management,ads_read,pages_show_list,business_management"
};

const FacebookConnection = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<FacebookAccount[]>([
    {
      id: "123456789",
      name: "LuxAI Marketing",
      status: "active",
      isPrimary: true
    },
    {
      id: "987654321",
      name: "LuxAI Ecommerce",
      status: "active",
      isPrimary: false
    }
  ]);

  // User plan simulation
  const userPlan: UserPlan = "professional";
  
  const planLimits = {
    basic: 1,
    professional: 3,
    agency: 10
  };

  const currentLimit = planLimits[userPlan];
  
  const handleConnectFacebook = () => {
    // Check if user has reached account limit
    if (connectedAccounts.length >= currentLimit) {
      setShowLimitModal(true);
      return;
    }
    
    setIsConnecting(true);
    
    // Build the Facebook OAuth URL and redirect to Facebook authorization page
    const facebookAuthUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FACEBOOK_CONFIG.clientId}&redirect_uri=${encodeURIComponent(FACEBOOK_CONFIG.redirectUri)}&state=${FACEBOOK_CONFIG.state}&response_type=code&scope=${FACEBOOK_CONFIG.scope}`;
    
    // Store state for verification when user returns from Facebook
    localStorage.setItem('facebookAuthState', FACEBOOK_CONFIG.state);
    
    // Open Facebook ad manager in a new window instead of redirecting
    window.open(facebookAuthUrl, '_blank', 'width=800,height=600');
    
    // Reset connection state after a short delay
    setTimeout(() => {
      setIsConnecting(false);
      toast.info("Concluindo conexão com o Facebook", {
        description: "Siga as instruções na janela aberta para continuar."
      });
    }, 2000);
  };

  const handleSetPrimary = (accountId: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedAccounts = connectedAccounts.map(account => ({
        ...account,
        isPrimary: account.id === accountId
      }));
      
      setConnectedAccounts(updatedAccounts);
      setIsLoading(false);
      
      toast.success("Conta principal atualizada", {
        description: "Suas campanhas serão criadas nesta conta por padrão."
      });
    }, 1000);
  };

  const handleDisconnect = (accountId: string) => {
    setIsLoading(true);
    
    setTimeout(() => {
      const filteredAccounts = connectedAccounts.filter(
        account => account.id !== accountId
      );
      
      // If we removed the primary account and there are other accounts left,
      // set the first one as primary
      if (
        filteredAccounts.length > 0 && 
        !connectedAccounts.find(acc => acc.id === accountId)?.isPrimary
      ) {
        filteredAccounts[0].isPrimary = true;
      }
      
      setConnectedAccounts(filteredAccounts);
      setIsLoading(false);
      
      toast.success("Conta desconectada", {
        description: "A conta foi removida com sucesso."
      });
    }, 1000);
  };

  const formatPlanName = (plan: UserPlan) => {
    switch (plan) {
      case "basic": return "Básico";
      case "professional": return "Profissional";
      case "agency": return "Agência";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Conexão com Facebook</h1>
      
      {/* Main connection card */}
      <Card className="mb-8 shadow-md">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle className="text-2xl">Gerenciar Contas do Facebook Ads</CardTitle>
          <CardDescription>
            Conecte sua conta do Facebook para que a IA possa criar campanhas automáticas.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 space-y-1">
              <p>
                <strong>Seu plano:</strong> {formatPlanName(userPlan)}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Contas conectadas:</strong>{" "}
                <span className={connectedAccounts.length >= currentLimit ? "text-destructive font-bold" : ""}>
                  {connectedAccounts.length}/{currentLimit}
                </span>
              </p>
            </div>
            <Button 
              onClick={handleConnectFacebook} 
              disabled={isConnecting || connectedAccounts.length >= currentLimit} 
              className="gap-2"
              size="lg"
            >
              {isConnecting ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Facebook className="h-5 w-5 text-white" />
              )}
              Conectar com o Facebook
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Accounts list */}
      <Card className="shadow-md">
        <CardHeader className="border-b bg-muted/40">
          <CardTitle>Contas Conectadas</CardTitle>
          <CardDescription>
            Gerencie as contas de Facebook Ads conectadas à sua LuxAI Agency.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {connectedAccounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>Nome da Conta</TableHead>
                  <TableHead>ID da Conta</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectedAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {account.status === "active" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                        <Badge variant={account.status === "active" ? "default" : "outline"}>
                          {account.status === "active" ? "Ativa" : "Inativa"}
                        </Badge>
                        {account.isPrimary && (
                          <Badge variant="secondary">Principal</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell className="text-muted-foreground">{account.id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!account.isPrimary && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSetPrimary(account.id)}
                            disabled={isLoading}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Tornar Principal
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDisconnect(account.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Desconectar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Facebook className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Nenhuma conta conectada</h3>
              <p className="text-sm text-muted-foreground mt-2 mb-4">
                Conecte sua conta do Facebook para começar a criar campanhas automáticas.
              </p>
              <Button onClick={handleConnectFacebook} disabled={isConnecting}>
                {isConnecting ? (
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Facebook className="h-4 w-4 mr-2" />
                )}
                Conectar com o Facebook
              </Button>
            </div>
          )}
        </CardContent>
        {connectedAccounts.length > 0 && (
          <CardFooter className="bg-muted/20 border-t py-3 text-xs text-muted-foreground">
            Nota: Você precisará renovar a conexão a cada 60 dias por política do Facebook.
          </CardFooter>
        )}
      </Card>

      {/* Plan limit modal */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Limite de contas atingido</DialogTitle>
            <DialogDescription>
              Você atingiu o limite de {currentLimit} {currentLimit === 1 ? 'conta conectada' : 'contas conectadas'} do seu plano {formatPlanName(userPlan)}.
            </DialogDescription>
          </DialogHeader>
          <p className="py-2">
            Faça o upgrade do seu plano para conectar mais contas do Facebook e desbloquear recursos adicionais.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => navigate("/dashboard?tab=plans")}>
              Ver Planos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FacebookConnection;
