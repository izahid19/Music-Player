'use client';

import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import { HeroSection, FeaturesSection, Footer, Background } from '../components/HomePage';

const LandingPage = () => {
  // Theme state management
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('musicPlayerTheme') || 'light';
    }
    return 'light';
  });

  // Apply theme to body
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('musicPlayerTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <Background />

      {/* Nav Component - hideLibrary on landing page */}
      <Nav 
        theme={theme} 
        toggleTheme={toggleTheme}
        hideLibrary={true}
        libraryStatus={false}
        setLibraryStatus={() => {}}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
