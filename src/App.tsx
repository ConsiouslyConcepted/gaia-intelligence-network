import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Home from "./pages/Home";
import SphereDetail from "./pages/SphereDetail";
import PlanetaryCommons from "./pages/PlanetaryCommons";
import Galactic from "./pages/Galactic";
import Cosmological from "./pages/Cosmological";
import Universal from "./pages/Universal";
import Stellar from "./pages/Stellar";
import HarmonicsEngine from "./pages/HarmonicsEngine";



import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/planetary" element={<Index />} />
          <Route path="/sphere/:sphereId" element={<SphereDetail />} />
          <Route path="/commons" element={<PlanetaryCommons />} />
          <Route path="/galactic" element={<Galactic />} />
          <Route path="/cosmological" element={<Cosmological />} />
          <Route path="/universal" element={<Universal />} />
          <Route path="/stellar" element={<Stellar />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

