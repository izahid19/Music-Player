'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons';

export default function DarkModeCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="bento-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2, duration: 0.5 }}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3>Dark Mode</h3>
      <p>Easy on the eyes, perfect for late night listening sessions.</p>
      <div className="card-visual mock-toggle">
        {/* Background Transition Effect */}
        <motion.div
          style={{
            position: 'absolute', inset: 0, zIndex: 0,
            background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
            opacity: 0
          }}
          animate={{ opacity: isHovered ? 0.3 : 0 }}
        />
        
        <motion.div 
          className="toggle-switch"
          style={{
            width: '80px', height: '44px', borderRadius: '22px', position: 'relative', cursor: 'pointer',
            display: 'flex', alignItems: 'center', padding: '4px', zIndex: 1,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
          }}
          animate={{ backgroundColor: isHovered ? "#333" : "#e0e7ff" }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="toggle-thumb"
            style={{
              width: '36px', height: '36px', 
              borderRadius: '50%', 
              background: 'white', 
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fbbf24' // Sun/Moon color
            }}
            animate={{ x: isHovered ? 36 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
             <motion.div
               key={isHovered ? "moon" : "sun"}
               initial={{ scale: 0, rotate: -180 }}
               animate={{ scale: 1, rotate: 0 }}
               exit={{ scale: 0, rotate: 180 }}
               transition={{ duration: 0.3 }}
             >
               <FontAwesomeIcon icon={isHovered ? faMoon : faSun} style={{ fontSize: '1.2rem', color: isHovered ? '#667eea' : '#fbbf24' }} />
             </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
