
import { Card, CardContent } from "@/components/ui/card";
import FluxProGenerator from "@/components/image-generator/FluxProGenerator";

const FluxProImageGenerator = () => {
  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Gerar Imagem (Flux Pro)</h1>
        <p className="text-muted-foreground mt-2">
          Crie imagens profissionais usando inteligência artificial com o modelo Flux Pro.
        </p>
      </header>
      
      <Card>
        <CardContent className="pt-6">
          <FluxProGenerator />
        </CardContent>
      </Card>
    </div>
  );
};

export default FluxProImageGenerator;
