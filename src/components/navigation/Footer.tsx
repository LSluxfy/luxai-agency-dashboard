
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div>LuxAI Agency — Tecnologia da Luxfy®</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <button 
            onClick={() => navigate("/termos")} 
            className="hover:text-foreground transition-colors"
          >
            Termos
          </button>
          <button 
            onClick={() => navigate("/suporte")} 
            className="hover:text-foreground transition-colors"
          >
            Suporte
          </button>
          <button 
            onClick={() => navigate("/privacidade")} 
            className="hover:text-foreground transition-colors"
          >
            Política de Privacidade
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
