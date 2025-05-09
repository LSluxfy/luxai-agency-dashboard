
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Loader2, Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type FormData = {
  prompt: string;
};

const FluxProGenerator = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  
  const form = useForm<FormData>({
    defaultValues: {
      prompt: "",
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error("Apenas imagens JPG ou PNG são permitidas");
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("O arquivo deve ter menos de 5MB");
      return;
    }
    
    // Convert to data URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setReferenceImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearReferenceImage = () => {
    setReferenceImage(null);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setProgress(20);
    setImageResult(null);
    
    try {
      // Prepare request body
      const requestBody: any = {
        prompt: data.prompt,
      };
      
      // If we have a reference image, add it to the request
      if (referenceImage) {
        requestBody.referenceImage = referenceImage;
      }
      
      setProgress(40);
      
      // Call the Supabase Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('generate-flux-pro', {
        body: requestBody
      });

      setProgress(80);

      if (error) {
        throw new Error(error.message || "Erro ao gerar imagem");
      }
      
      if (!responseData?.image) {
        throw new Error("Resposta inválida da API");
      }
      
      // Set the result image
      setImageResult(responseData.image);
      toast.success("Imagem gerada com sucesso!");
      
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Erro ao gerar imagem: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Gerador de Imagem com Flux Pro</h2>
      <p className="text-muted-foreground mb-4">
        Use o modelo Flux Pro para gerar imagens de alta qualidade a partir de descrições textuais ou transforme imagens existentes.
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Prompt field */}
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descreva a imagem que deseja gerar</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Ex: Uma foto profissional de um gato siamês em um jardim ensolarado, alta resolução" 
                    className="min-h-[100px]" 
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          {/* Image upload */}
          <div className="space-y-2">
            <FormLabel>Imagem de referência (opcional)</FormLabel>
            <div className="flex flex-col space-y-3">
              <div className="border border-dashed border-gray-300 rounded-md p-4 transition-colors hover:bg-muted/30 cursor-pointer">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {referenceImage ? "Clique para trocar a imagem" : "Clique para fazer upload ou arraste uma imagem"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              {referenceImage && (
                <div className="relative">
                  <img 
                    src={referenceImage} 
                    alt="Imagem de referência" 
                    className="w-full max-h-[300px] object-contain rounded-md border" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearReferenceImage}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
          </div>
          
          {/* Submit button */}
          <Button 
            type="submit" 
            disabled={loading || !form.getValues().prompt}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : referenceImage ? (
              <>
                <ImageIcon className="mr-2 h-5 w-5" />
                Transformar Imagem
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Nova Imagem
              </>
            )}
          </Button>
          
          {/* Progress bar */}
          {loading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{progress}%</p>
            </div>
          )}
        </form>
      </Form>
      
      {/* Result display */}
      {imageResult && (
        <Card className="mt-8">
          <CardContent className="p-4">
            <div className="text-center mb-2">
              <h3 className="font-medium">Imagem Gerada</h3>
            </div>
            <div className="relative">
              <img 
                src={imageResult} 
                alt="Imagem gerada" 
                className="w-full object-contain rounded-md" 
              />
            </div>
            <div className="mt-4 flex justify-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open(imageResult, '_blank')}
              >
                Ver em tamanho completo
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = imageResult;
                  a.download = `flux-pro-generation-${Date.now()}.png`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
              >
                Baixar imagem
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FluxProGenerator;
