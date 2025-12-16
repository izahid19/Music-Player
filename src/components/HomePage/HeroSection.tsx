'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faMusic } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';

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

export default function HeroSection() {
  const router = useRouter();

  const handleEnterApp = () => {
    router.push('/music');
  };

  return (
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
          <span className="gradient-text">Playyly</span>
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
  );
}
