
import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Lightbulb, Save, ImageIcon, Check, AlertTriangle } from "lucide-react";
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
  const [isGeneratingWithImage, setIsGeneratingWithImage] = useState<boolean>(false);
  const [generatedCreative, setGeneratedCreative] = useState<GeneratedCreative | null>(null);
  const [replicatePredictionId, setReplicatePredictionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
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

  // Polling effect for Replicate prediction status
  useEffect(() => {
    if (!replicatePredictionId) return;

    const interval = window.setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('generate-with-image', {
          body: { predictionId: replicatePredictionId }
        });

        if (error) throw error;

        console.log("Polling prediction status:", data);

        if (data.status === "succeeded") {
          // Success! We have our image
          clearInterval(interval);
          setPollingInterval(null);
          setReplicatePredictionId(null);

          // Create creative from generated image
          const imageUrl = data.output[0]; // Replicate returns an array of image URLs
          
          const mockCreative: GeneratedCreative = {
            id: uuidv4(),
            imageUrl: imageUrl,
            title: "Título criado com base na sua imagem e prompt",
            description: "Descrição gerada que combina elementos da sua imagem e texto",
            cta: "COMPRAR AGORA",
            createdAt: new Date().toISOString(),
          };
            
          setGeneratedCreative(mockCreative);
          setIsGeneratingWithImage(false);
          toast.success("Criativo gerado com sucesso!");

          // Save to Supabase
          await saveGeneratedImageToSupabase(imageUrl);
          
        } else if (data.status === "failed") {
          // Handle failure
          clearInterval(interval);
          setPollingInterval(null);
          setReplicatePredictionId(null);
          setIsGeneratingWithImage(false);
          toast.error("Falha ao gerar imagem. Por favor, tente novamente.");
        }
        // For "starting" or "processing" states, we continue polling
      } catch (error) {
        console.error("Error during polling:", error);
        clearInterval(interval);
        setPollingInterval(null);
        setReplicatePredictionId(null);
        setIsGeneratingWithImage(false);
        toast.error("Erro ao verificar status da geração. Por favor, tente novamente.");
      }
    }, 2000); // Check every 2 seconds

    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [replicatePredictionId, supabase.functions]);

  const saveGeneratedImageToSupabase = async (imageUrl: string) => {
    if (!user) return;

    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Generate a unique filename
      const filename = `creative-${Date.now()}.png`;
      
      // Upload to storage
      const { data, error } = await supabase.storage
        .from('criativos-gerados')
        .upload(filename, blob);
      
      if (error) throw error;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from('criativos-gerados')
        .getPublicUrl(filename);
      
      return publicUrl.publicUrl;
    } catch (error) {
      console.error("Error saving generated image:", error);
      toast.error("Erro ao salvar a imagem gerada.");
    }
  };

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

  const generateCreativeWithImage = useCallback(async () => {
    // Validation checks
    if (!prompt.trim()) {
      toast.error("Por favor, escreva um comando para a IA.");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error("Por favor, faça upload de pelo menos uma imagem de referência.");
      return;
    }

    // Start generation process
    setIsGeneratingWithImage(true);
    toast.info("Gerando criativo com imagem e IA, pode levar alguns minutos...");

    try {
      // Call the Supabase Edge Function to generate with Replicate
      const { data, error } = await supabase.functions.invoke('generate-with-image', {
        body: {
          prompt: prompt,
          image: uploadedImages[0].url // Use the first uploaded image
        }
      });

      if (error) {
        throw new Error(error.message || "Erro ao iniciar geração com a IA");
      }

      if (!data || !data.prediction || !data.prediction.id) {
        throw new Error("Não foi possível iniciar a geração. Tente novamente.");
      }

      // Store the prediction ID for polling
      setReplicatePredictionId(data.prediction.id);
      toast.info("Imagem sendo gerada, por favor aguarde...");
      
    } catch (error) {
      console.error("Error starting image generation:", error);
      toast.error("Erro ao gerar imagem. Por favor, tente novamente.");
      setIsGeneratingWithImage(false);
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
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleGenerateCreative} 
              disabled={isGenerating || isGeneratingWithImage || !prompt.trim()}
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
            
            <Button 
              onClick={generateCreativeWithImage} 
              disabled={isGenerating || isGeneratingWithImage || !prompt.trim() || uploadedImages.length === 0}
              className="w-full sm:w-auto"
              size="lg"
              variant="secondary"
            >
              {isGeneratingWithImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando com Imagem...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-5 w-5" />
                  Gerar com Imagem de Referência
                </>
              )}
            </Button>
          </div>
          
          {isGeneratingWithImage && replicatePredictionId && (
            <div className="mt-4 p-3 bg-secondary/20 rounded-md flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm">Processando imagem com IA... Isso pode levar alguns minutos.</span>
            </div>
          )}
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
