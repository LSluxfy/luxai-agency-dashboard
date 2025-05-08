import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "../components/landing/LandingPage";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // We'll keep the homepage as the landing page now, not redirecting anywhere
  }, [navigate]);

  return <LandingPage />;
};

export default Index;
