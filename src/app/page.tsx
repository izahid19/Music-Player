'use client';

import React from 'react';
import Nav from '../components/Nav';
import { HeroSection, FeaturesSection, Footer, Background } from '../components/HomePage';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Animated Background */}
      <Background />

      {/* Nav Component - hideLibrary on landing page */}
      <Nav 
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
