'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Get theme
    const savedTheme = localStorage.getItem('musicPlayerTheme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    // Show loading for 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until mounted (prevents hydration issues)
  if (!mounted) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            key="loading"
            className="loading-page"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9999,
            }}
          >
            {/* Animated Background */}
            <div className="landing-bg">
              <div className="gradient-orb orb-1"></div>
              <div className="gradient-orb orb-2"></div>
              <div className="gradient-orb orb-3"></div>
            </div>

            {/* Loading Content */}
            <motion.div 
              className="loading-content"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo with pulse animation */}
              <motion.div 
                className="loading-icon"
                animate={{ 
                  scale: [1, 1.15, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <FontAwesomeIcon icon={faMusic} />
              </motion.div>

              {/* Brand name */}
              <motion.h1 
                className="loading-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <span className="gradient-text">Playyly</span>
              </motion.h1>

              {/* Loading bar */}
              <div className="loading-bar-container">
                <motion.div 
                  className="loading-bar"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>

              {/* Loading text */}
              <motion.p 
                className="loading-text"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                Loading your music...
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ opacity: isLoading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
        {children}
      </div>
    </>
  );
}
