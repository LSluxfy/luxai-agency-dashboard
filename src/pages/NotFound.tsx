
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Logo from "@/components/ui-custom/Logo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Logo variant="large" />
      <div className="mt-8 text-center">
        <h1 className="text-4xl font-bold text-primary">404</h1>
        <p className="text-xl text-foreground mt-2 mb-6">
          Oops! Página não encontrada
        </p>
        <Button asChild className="hover-scale">
          <Link to="/dashboard">Voltar para o Dashboard</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
