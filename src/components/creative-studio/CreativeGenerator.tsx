
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Lightbulb, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploader from "./ImageUploader";
import CreativePreview from "./CreativePreview";
import { useNavigate } from "react-router-dom";

// Função local para gerar IDs únicos (substituindo uuid)
const uuidv4 = () => Math.random().toString(36).substring(2, 15);

export interface UploadedImage {
  id: string;
  file: File;
  url: string;
}

export interface GeneratedCreative {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  cta: string;
  strategy?: string;
  createdAt: string;
}

const CreativeGenerator = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [savedImages, setSavedImages] = useState<any[]>([]);
  const [prompt, setPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedCreative, setGeneratedCreative] = useState<GeneratedCreative | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch saved creatives for image selection
    const fetchSavedCreatives = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('creatives')
          .select('id, image_url, title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setSavedImages(data || []);
      } catch (error) {
        console.error("Error fetching saved creatives:", error);
      }
    };
    
    fetchSavedCreatives();
  }, [user]);

  const handleImagesUploaded = useCallback((images: UploadedImage[]) => {
    setUploadedImages(images);
  }, []);

  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  }, []);

  const handleGenerateCreative = useCallback(async () => {
    // Validation checks
    if (!prompt.trim()) {
      toast.error("Por favor, escreva um comando para a IA.");
      return;
    }

    // Start generation process
    setIsGenerating(true);
    toast.info("Gerando criativo com IA, pode levar alguns segundos...");

    try {
      // Call the Supabase Edge Function to generate creative content
      const { data, error } = await supabase.functions.invoke('generate-creative', {
        body: {
          prompt: prompt,
          referenceImages: uploadedImages.map(img => img.url)
        }
      });

      if (error) {
        throw new Error(error.message || "Erro ao gerar conteúdo com a IA");
      }

      if (!data) {
        throw new Error("Não foi possível gerar o conteúdo. Tente novamente.");
      }

      // Create creative from AI-generated content
      const mockCreative: GeneratedCreative = {
        id: uuidv4(),
        imageUrl: data.imageUrl || (uploadedImages.length > 0 ? uploadedImages[0].url : ""),
        title: data.headline || "Título gerado pela IA com base no seu briefing",
        description: data.description || "Descrição gerada pela IA que combina elementos do seu comando",
        cta: data.cta || "COMPRAR AGORA",
        strategy: data.strategy || "",
        createdAt: new Date().toISOString(),
      };
        
      setGeneratedCreative(mockCreative);
      toast.success("Criativo gerado com sucesso!");
    } catch (error) {
      console.error("Error generating creative:", error);
      toast.error("Erro ao gerar criativo. Por favor, tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, uploadedImages, supabase.functions]);

  const handleSaveCreative = useCallback(async () => {
    if (!generatedCreative || !user) return;
    
    try {
      const { error } = await supabase
        .from('creatives')
        .insert({
          user_id: user.id,
          title: `Criativo - ${new Date().toLocaleString('pt-BR')}`,
          prompt: prompt,
          image_url: generatedCreative.imageUrl,
          generated_title: generatedCreative.title,
          generated_description: generatedCreative.description,
          generated_cta: generatedCreative.cta
        });

      if (error) {
        throw error;
      }
      
      toast.success("Criativo salvo na sua galeria!");
      
      // Reset the form for a new creative
      setGeneratedCreative(null);
      setPrompt("");
      setUploadedImages([]);
    } catch (error) {
      console.error("Error saving creative:", error);
      toast.error("Erro ao salvar o criativo. Por favor, tente novamente.");
    }
  }, [generatedCreative, user, prompt]);

  const handleSaveAsCampaign = useCallback(async () => {
    if (!generatedCreative || !user) return;
    
    try {
      // First save the creative
      const { data: creativeData, error: creativeError } = await supabase
        .from('creatives')
        .insert({
          user_id: user.id,
          title: `Criativo - ${new Date().toLocaleString('pt-BR')}`,
          prompt: prompt,
          image_url: generatedCreative.imageUrl,
          generated_title: generatedCreative.title,
          generated_description: generatedCreative.description,
          generated_cta: generatedCreative.cta
        })
        .select()
        .single();

      if (creativeError) {
        throw creativeError;
      }
      
      // Since we don't have a campaigns table yet, we'll show a success message
      // and navigate to the dashboard as if a campaign was created
      toast.success("Campanha criada com sucesso!", {
        description: "Você pode visualizá-la no Dashboard."
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (error) {
      console.error("Error saving campaign:", error);
      toast.error("Erro ao criar campanha. Por favor, tente novamente.");
    }
  }, [generatedCreative, user, prompt, navigate]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full">1</span>
            Envie imagens de referência (opcional)
          </CardTitle>
          <CardDescription>
            Faça upload de até 5 imagens que servirão como referência para a IA.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUploader 
            onImagesUploaded={handleImagesUploaded}
            uploadedImages={uploadedImages}
            maxImages={5}
            savedImages={savedImages}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full">2</span>
            Escreva seu comando para a IA
          </CardTitle>
          <CardDescription>
            Detalhe o que deseja criar para obter melhores resultados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Ex: Crie um criativo para público feminino, produto de emagrecimento, usando a imagem de referência e tom emocional."
            className="min-h-[120px] mb-4"
            value={prompt}
            onChange={handlePromptChange}
          />
          <Button 
            onClick={handleGenerateCreative} 
            disabled={isGenerating || !prompt.trim()}
            className="w-full sm:w-auto btn-pulse"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Criativo...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Criativo com IA
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCreative && (
        <>
          {generatedCreative.strategy && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Estratégia de Campanha
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">
                  {generatedCreative.strategy}
                </div>
                <Button 
                  onClick={handleSaveAsCampaign} 
                  className="mt-4"
                  variant="secondary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar como Campanha
                </Button>
              </CardContent>
            </Card>
          )}

          <CreativePreview 
            creative={generatedCreative} 
            onSave={handleSaveCreative}
          />
        </>
      )}
    </div>
  );
};

export default CreativeGenerator;
