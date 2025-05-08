
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "../ui-custom/Logo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  scrollPosition: number;
  onNavClick: (sectionId: string) => void;
}

const Header = ({ scrollPosition, onNavClick }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Sobre", sectionId: "about" },
    { label: "Como funciona", sectionId: "how-it-works" },
    { label: "Benefícios", sectionId: "benefits" },
    { label: "Planos", sectionId: "pricing" },
    { label: "FAQ", sectionId: "faq" },
  ];

  // Close mobile menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".mobile-menu-container")) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when menu is open
    } else {
      document.body.style.overflow = ""; // Enable scrolling when menu is closed
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = ""; // Ensure scrolling is enabled on unmount
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on scroll
  useEffect(() => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [scrollPosition]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrollPosition > 10
          ? "bg-background/95 backdrop-blur-lg shadow-md py-3"
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo variant="default" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <button
              key={index}
              onClick={() => onNavClick(item.sectionId)}
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/onboarding">
            <Button variant="default">Testar Grátis</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`mobile-menu-container fixed inset-0 z-40 bg-background md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "60px" }}
      >
        <div className="flex flex-col h-full p-6 pt-10 space-y-8">
          <nav className="flex flex-col space-y-6">
            {navItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  onNavClick(item.sectionId);
                  setMobileMenuOpen(false);
                }}
                className="text-lg font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex flex-col space-y-4 mt-auto">
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Login
              </Button>
            </Link>
            <Link to="/onboarding" className="w-full">
              <Button className="w-full">Testar Grátis</Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
