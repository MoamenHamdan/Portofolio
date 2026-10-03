import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect } from 'react';
import AOS from 'aos';
import LoadingScreen from './components/LoadingScreen';
import InitialContentGate from './components/InitialContentGate';
import "./index.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import Portofolio from "./Pages/Portofolio";
import ContactPage from "./Pages/Contact";
const ProjectDetails = lazy(() => import("./components/ProjectDetail"));
const AdminPanel = lazy(() => import("./Pages/AdminPanel"));
import TestimonialsSection from "./components/TestimonialsSection";
import CustomCursor from "./components/CustomCursor";
import BlogSection from "./components/BlogSection";
import CyberSection from "./components/CyberSection";
import CyberPageWrapper from "./components/CyberPageWrapper";

const LandingPage = () => {
  useEffect(() => { AOS.init({ once: true, duration: 450, offset: 30, disable: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches }); }, []);
  return <CyberPageWrapper>
    <a href="#Home" className="sr-only focus:not-sr-only focus:fixed focus:top-16 focus:z-[60] focus:bg-black focus:p-3">Skip to content</a>
    <CustomCursor /><Navbar /><AnimatedBackground />
    <main><Home /><About /><Portofolio /><CyberSection /><BlogSection /><TestimonialsSection /><ContactPage /></main>
  </CyberPageWrapper>;
};

const ProjectPageLayout = () => (
  <CyberPageWrapper>
    <ProjectDetails />
  </CyberPageWrapper>
);

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<LoadingScreen />}><Routes>
        <Route path="/" element={<InitialContentGate><LandingPage /></InitialContentGate>} />
        <Route path="/project/:id" element={<ProjectPageLayout />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes></Suspense>
    </BrowserRouter>
  );
}

export default App;
