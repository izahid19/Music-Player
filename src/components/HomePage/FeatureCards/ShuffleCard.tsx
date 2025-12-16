'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShuffle, faPlay, faRepeat, faPause } from '@fortawesome/free-solid-svg-icons';

export default function ShuffleCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="bento-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3>Shuffle & Repeat</h3>
      <p>Control your playback flow with smart shuffle algorithms and repeat modes.</p>
      <div className="card-visual mock-player">
        {/* Floating Particles */}
        <div className="particles" style={{ position: 'absolute', top: '10%', left: '0', width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
           {[1, 2, 3, 4].map((i) => (
             <motion.div
               key={i}
               style={{
                 position: 'absolute',
                 left: `${20 + i * 15}%`,
                 bottom: '40px',
                 width: '4px',
                 height: '4px',
                 borderRadius: '50%',
                 background: 'rgba(255, 255, 255, 0.4)',
               }}
               animate={isHovered ? {
                 y: -60,
                 opacity: [0, 1, 0],
                 x: i % 2 === 0 ? 10 : -10
               } : { opacity: 0 }}
               transition={{
                 duration: 1.5,
                 repeat: Infinity,
                 delay: i * 0.2,
                 ease: "easeOut"
               }}
             />
           ))}
        </div>

        {/* EQ Animation */}
        <div className="eq-visual" style={{ 
          display: 'flex', 
          alignItems: 'end', 
          justifyContent: 'center', 
          gap: '4px',
          height: '40px',
          marginBottom: '1rem',
          position: 'relative',
          zIndex: 1
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div
              key={i}
              style={{
                width: '6px',
                background: 'var(--accent-color)',
                borderRadius: '4px'
              }}
              animate={{
                height: isHovered ? [10, 50, 20, 45, 10] : [10, 30, 15, 25, 10],
              }}
              transition={{
                duration: isHovered ? 0.5 : 0.8,
                repeat: Infinity,
                repeatType: "mirror",
                delay: i * 0.1,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        <div className="controls" style={{ 
          position: 'relative', 
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          marginTop: '0.5rem'
        }}>
          <motion.div 
            whileHover={{ scale: 1.1, color: "var(--accent-color)" }}
            style={{ 
              fontSize: '1rem', 
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%'
            }}
          >
            <FontAwesomeIcon icon={faShuffle} />
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              width: '48px', 
              height: '48px', 
              background: 'linear-gradient(135deg, var(--accent-color) 0%, #764ba2 100%)', 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <span key={isHovered ? 'pause' : 'play'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <FontAwesomeIcon icon={isHovered ? faPause : faPlay} style={{ fontSize: '1.2rem', marginLeft: isHovered ? '0' : '3px' }}/>
            </span>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.1, color: "var(--accent-color)" }}
            style={{ 
              fontSize: '1rem', 
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '50%'
            }}
          >
            <FontAwesomeIcon icon={faRepeat} />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
