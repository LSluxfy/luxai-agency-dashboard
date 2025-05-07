
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Loader, CheckCircle, XCircle } from "lucide-react";

const FacebookCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const storedState = localStorage.getItem("facebookAuthState");

    // Handle error from Facebook
    if (error) {
      setStatus("error");
      setErrorMessage(`Ocorreu um erro na autenticação: ${error}`);
      return;
    }

    // Verify state parameter (CSRF protection)
    if (!state || state !== storedState) {
      setStatus("error");
      setErrorMessage("Estado de autenticação inválido. Por favor, tente novamente.");
      return;
    }

    if (code) {
      // In a real implementation, you would send this code to your backend
      // to exchange it for an access token using the Facebook Token Exchange API
      console.log("Auth code received:", code);
      
      // For demonstration purposes, we'll just simulate a successful authentication
      setTimeout(() => {
        setStatus("success");
        
        // Clear the state from localStorage
        localStorage.removeItem("facebookAuthState");
        
        toast.success("Conta do Facebook conectada com sucesso", {
          description: "Você pode gerenciar suas contas na página de conexão do Facebook."
        });
      }, 2000);
    } else {
      setStatus("error");
      setErrorMessage("Código de autorização não recebido. Por favor, tente novamente.");
    }
  }, [searchParams, navigate]);

  return (
    <div className="container mx-auto py-16 flex justify-center">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === "loading" && "Processando Autenticação..."}
            {status === "success" && "Autenticação Bem-sucedida!"}
            {status === "error" && "Falha na Autenticação"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Estamos processando sua autorização do Facebook."}
            {status === "success" && "Sua conta do Facebook foi conectada com sucesso."}
            {status === "error" && errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 pt-6">
          <div className="flex justify-center">
            {status === "loading" && <Loader className="h-16 w-16 text-primary animate-spin" />}
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-destructive" />}
          </div>
          
          {status === "loading" && (
            <p className="text-center text-muted-foreground">
              Isso pode levar alguns segundos...
            </p>
          )}
          
          {status !== "loading" && (
            <Button 
              onClick={() => navigate("/facebook")} 
              className="w-full"
              variant={status === "success" ? "default" : "outline"}
            >
              Voltar para Gerenciamento de Contas
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookCallback;
