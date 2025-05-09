
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Loader2, Upload, Image as ImageIcon, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

type FormData = {
  prompt: string;
  strength: number[];
};

const SdxlGenerator = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [imageResult, setImageResult] = useState<string | null>(null);
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  
  const form = useForm<FormData>({
    defaultValues: {
      prompt: "",
      strength: [0.7],
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
      setBaseImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearBaseImage = () => {
    setBaseImage(null);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setProgress(10);
    setImageResult(null);
    
    try {
      // Prepare request body
      const requestBody: any = {
        directGeneration: true,
        prompt: data.prompt,
      };
      
      // If we have a base image, add it and strength to the request
      if (baseImage) {
        requestBody.image = baseImage;
        requestBody.strength = data.strength[0];
        delete requestBody.directGeneration; // Switch to img2img mode
      }
      
      // Call the Supabase Edge Function
      const { data: responseData, error } = await supabase.functions.invoke('generate-with-image', {
        body: requestBody
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar imagem");
      }
      
      if (!responseData?.prediction) {
        throw new Error("Resposta inválida da API");
      }
      
      // If the response contains a direct output (from SDXL direct generation)
      if (responseData.prediction.output && Array.isArray(responseData.prediction.output)) {
        setImageResult(responseData.prediction.output[0]);
        setLoading(false);
        setProgress(100);
        toast.success("Imagem gerada com sucesso!");
        return;
      }
      
      // Otherwise start polling for the result (for img2img)
      setPredictionId(responseData.prediction.id);
      startPolling(responseData.prediction.id);
      setProgress(20);
      
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Erro ao gerar imagem: " + (error instanceof Error ? error.message : "Erro desconhecido"));
      setLoading(false);
      setProgress(0);
    }
  };
  
  const startPolling = (id: string) => {
    // Clear any existing polling interval
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    // Start polling every 3 seconds
    const interval = window.setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-with-image', {
          body: { predictionId: id }
        });
        
        if (error) throw error;
        
        console.log("Polling result:", data);
        
        // Update progress
        if (data.status === "processing") {
          setProgress(prev => Math.min(prev + 5, 90));
        } else if (data.status === "succeeded") {
          // Success! We have our image
          if (data.output && data.output.length > 0) {
            setImageResult(data.output[0]);
            toast.success("Imagem gerada com sucesso!");
          } else {
            toast.error("A geração foi concluída, mas nenhuma imagem foi retornada.");
          }
          clearInterval(interval);
          setPollingInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(100);
        } else if (data.status === "failed") {
          toast.error(`Falha ao gerar imagem: ${data.error || "Erro desconhecido"}`);
          clearInterval(interval);
          setPollingInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
        }
      } catch (error) {
        console.error("Error polling for result:", error);
        clearInterval(interval);
        setPollingInterval(null);
        setPredictionId(null);
        setLoading(false);
        setProgress(0);
        toast.error("Erro ao verificar status da geração");
      }
    }, 3000);
    
    setPollingInterval(interval);
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-3">Gerador de Imagem com SDXL</h2>
      <p className="text-muted-foreground mb-4">
        Use o modelo SDXL para gerar imagens de alta qualidade a partir de descrições textuais ou transforme imagens existentes.
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
            <FormLabel>Enviar imagem base (opcional)</FormLabel>
            <div className="flex flex-col space-y-3">
              <div className="border border-dashed border-gray-300 rounded-md p-4 transition-colors hover:bg-muted/30 cursor-pointer">
                <label className="flex flex-col items-center gap-2 cursor-pointer">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {baseImage ? "Clique para trocar a imagem" : "Clique para fazer upload ou arraste uma imagem"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
              
              {baseImage && (
                <div className="relative">
                  <img 
                    src={baseImage} 
                    alt="Imagem base" 
                    className="w-full max-h-[300px] object-contain rounded-md border" 
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={clearBaseImage}
                  >
                    Remover
                  </Button>
                </div>
              )}
            </div>
            
            {baseImage && (
              <FormField
                control={form.control}
                name="strength"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Força da modificação</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <Slider
                          min={10}
                          max={100}
                          step={1}
                          value={[field.value[0] * 100]}
                          onValueChange={(value) => field.onChange([value[0] / 100])}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Sutil ({(field.value[0] * 100).toFixed(0)}%)</span>
                          <span>Intensa</span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Valores mais baixos preservam mais detalhes da imagem original.
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}
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
            ) : baseImage ? (
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
            <div className="relative aspect-square">
              <img 
                src={imageResult} 
                alt="Imagem gerada" 
                className="w-full h-full object-contain rounded-md" 
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
                  a.download = `sdxl-generation-${Date.now()}.png`;
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

export default SdxlGenerator;
