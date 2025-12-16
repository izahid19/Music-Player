'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlay, 
  faShuffle, 
  faHeart, 
  faMoon, 
  faSearch,
  faMusic
} from '@fortawesome/free-solid-svg-icons';
import Nav from '../components/Nav';

const LandingPage = () => {
  const router = useRouter();

  // Theme state management
  const [theme, setTheme] = useState(() => {
    // Check if window is defined to avoid SSR error
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

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  } as any;

  const floatVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as any;

  const pulseVariants = {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as any;

  const glowVariants = {
    animate: {
      boxShadow: [
        "0 0 20px rgba(102, 126, 234, 0.3)",
        "0 0 40px rgba(118, 75, 162, 0.5)",
        "0 0 20px rgba(102, 126, 234, 0.3)"
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as any;

  const features = [
    { icon: faShuffle, title: "Shuffle & Repeat", desc: "Smart playback modes" },
    { icon: faHeart, title: "Favorites", desc: "Like your favorite songs" },
    { icon: faMoon, title: "Dark Mode", desc: "Beautiful theme switching" },
    { icon: faSearch, title: "Quick Search", desc: "Find songs instantly" },
  ];

  const handleEnterApp = () => {
    router.push('/music');
  };

  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Nav Component - hideLibrary on landing page */}
      <Nav 
        theme={theme} 
        toggleTheme={toggleTheme}
        hideLibrary={true}
        libraryStatus={false}
        setLibraryStatus={() => {}}
      />

      {/* Hero Section */}
      <motion.section 
        className="hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="hero-content">
          <motion.div 
            className="logo-icon"
            variants={floatVariants}
            animate="animate"
          >
            <FontAwesomeIcon icon={faMusic} />
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="hero-title">
            <span className="gradient-text">Playly</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="hero-subtitle">
            Your music, your vibe, your way.
          </motion.p>
          
          <motion.button 
            className="cta-button"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEnterApp}
          >
            <motion.span
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <FontAwesomeIcon icon={faPlay} />
            </motion.span>
            <span>Start Listening</span>
          </motion.button>
        </motion.div>

        {/* Floating Music Notes */}
        <motion.div 
          className="floating-notes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
        >
          {['♪', '♫', '♬', '♩'].map((note, i) => (
            <motion.span
              key={i}
              className="note"
              animate={{
                y: [-20, 20, -20],
                x: [0, 10, 0],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5
              }}
            >
              {note}
            </motion.span>
          ))}
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="features"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Why Playly?
        </motion.h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ 
                y: -10,
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)"
              }}
            >
              <motion.div 
                className="feature-icon"
                variants={pulseVariants}
                animate="animate"
                whileHover={{ scale: 1.2, rotate: 5 }}
              >
                <FontAwesomeIcon icon={feature.icon} />
              </motion.div>
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                {feature.title}
              </motion.h3>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                {feature.desc}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <motion.p
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          Built with ❤️ using React & Framer Motion
        </motion.p>
      </motion.footer>
    </div>
  );
};

export default LandingPage;
