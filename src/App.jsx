import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { useState } from 'react';
import "./index.css";
import Home from "./Pages/Home";
import About from "./Pages/About";
import AnimatedBackground from "./components/Background";
import Navbar from "./components/Navbar";
import Portofolio from "./Pages/Portofolio";
import ContactPage from "./Pages/Contact";
import ProjectDetails from "./components/ProjectDetail";
import WelcomeScreen from "./Pages/WelcomeScreen";
import { AnimatePresence } from 'framer-motion';
import AdminPanel from "./Pages/AdminPanel";
import TestimonialsSection from "./components/TestimonialsSection";
import CustomCursor from "./components/CustomCursor";
import BlogSection from "./components/BlogSection";
import CyberSection from "./components/CyberSection";
import CyberPageWrapper from "./components/CyberPageWrapper";

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <CyberPageWrapper>
          <CustomCursor />
          <Navbar />
          <AnimatedBackground />
          <Home />
          <About />
          <Portofolio />
          <CyberSection />
          <BlogSection />
          <TestimonialsSection />
          <ContactPage />
        </CyberPageWrapper>
      )}
    </>
  );
};

const ProjectPageLayout = () => (
  <CyberPageWrapper>
    <ProjectDetails />
  </CyberPageWrapper>
);

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
        <Route path="/project/:id" element={<ProjectPageLayout />} />
        <Route path="/admin/*" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;