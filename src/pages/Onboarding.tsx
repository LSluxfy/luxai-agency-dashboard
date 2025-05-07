
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Upload, Sparkles, Users, TrendingUp, Activity, Calendar as CalendarIcon, User, Target, Search } from "lucide-react";
import OnboardingStepIndicator from "@/components/ui-custom/OnboardingStepIndicator";
import Logo from "@/components/ui-custom/Logo";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const STEPS = [
  "Informações",
  "Criativos",
  "Objetivo",
  "Configuração"
];

const INTERESTS = [
  "Tecnologia", "Esportes", "Moda", "Viagens", "Gastronomia", "Fitness",
  "Beleza", "Música", "Cinema", "Jogos", "Carros", "Finanças",
  "Educação", "Pets", "Saúde", "Decoração", "Negócios", "Literatura"
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
    budget: 20,
    budgetType: "daily",
    country: "brasil",
    region: "",
    state: "",
    cities: [] as string[],
    customLocations: false,
    // New fields
    ageMin: "18",
    ageMax: "65",
    pixelId: "",
    interests: [] as string[],
    startDate: new Date(),
    endDate: null as Date | null,
    scheduled: false,
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

  const handleInterestToggle = (interest: string) => {
    setFormData((prev) => {
      const currentInterests = [...prev.interests];
      if (currentInterests.includes(interest)) {
        return { ...prev, interests: currentInterests.filter(i => i !== interest) };
      } else {
        return { ...prev, interests: [...currentInterests, interest] };
      }
    });
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

  const handleCheckboxChange = (checked: boolean, name: string) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
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
                <div className="space-y-4">
                  <div>
                    <Label>Tipo de Orçamento</Label>
                    <RadioGroup
                      value={formData.budgetType}
                      onValueChange={(value) => handleSelectChange("budgetType", value)}
                      className="flex space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="cursor-pointer">Diário</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id="monthly" />
                        <Label htmlFor="monthly" className="cursor-pointer">Mensal</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label htmlFor="budget">
                        Orçamento {formData.budgetType === 'daily' ? 'Diário' : 'Mensal'} (R$)
                      </Label>
                      <span className="text-sm font-medium">
                        R$ {formData.budget.toLocaleString()}
                      </span>
                    </div>
                    <Slider
                      id="budget"
                      min={20}
                      max={formData.budgetType === 'daily' ? 1000 : 30000}
                      step={formData.budgetType === 'daily' ? 10 : 100}
                      value={[formData.budget]}
                      onValueChange={(value) => setFormData({ ...formData, budget: value[0] })}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ {formData.budgetType === 'daily' ? '20' : '20'}</span>
                      <span>R$ {formData.budgetType === 'daily' ? '1.000' : '30.000'}</span>
                    </div>
                  </div>
                </div>

                {/* New section: Age Range */}
                <div className="space-y-4 border-t pt-6">
                  <Label className="flex items-center text-base">
                    <User className="mr-2 h-4 w-4" />
                    Faixa Etária (opcional)
                  </Label>
                  <div className="flex space-x-4">
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="ageMin">Idade Mínima</Label>
                      <Select 
                        value={formData.ageMin} 
                        onValueChange={(value) => handleSelectChange("ageMin", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Idade mínima" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 48 }, (_, i) => i + 13).map(age => (
                            <SelectItem key={age} value={age.toString()}>{age} anos</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-1/2 space-y-2">
                      <Label htmlFor="ageMax">Idade Máxima</Label>
                      <Select 
                        value={formData.ageMax} 
                        onValueChange={(value) => handleSelectChange("ageMax", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Idade máxima" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 53 }, (_, i) => i + 18).map(age => (
                            <SelectItem key={age} value={age.toString()}>{age} anos</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Facebook Pixel ID */}
                <div className="space-y-3 border-t pt-6">
                  <Label className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    Pixel do Facebook (opcional)
                  </Label>
                  <Input
                    id="pixelId"
                    name="pixelId"
                    placeholder="Insira o ID do seu Pixel do Facebook"
                    value={formData.pixelId}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    A configuração do pixel permitirá melhor rastreamento de conversões.
                  </p>
                </div>

                {/* Interests */}
                <div className="space-y-4 border-t pt-6">
                  <Label className="flex items-center text-base">
                    <Target className="mr-2 h-4 w-4" />
                    Interesses do Público (opcional)
                  </Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Selecione os interesses relevantes para o seu público-alvo
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-3">
                    {INTERESTS.map((interest) => (
                      <div key={interest} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`interest-${interest}`}
                          checked={formData.interests.includes(interest)}
                          onCheckedChange={() => handleInterestToggle(interest)}
                        />
                        <Label 
                          htmlFor={`interest-${interest}`}
                          className="text-sm cursor-pointer"
                        >
                          {interest}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Campaign Schedule */}
                <div className="space-y-4 border-t pt-6">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center text-base">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      Programação da Campanha
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="scheduled" 
                        checked={formData.scheduled}
                        onCheckedChange={(checked) => handleCheckboxChange(!!checked, "scheduled")}
                      />
                      <Label htmlFor="scheduled" className="text-sm">Programar datas</Label>
                    </div>
                  </div>

                  {formData.scheduled && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? format(formData.startDate, "dd/MM/yyyy") : "Selecione uma data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.startDate}
                              onSelect={(date) => date && setFormData(prev => ({ ...prev, startDate: date }))}
                              initialFocus
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Data de Término (opcional)</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.endDate ? format(formData.endDate, "dd/MM/yyyy") : "Selecione uma data"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.endDate}
                              onSelect={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
                              initialFocus
                              disabled={(date) => 
                                date < formData.startDate || 
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t pt-6">
                  <Label className="text-base">Localização do Público</Label>
                  
                  <div className="space-y-3">
                    <Label htmlFor="country">País</Label>
                    <Select 
                      value={formData.country} 
                      onValueChange={(value) => handleSelectChange("country", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o país" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brasil">Brasil</SelectItem>
                        <SelectItem value="estados_unidos">Estados Unidos</SelectItem>
                        <SelectItem value="portugal">Portugal</SelectItem>
                        <SelectItem value="espanha">Espanha</SelectItem>
                        <SelectItem value="argentina">Argentina</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.country === "brasil" && (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label htmlFor="region">Região</Label>
                        <Select 
                          value={formData.region} 
                          onValueChange={(value) => handleSelectChange("region", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a região" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sudeste">Região Sudeste</SelectItem>
                            <SelectItem value="sul">Região Sul</SelectItem>
                            <SelectItem value="norte">Região Norte</SelectItem>
                            <SelectItem value="nordeste">Região Nordeste</SelectItem>
                            <SelectItem value="centro-oeste">Região Centro-Oeste</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.region && (
                        <div className="space-y-3">
                          <Label htmlFor="state">Estado</Label>
                          <Select 
                            value={formData.state} 
                            onValueChange={(value) => handleSelectChange("state", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {formData.region === "sudeste" && (
                                <>
                                  <SelectItem value="sp">São Paulo</SelectItem>
                                  <SelectItem value="rj">Rio de Janeiro</SelectItem>
                                  <SelectItem value="mg">Minas Gerais</SelectItem>
                                  <SelectItem value="es">Espírito Santo</SelectItem>
                                </>
                              )}
                              {formData.region === "sul" && (
                                <>
                                  <SelectItem value="pr">Paraná</SelectItem>
                                  <SelectItem value="sc">Santa Catarina</SelectItem>
                                  <SelectItem value="rs">Rio Grande do Sul</SelectItem>
                                </>
                              )}
                              {formData.region === "nordeste" && (
                                <>
                                  <SelectItem value="ba">Bahia</SelectItem>
                                  <SelectItem value="pe">Pernambuco</SelectItem>
                                  <SelectItem value="ce">Ceará</SelectItem>
                                  <SelectItem value="ma">Maranhão</SelectItem>
                                  <SelectItem value="pb">Paraíba</SelectItem>
                                  <SelectItem value="rn">Rio Grande do Norte</SelectItem>
                                  <SelectItem value="al">Alagoas</SelectItem>
                                  <SelectItem value="se">Sergipe</SelectItem>
                                  <SelectItem value="pi">Piauí</SelectItem>
                                </>
                              )}
                              {formData.region === "norte" && (
                                <>
                                  <SelectItem value="am">Amazonas</SelectItem>
                                  <SelectItem value="pa">Pará</SelectItem>
                                  <SelectItem value="ro">Rondônia</SelectItem>
                                  <SelectItem value="ap">Amapá</SelectItem>
                                  <SelectItem value="ac">Acre</SelectItem>
                                  <SelectItem value="rr">Roraima</SelectItem>
                                  <SelectItem value="to">Tocantins</SelectItem>
                                </>
                              )}
                              {formData.region === "centro-oeste" && (
                                <>
                                  <SelectItem value="df">Distrito Federal</SelectItem>
                                  <SelectItem value="go">Goiás</SelectItem>
                                  <SelectItem value="mt">Mato Grosso</SelectItem>
                                  <SelectItem value="ms">Mato Grosso do Sul</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox 
                      id="customLocations" 
                      checked={formData.customLocations}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange(!!checked, "customLocations")
                      }
                    />
                    <Label 
                      htmlFor="customLocations"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Quero definir localizações específicas (cidades, bairros, raios)
                    </Label>
                  </div>

                  {formData.customLocations && (
                    <Collapsible className="space-y-2">
                      <CollapsibleTrigger className="flex items-center w-full text-sm font-medium text-left text-blue-600 hover:text-blue-800">
                        <span>Configurar localizações específicas</span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-4 px-4 pt-2 pb-4 border border-gray-100 bg-gray-50 rounded-md">
                        <div className="text-xs text-muted-foreground">
                          Você poderá definir localizações específicas (cidades, bairros ou raios) após a criação inicial da campanha.
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
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
