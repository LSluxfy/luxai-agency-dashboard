
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Logo from "@/components/ui-custom/Logo";
import ParticleBackground from "@/components/ui-custom/ParticleBackground";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";

type AuthFormValues = {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
};

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/dashboard");
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate("/dashboard");
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (values: AuthFormValues) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error("Erro no login", {
          description: error.message,
        });
        return;
      }

      toast.success("Login bem-sucedido!", {
        description: "Bem-vindo à LuxAI Agency.",
      });
    } catch (error) {
      toast.error("Erro ao conectar", {
        description: "Ocorreu um erro ao tentar fazer login. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (values: AuthFormValues) => {
    if (!values.username || !values.fullName) {
      toast.error("Campos obrigatórios", {
        description: "Preencha todos os campos obrigatórios.",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            username: values.username,
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        toast.error("Erro no cadastro", {
          description: error.message,
        });
        return;
      }

      toast.success("Cadastro realizado!", {
        description: "Sua conta foi criada com sucesso.",
      });
      
      // Switch to login tab after successful registration
      setAuthMode("login");
    } catch (error) {
      toast.error("Erro ao cadastrar", {
        description: "Ocorreu um erro ao tentar criar sua conta. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error("Email é obrigatório");
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error("Erro", {
          description: error.message,
        });
        return;
      }

      setResetEmailSent(true);
    } catch (error) {
      toast.error("Erro na solicitação", {
        description: "Não foi possível enviar o email de redefinição. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <ParticleBackground />
      
      <div className="z-10 w-full max-w-md">
        <div className="text-center mb-6">
          <Logo variant="large" />
          <p className="text-lg text-foreground/70 mt-2">
            Marketing automatizado com inteligência artificial
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/90">
          <CardHeader>
            <CardTitle className="text-xl">
              {authMode === "login" ? "Acesse sua conta" : "Crie sua conta"}
            </CardTitle>
            <CardDescription>
              {authMode === "login" 
                ? "Entre com suas credenciais abaixo" 
                : "Preencha os dados para criar uma nova conta"}
            </CardDescription>
          </CardHeader>
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleLogin({
                  email: formData.get("email") as string,
                  password: formData.get("password") as string
                });
              }}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <button
                        type="button"
                        onClick={() => setResetEmailSent(true)}
                        className="text-sm text-primary hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full btn-pulse"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar na Agência"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleRegister({
                  email: formData.get("email") as string,
                  password: formData.get("password") as string,
                  username: formData.get("username") as string,
                  fullName: formData.get("fullName") as string
                });
              }}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Email</Label>
                    <Input
                      id="email-register"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Nome de usuário</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="seunome123"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Seu Nome Completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Senha</Label>
                    <Input
                      id="password-register"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button
                    type="submit"
                    className="w-full btn-pulse"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar conta"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      <AlertDialog open={resetEmailSent} onOpenChange={setResetEmailSent}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Redefinir senha</AlertDialogTitle>
            <AlertDialogDescription>
              {!resetEmail ? (
                <>
                  Insira seu endereço de email e enviaremos um link para redefinir sua senha.
                  <form onSubmit={handleResetPassword} className="mt-4">
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="mb-4"
                      required
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setResetEmailSent(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Enviando..." : "Enviar link"}
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  Se houver uma conta associada a {resetEmail}, você receberá um email com instruções para redefinir sua senha em breve.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {resetEmail && (
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => {
                setResetEmailSent(false);
                setResetEmail("");
              }}>
                Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Login;
