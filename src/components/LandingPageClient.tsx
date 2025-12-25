'use client';

import React from 'react';
import Nav from './Nav';
import { HeroSection, FeaturesSection, DownloadSection, Footer, Background } from './HomePage';

/**
 * Client-side landing page wrapper
 * Needed because Nav component uses client-side state
 */
const LandingPageClient = () => {
  return (
    <div className="landing-page">
      {/* Animated Background */}
      <Background />

      {/* Header with Navigation */}
      <header>
        <Nav 
          hideLibrary={true}
          libraryStatus={false}
          setLibraryStatus={() => {}}
        />
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Download App Section */}
        <DownloadSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPageClient;
