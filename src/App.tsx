
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CampaignDetail from "./pages/CampaignDetail";
import FacebookConnection from "./pages/FacebookConnection";
import FacebookCallback from "./pages/FacebookCallback";
import CreativeStudio from "./pages/CreativeStudio";
import Metrics from "./pages/Metrics";
import Finance from "./pages/Finance";
import AssessorAI from "./pages/AssessorAI";
import AppLayout from "./components/layouts/AppLayout";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<Login />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/campaign/:id" element={<CampaignDetail />} />
              <Route path="/facebook" element={<FacebookConnection />} />
              <Route path="/facebook/callback" element={<FacebookCallback />} />
              <Route path="/creative-studio" element={<CreativeStudio />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/ia-assessor" element={<AssessorAI />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
