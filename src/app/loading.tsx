'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

export default function Loading() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTheme(localStorage.getItem('musicPlayerTheme') || 'light');
      document.body.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <div className="loading-page">
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
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
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
        <motion.div 
          className="loading-bar-container"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "200px" }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.div 
            className="loading-bar"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ 
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.p 
          className="loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            delay: 0.6,
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Loading your music...
        </motion.p>

        {/* Floating music notes */}
        <div className="loading-notes">
          {['♪', '♫', '♬', '♩'].map((note, i) => (
            <motion.span
              key={i}
              animate={{
                y: [-20, 20, -20],
                opacity: [0.3, 0.8, 0.3],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            >
              {note}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
