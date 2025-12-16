'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faMusic,
  faHeadphones
} from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
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
      y: [-15, 15, -15],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  } as any;

  const rotateVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  } as any;

  const glitchVariants = {
    animate: {
      x: [0, -2, 2, -2, 0],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatDelay: 3
      }
    }
  } as any;

  return (
    <div className="not-found-page">
      {/* Animated Background - same as landing */}
      <div className="landing-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Content */}
      <motion.div 
        className="not-found-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Floating Icon */}
        <motion.div 
          className="not-found-icon"
          variants={floatVariants}
          animate="animate"
        >
          <motion.div
            variants={rotateVariants}
            animate="animate"
            className="icon-ring"
          />
          <FontAwesomeIcon icon={faHeadphones} />
        </motion.div>

        {/* 404 Text */}
        <motion.h1 
          className="not-found-code"
          variants={itemVariants}
        >
          <motion.span
            variants={glitchVariants}
            animate="animate"
            className="gradient-text"
          >
            404
          </motion.span>
        </motion.h1>

        {/* Message */}
        <motion.h2 
          className="not-found-title"
          variants={itemVariants}
        >
          Oops! Track Not Found
        </motion.h2>

        <motion.p 
          className="not-found-message"
          variants={itemVariants}
        >
          Looks like this track got lost in the shuffle. <br />
          Let's get you back to the music!
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="not-found-actions"
          variants={itemVariants}
        >
          <Link href="/">
            <motion.button 
              className="nf-btn primary"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Go Home</span>
            </motion.button>
          </Link>

          <Link href="/music">
            <motion.button 
              className="nf-btn secondary"
              whileHover={{ 
                scale: 1.05,
                backgroundColor: "rgba(102, 126, 234, 0.1)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faMusic} />
              <span>Open Player</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Floating Music Notes */}
        <motion.div 
          className="floating-notes"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          {['♪', '♫', '♬', '♩', '♪', '♫'].map((note, i) => (
            <motion.span
              key={i}
              className="note"
              animate={{
                y: [-30, 30, -30],
                x: [0, 15, -15, 0],
                rotate: [0, 15, -15, 0],
                opacity: [0.3, 0.7, 0.3]
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3
              }}
            >
              {note}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
