
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div>LuxAI Agency — Tecnologia da Luxfy®</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <Link to="/termos" className="hover:text-foreground transition-colors">
            Termos
          </Link>
          <Link to="/suporte" className="hover:text-foreground transition-colors">
            Suporte
          </Link>
          <Link to="/privacidade" className="hover:text-foreground transition-colors">
            Política de Privacidade
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
