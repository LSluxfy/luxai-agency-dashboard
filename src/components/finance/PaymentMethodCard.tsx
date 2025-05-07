
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";

interface PaymentMethodCardProps {
  onUpdateClick: () => void;
}

const PaymentMethodCard = ({ onUpdateClick }: PaymentMethodCardProps) => {
  // This is a mock card - in a real app you'd fetch this from your payment processor
  const mockCard = {
    brand: "Visa",
    last4: "4242",
    expMonth: 10,
    expYear: 2026,
  };

  return (
    <div className="space-y-6">
      <div className="border rounded-md p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-slate-100 flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="font-medium">{mockCard.brand} •••• {mockCard.last4}</p>
            <p className="text-sm text-muted-foreground">Expira em {mockCard.expMonth}/{mockCard.expYear}</p>
          </div>
        </div>
        <Button variant="outline" onClick={onUpdateClick}>
          Atualizar
        </Button>
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p className="mb-2">Seu cartão será cobrado automaticamente na data de renovação. 
        Você pode cancelar a assinatura a qualquer momento nas configurações da sua conta.</p>
        <p>Todos os pagamentos são processados com segurança via Stripe.</p>
      </div>
    </div>
  );
};

export default PaymentMethodCard;
