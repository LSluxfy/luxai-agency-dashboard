import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  FilePlus, 
  FolderOpen, 
  LifeBuoy, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Wand2,
  BarChart,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "../ui-custom/Logo";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
    { icon: FilePlus, label: "Criar Campanha", to: "/onboarding" },
    { icon: Wand2, label: "Studio de Criativos", to: "/creative-studio" },
    { icon: Facebook, label: "Conexão com Facebook", to: "/facebook" },
    { icon: BarChart, label: "Métricas", to: "/metrics" },
    { icon: CreditCard, label: "Financeiro", to: "/finance" },
    { icon: FolderOpen, label: "Meus Arquivos", to: "/dashboard?tab=files" },
    { icon: LifeBuoy, label: "Suporte", to: "/dashboard?tab=support" },
  ];

  return (
    <div
      className={cn(
        "h-screen bg-sidebar sticky top-0 flex flex-col border-r border-border transition-all duration-300 ease-in-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <div className="flex-1">
            <Logo variant="sidebar" />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      <div className="flex-1 py-8">
        <nav className="space-y-1 px-2">
          {navItems.map((item, index) => (
            <Tooltip key={index} delayDuration={300}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground",
                      collapsed ? "justify-center" : ""
                    )
                  }
                >
                  <item.icon size={20} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-border">
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground"
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <LogOut size={20} />
              {!collapsed && <span>Sair</span>}
            </NavLink>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Sair</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
};

export default Sidebar;
