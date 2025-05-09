
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SystemStatusCardProps {
  systemStatus: {
    [key: string]: boolean;
  };
}

const SystemStatusCard = ({ systemStatus }: SystemStatusCardProps) => {
  // Status indicator component
  const StatusIndicator = ({ isOnline }: { isOnline: boolean }) => (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 ${
        isOnline ? "bg-green-500" : "bg-red-500"
      }`}
    ></span>
  );

  return (
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
  );
};

export default SystemStatusCard;
