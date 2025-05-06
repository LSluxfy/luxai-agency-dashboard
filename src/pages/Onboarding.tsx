
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, ArrowRight, Upload, Sparkles } from "lucide-react";
import OnboardingStepIndicator from "@/components/ui-custom/OnboardingStepIndicator";
import Logo from "@/components/ui-custom/Logo";
import { useToast } from "@/hooks/use-toast";

const STEPS = [
  "Informações",
  "Criativos",
  "Objetivo",
  "Configuração"
];

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    niche: "",
    targetAudience: "",
    files: [] as string[],
    objective: "leads",
    budget: 1000,
    location: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = () => {
    // Simulate file upload
    const newFile = `file-${Math.floor(Math.random() * 1000)}.jpg`;
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, newFile]
    }));
    
    toast({
      title: "Arquivo enviado",
      description: `${newFile} foi carregado com sucesso.`
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Estratégia criada!",
        description: "Sua campanha foi criada com sucesso."
      });
      navigate("/dashboard");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Logo variant="large" />
          <h1 className="text-2xl font-bold mt-4">Criar Nova Campanha</h1>
          <p className="text-muted-foreground">
            Preencha as informações abaixo para que nossa IA crie uma estratégia personalizada
          </p>
        </div>

        <OnboardingStepIndicator steps={STEPS} currentStep={currentStep} />

        <Card className="mt-8">
          <CardContent className="pt-6">
            {/* Step 1: Company Information */}
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="companyName">Nome da Empresa/Produto</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Nome da sua empresa ou produto"
                    value={formData.companyName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://www.seusite.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="niche">Nicho de Mercado</Label>
                  <Select 
                    value={formData.niche} 
                    onValueChange={(value) => handleSelectChange("niche", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="educacao">Educação</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="targetAudience">Público-Alvo</Label>
                  <Textarea
                    id="targetAudience"
                    name="targetAudience"
                    placeholder="Descreva seu público-alvo (idade, interesses, comportamentos)"
                    value={formData.targetAudience}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Creative uploads */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-semibold">Arraste arquivos ou clique para fazer upload</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Suporta imagens, vídeos e PDFs até 20MB
                  </p>
                  <Button 
                    onClick={handleFileUpload} 
                    variant="secondary" 
                    className="mt-4"
                  >
                    Selecionar Arquivos
                  </Button>
                </div>

                {formData.files.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Arquivos carregados ({formData.files.length})</h4>
                    <ul className="space-y-2">
                      {formData.files.map((file, index) => (
                        <li key={index} className="text-sm bg-secondary p-2 rounded-md">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Campaign Objective */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-base">Selecione o objetivo da campanha</Label>
                  <RadioGroup
                    value={formData.objective}
                    onValueChange={(value) => handleSelectChange("objective", value)}
                    className="grid grid-cols-1 gap-4 mt-3 md:grid-cols-3"
                  >
                    <label
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        formData.objective === "leads" ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="leads" className="sr-only" />
                      <Users className="mb-3 h-6 w-6" />
                      <div className="text-center">
                        <h3 className="font-medium">Geração de Leads</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Capture contatos qualificados para seu negócio
                        </p>
                      </div>
                    </label>
                    
                    <label
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        formData.objective === "conversao" ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="conversao" className="sr-only" />
                      <TrendingUp className="mb-3 h-6 w-6" />
                      <div className="text-center">
                        <h3 className="font-medium">Conversão</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aumente vendas e conversões do seu site
                        </p>
                      </div>
                    </label>
                    
                    <label
                      className={`flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer ${
                        formData.objective === "alcance" ? "border-primary" : ""
                      }`}
                    >
                      <RadioGroupItem value="alcance" className="sr-only" />
                      <Activity className="mb-3 h-6 w-6" />
                      <div className="text-center">
                        <h3 className="font-medium">Alcance</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Aumente a visibilidade e reconhecimento da marca
                        </p>
                      </div>
                    </label>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 4: Budget and location */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label htmlFor="budget">Orçamento Mensal (R$)</Label>
                    <span className="text-sm font-medium">
                      R$ {formData.budget.toLocaleString()}
                    </span>
                  </div>
                  <Slider
                    id="budget"
                    min={500}
                    max={50000}
                    step={500}
                    value={[formData.budget]}
                    onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>R$ 500</span>
                    <span>R$ 50.000</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="location">Localização do Público</Label>
                  <Select 
                    value={formData.location} 
                    onValueChange={(value) => handleSelectChange("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a localização" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="brasil">Todo o Brasil</SelectItem>
                      <SelectItem value="sudeste">Região Sudeste</SelectItem>
                      <SelectItem value="sul">Região Sul</SelectItem>
                      <SelectItem value="norte">Região Norte</SelectItem>
                      <SelectItem value="nordeste">Região Nordeste</SelectItem>
                      <SelectItem value="centro-oeste">Região Centro-Oeste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between">
          <Button onClick={prevStep} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {currentStep === 0 ? "Voltar" : "Anterior"}
          </Button>
          
          {currentStep === STEPS.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="btn-pulse">
              <Sparkles className="mr-2 h-4 w-4" />
              {isSubmitting ? "Criando..." : "Criar Estratégia com IA"}
            </Button>
          ) : (
            <Button onClick={nextStep}>
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
