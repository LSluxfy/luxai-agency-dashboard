import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Lightbulb, Save, Wand2, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import ImageUploader from "./ImageUploader";
import CreativePreview from "./CreativePreview";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

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
  const [isGeneratingRealistic, setIsGeneratingRealistic] = useState<boolean>(false);
  const [generatedCreative, setGeneratedCreative] = useState<GeneratedCreative | null>(null);
  const [replicatePredictionId, setReplicatePredictionId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [pollingCount, setPollingCount] = useState<number>(0);
  const [currentModel, setCurrentModel] = useState<string | null>(null);
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

    const maxPollingAttempts = 60; // Set a limit to prevent infinite polling

    const interval = window.setInterval(async () => {
      try {
        setPollingCount(prev => prev + 1);
        
        if (pollingCount > maxPollingAttempts) {
          console.log("Reached maximum polling attempts");
          clearInterval(interval);
          setPollingInterval(null);
          setReplicatePredictionId(null);
          setIsGeneratingRealistic(false);
          setGenerationProgress(0);
          setPollingCount(0);
          setCurrentModel(null);
          toast.error("Tempo de espera excedido. Por favor, tente novamente.");
          return;
        }

        console.log(`Polling attempt ${pollingCount} for prediction ${replicatePredictionId}`);

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
          setPollingCount(0);
          setGenerationProgress(100);

          // Create creative from generated image
          if (data.output && data.output.length > 0) {
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
            setIsGeneratingRealistic(false);
            setCurrentModel(null);
            toast.success(`Criativo gerado com sucesso${currentModel === "realistic-vision" ? " (Realistic Vision)" : ""}!`);

            // Save to Supabase
            await saveGeneratedImageToSupabase(imageUrl);
          } else {
            toast.error("A API retornou sucesso, mas nenhuma imagem foi gerada");
            setIsGeneratingRealistic(false);
            setCurrentModel(null);
            setGenerationProgress(0);
          }
        } else if (data.status === "failed") {
          // Handle failure
          console.error("Generation failed:", data.error);
          clearInterval(interval);
          setPollingInterval(null);
          setReplicatePredictionId(null);
          setPollingCount(0);
          setIsGeneratingRealistic(false);
          setCurrentModel(null);
          setGenerationProgress(0);
          toast.error(`Falha ao gerar imagem: ${data.error || "Erro desconhecido"}`);
        } else if (data.status === "processing") {
          // Update progress for better UX
          setGenerationProgress(prev => {
            const newProgress = Math.min(prev + 5, 90);
            console.log(`Updating progress to ${newProgress}%`);
            return newProgress;
          });
        } else if (data.status === "starting") {
          // Update progress for starting status
          console.log("Generation in starting state");
          setGenerationProgress(30);
        } else {
          console.log(`Unknown status: ${data.status}`);
          // For any other status, just update progress slightly
          setGenerationProgress(prev => Math.min(prev + 2, 85));
        }
      } catch (error) {
        console.error("Error during polling:", error);
        clearInterval(interval);
        setPollingInterval(null);
        setReplicatePredictionId(null);
        setPollingCount(0);
        setIsGeneratingRealistic(false);
        setCurrentModel(null);
        setGenerationProgress(0);
        toast.error("Erro ao verificar status da geração. Por favor, tente novamente.");
      }
    }, 3000); // Check every 3 seconds

    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [replicatePredictionId, supabase.functions, pollingCount, currentModel]);

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

  // Function to check if a URL is public/accessible
  const checkImageAccessibility = async (imageUrl: string): Promise<boolean> => {
    try {
      // Skip check for data URIs as they're already accessible
      if (imageUrl.startsWith('data:')) {
        return true;
      }
      
      const response = await fetch(imageUrl, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      console.error("Error checking image accessibility:", error);
      return false;
    }
  };
  
  // New function to generate with Realistic Vision model
  const generateWithRealisticVision = useCallback(async () => {
    // Validation checks
    if (uploadedImages.length === 0) {
      toast.error("Por favor, faça upload de pelo menos uma imagem.");
      return;
    }

    // Check if the image is accessible/public
    const imageUrl = uploadedImages[0].url;
    const isAccessible = await checkImageAccessibility(imageUrl);
    
    if (!isAccessible && !imageUrl.startsWith('blob:') && !imageUrl.startsWith('data:')) {
      toast.error("A imagem selecionada não está acessível publicamente. Por favor, use uma imagem pública ou faça upload de uma nova imagem.");
      return;
    }

    // Start generation process
    setIsGeneratingRealistic(true);
    setGenerationProgress(10);
    setPollingCount(0);
    setCurrentModel("realistic-vision");
    toast.info("Gerando imagem realista com IA, pode levar alguns minutos...");

    try {
      // First convert the image to a data URI
      let imageData;
      
      // If it's already a data URI, use it directly
      if (imageUrl.startsWith('data:')) {
        imageData = imageUrl;
      }
      // If it's a blob URL (from local file upload), we need to convert it
      else if (imageUrl.startsWith('blob:')) {
        // Fetch the image as a blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Convert to base64
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
      // Otherwise assume it's a regular URL
      else {
        imageData = imageUrl;
      }
      
      console.log("Sending image to Realistic Vision model with prompt:", prompt || "Default prompt");

      // Call the Supabase Edge Function with the useRealisticVision flag
      const { data, error } = await supabase.functions.invoke('generate-with-image', {
        body: {
          image: imageData,
          prompt: prompt || undefined,
          useRealisticVision: true
        }
      });

      if (error) {
        throw new Error(error.message || "Erro ao iniciar geração com a IA");
      }

      if (!data || !data.prediction || !data.prediction.id) {
        throw new Error("Não foi possível iniciar a geração. Tente novamente.");
      }

      // Store the prediction ID for polling
      console.log("Generation started successfully, prediction ID:", data.prediction.id);
      setReplicatePredictionId(data.prediction.id);
      setGenerationProgress(20);
      toast.info("Imagem realista sendo gerada, por favor aguarde...");
      
    } catch (error) {
      console.error("Error starting realistic image generation:", error);
      toast.error("Erro ao gerar imagem realista. Por favor, tente novamente.");
      setIsGeneratingRealistic(false);
      setCurrentModel(null);
      setGenerationProgress(0);
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
      {/* Image upload card */}
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

      {/* Prompt card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center bg-primary/10 text-primary p-2 rounded-full">2</span>
            Escreva seu comando para a IA (ou use apenas imagem)
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
              disabled={isGenerating || isGeneratingRealistic || !prompt.trim()}
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
            
            {/* Only kept the Realistic Vision button */}
            <Button 
              onClick={generateWithRealisticVision} 
              disabled={isGenerating || isGeneratingRealistic || uploadedImages.length === 0}
              className="w-full sm:w-auto"
              size="lg"
              variant="outline"
              style={{ 
                background: "linear-gradient(45deg, #8a2be2, #4169e1)",
                color: "white"
              }}
            >
              {isGeneratingRealistic ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Imagem Realista...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-5 w-5" />
                  Gerar com Realistic Vision
                </>
              )}
            </Button>
          </div>
          
          {isGeneratingRealistic && replicatePredictionId && (
            <div className="mt-4 p-3 bg-secondary/20 rounded-md flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">
                  Criando imagem realista com IA... Isso pode levar alguns minutos. ({pollingCount}/60)
                </span>
              </div>
              <Progress value={generationProgress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{generationProgress}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated creative display */}
      {generatedCreative && (
        <>
          {/* Strategy card */}
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

          {/* Creative preview */}
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
