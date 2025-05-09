
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FilePlus, 
  FolderOpen, 
  LifeBuoy, 
  LogOut,
  Facebook,
  Wand2,
  BarChart,
  CreditCard,
  ChevronsUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Logo from "../ui-custom/Logo";

const sidebarVariants = {
  open: {
    width: "16rem",
  },
  closed: {
    width: "4.5rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

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
    <motion.div
      className="h-screen bg-sidebar sticky top-0 border-r border-border z-40"
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative z-40 flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-all"
        variants={contentVariants}
      >
        <motion.div variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[60px] w-full shrink-0 border-b border-border p-2">
              <div className="mt-[1.5px] flex w-full items-center justify-between">
                {!isCollapsed && <Logo variant="sidebar" />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-auto"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? <ChevronsUpDown size={16} /> : <ChevronsUpDown size={16} />}
                </Button>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-2">
                <ScrollArea className="h-16 grow p-2">
                  <div className="flex w-full flex-col gap-1">
                    {navItems.map((item, index) => (
                      <NavLink
                        key={index}
                        to={item.to}
                        className={({ isActive }) =>
                          cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-all",
                            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                            "hover:shadow-md",
                            isActive
                              ? "bg-sidebar-primary text-sidebar-primary-foreground"
                              : "text-sidebar-foreground"
                          )
                        }
                      >
                        <span className="flex items-center justify-center min-w-[24px]">
                          <item.icon size={16} />
                        </span>
                        <motion.span variants={variants} className="ml-2 text-sm font-medium truncate">
                          {!isCollapsed && item.label}
                        </motion.span>
                      </NavLink>
                    ))}
                    
                    <Separator className="my-2 w-full" />
                  </div>
                </ScrollArea>
              </div>
              
              <div className="p-2 border-t border-border">
                <NavLink
                  to="/"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                    "hover:shadow-md",
                    "text-sidebar-foreground"
                  )}
                >
                  <span className="flex items-center justify-center min-w-[24px]">
                    <LogOut size={16} />
                  </span>
                  <motion.span variants={variants} className="ml-2 text-sm font-medium truncate">
                    {!isCollapsed && "Sair"}
                  </motion.span>
                </NavLink>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Sidebar;
