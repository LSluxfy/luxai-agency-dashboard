
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import Footer from "../navigation/Footer";
import { useAuth } from "@/contexts/AuthContext";
import AIFloatingWidget from "../ai-assessor/AIFloatingWidget";
import { useState, useEffect } from "react";

const AppLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [showFloatingWidget, setShowFloatingWidget] = useState(true);
  
  useEffect(() => {
    // Console.log para depuração da navegação
    console.log("Current path:", location.pathname);
    
    setShowFloatingWidget(!location.pathname.includes('assessor-ia'));
  }, [location]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <Footer />
        {showFloatingWidget && user && (
          <AIFloatingWidget userId={user.id} />
        )}
      </div>
    </div>
  );
};

export default AppLayout;
