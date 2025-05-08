
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Upload, Link } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function GenerateVideoButton() {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [statusCheckInterval, setStatusCheckInterval] = useState<number | null>(null);
  const [checkCount, setCheckCount] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tabValue, setTabValue] = useState<string>("url");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Limpar o intervalo quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (statusCheckInterval) {
        clearInterval(statusCheckInterval);
      }
    };
  }, [statusCheckInterval]);

  // Gerenciar a verificação de status quando temos um ID de previsão
  useEffect(() => {
    if (!predictionId) return;
    
    const maxChecks = 60; // Máximo de 3 minutos (3s * 60)
    
    // Iniciar a verificação a cada 3 segundos
    const interval = window.setInterval(async () => {
      // Incrementar o contador
      setCheckCount(prev => {
        const newCount = prev + 1;
        
        // Atualizar o progresso (0-95%)
        const newProgress = Math.min(5 + (newCount * 90 / maxChecks), 95);
        setProgress(newProgress);
        
        // Se atingir o número máximo de verificações, parar
        if (newCount >= maxChecks) {
          clearInterval(interval);
          setStatusCheckInterval(null);
          setError("Tempo limite excedido para gerar o vídeo.");
          toast.error("Tempo limite excedido. Por favor, tente novamente.");
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
        }
        
        return newCount;
      });
      
      try {
        // Verificar o status da geração do vídeo
        console.log(`Verificando status do vídeo (tentativa ${checkCount + 1})...`);
        
        const { data, error } = await supabase.functions.invoke("check-video-status", {
          body: { id: predictionId }
        });
        
        if (error) {
          console.error("Erro ao verificar status:", error);
          throw new Error(error.message || "Erro ao verificar status");
        }
        
        console.log("Resposta da verificação de status:", data);
        
        if (data.status === "succeeded") {
          // Vídeo gerado com sucesso
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setProgress(100);
          setLoading(false);
          
          const output = data.output;
          if (output && typeof output === "string") {
            setVideoUrl(output);
            toast.success("Vídeo gerado com sucesso!");
          } else {
            throw new Error("Formato de output inválido: " + JSON.stringify(output));
          }
        } else if (data.status === "failed") {
          // Falha na geração
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
          const errorMsg = data.message || "Falha na geração do vídeo";
          setError(`Falha na geração: ${errorMsg}`);
          toast.error(`Falha na geração: ${errorMsg}`);
        }
      } catch (err: any) {
        console.error("Erro ao verificar o status:", err);
        // Apenas mostramos o erro se for a última tentativa ou se for um erro crítico
        if (checkCount >= maxChecks - 1) {
          clearInterval(interval);
          setStatusCheckInterval(null);
          setPredictionId(null);
          setLoading(false);
          setProgress(0);
          setError("Erro ao verificar o status da geração do vídeo: " + err.message);
          toast.error("Erro ao verificar o status. Por favor, tente novamente.");
        }
      }
    }, 3000);
    
    setStatusCheckInterval(interval);
    
    // Limpar o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, [predictionId, checkCount]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Validar tipo de arquivo (apenas imagens)
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, selecione um arquivo de imagem válido");
        return;
      }
      
      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("O arquivo é muito grande. Tamanho máximo permitido: 5MB");
        return;
      }
      
      setSelectedFile(file);
      
      // Criar URL de visualização
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Limpar o URL antigo ao desmontar
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const convertFileToDataUri = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Falha ao converter arquivo para Data URI'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Erro ao ler o arquivo'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateVideo = async () => {
    // Verificar se temos uma URL ou um arquivo
    const isUrlMode = tabValue === "url";
    
    if (isUrlMode && !imageUrl.trim()) {
      toast.error("Por favor, forneça uma URL de imagem válida");
      return;
    }
    
    if (!isUrlMode && !selectedFile) {
      toast.error("Por favor, selecione um arquivo de imagem");
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setPredictionId(null);
    setProgress(5); // Iniciar com 5% para feedback visual
    setCheckCount(0);
    toast.info("Iniciando geração de vídeo com IA...");

    try {
      let imageSource;
      
      if (isUrlMode) {
        // Usar a URL diretamente
        imageSource = imageUrl.trim();
        console.log("Enviando requisição para gerar vídeo com a imagem URL:", imageSource);
      } else if (selectedFile) {
        // Converter o arquivo para Data URI
        imageSource = await convertFileToDataUri(selectedFile);
        console.log("Enviando requisição para gerar vídeo com imagem carregada");
      } else {
        throw new Error("Nenhuma imagem selecionada");
      }
      
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { imageUrl: imageSource }
      });
      
      if (error) {
        console.error("Erro da função de borda:", error);
        throw new Error(error.message || "Erro ao iniciar a geração do vídeo");
      }
      
      console.log("Resposta da função generate-video:", data);
      
      if (data.id) {
        // Temos um ID de previsão para acompanhar
        setPredictionId(data.id);
        toast.info("Geração de vídeo iniciada, por favor aguarde...");
      } else if (data.output) {
        // Resultado disponível imediatamente (improvável, mas possível)
        setProgress(100);
        setLoading(false);
        
        const output = data.output;
        if (typeof output === "string") {
          setVideoUrl(output);
          toast.success("Vídeo gerado com sucesso!");
        } else if (Array.isArray(output) && output.length > 0) {
          setVideoUrl(output[0]);
          toast.success("Vídeo gerado com sucesso!");
        } else {
          throw new Error("Formato de output inválido: " + JSON.stringify(output));
        }
      } else {
        // Resposta inesperada
        throw new Error("Resposta inesperada da API: " + JSON.stringify(data));
      }
    } catch (err: any) {
      console.error("Erro ao gerar vídeo:", err);
      const errorMessage = err.message || "Erro desconhecido ao gerar o vídeo";
      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      toast.error(`Erro ao gerar o vídeo: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={tabValue} onValueChange={setTabValue} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="url" className="flex items-center gap-1">
            <Link className="h-4 w-4" />
            URL da Imagem
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-1">
            <Upload className="h-4 w-4" />
            Upload de Imagem
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL da Imagem (HTTPS):</Label>
            <Input
              id="image-url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Certifique-se de que a imagem esteja publicamente acessível via HTTPS.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload de Imagem:</Label>
            <div className="grid gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <span className="text-sm font-medium">
                    Clique para fazer upload ou arraste uma imagem aqui
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PNG, JPG, GIF até 5MB
                  </span>
                </label>
              </div>
              
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Prévia:</p>
                  <div className="relative aspect-square w-full max-w-xs mx-auto border rounded-md overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Prévia da imagem"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    {selectedFile?.name} ({(selectedFile?.size || 0) / 1024 < 1024 
                      ? `${Math.round((selectedFile?.size || 0) / 1024)} KB` 
                      : `${((selectedFile?.size || 0) / (1024 * 1024)).toFixed(2)} MB`})
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button 
        onClick={handleGenerateVideo} 
        disabled={loading || (tabValue === "url" ? !imageUrl.trim() : !selectedFile)} 
        className="w-full sm:w-auto"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Gerando vídeo...
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Converter Imagem em Vídeo
          </>
        )}
      </Button>

      {loading && predictionId && (
        <div className="mt-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-1">
            Gerando vídeo ({progress.toFixed(0)}%)... Isso pode levar alguns minutos.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Erro na geração do vídeo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {videoUrl && (
        <div>
          <video
            src={videoUrl}
            controls
            className="mt-4 w-full rounded-lg shadow-lg"
          />
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            Se o vídeo não carregar, <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline flex items-center">
              clique aqui para abrir em uma nova aba <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
