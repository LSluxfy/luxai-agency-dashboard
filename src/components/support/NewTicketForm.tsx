
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/integrations/supabase/client";

interface FormData {
  subject: string;
  message: string;
  category: string;
}

interface NewTicketFormProps {
  user: any; // Using any for simplicity, ideally should be properly typed
  onTicketSubmitted: () => void;
}

const NewTicketForm = ({ user, onTicketSubmitted }: NewTicketFormProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormData>({
    defaultValues: {
      subject: "",
      message: "",
      category: "general",
    },
  });

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
        .from("support_tickets")
        .insert({
          user_id: user.id,
          subject: data.subject,
          message: data.message,
          status: "pending",
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Ticket enviado com sucesso",
        description: "Seu ticket de suporte foi enviado. Responderemos em breve.",
      });

      // Reset form
      form.reset({
        subject: "",
        message: "",
        category: "general",
      });

      // Notify parent component to refresh tickets list
      onTicketSubmitted();
    } catch (error) {
      console.error("Error submitting support ticket:", error);
      toast({
        title: "Erro ao enviar ticket",
        description: "Não foi possível enviar seu ticket. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
  );
};

export default NewTicketForm;
