'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

export default function FavoritesCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div 
      className="bento-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ delay: 0.05, duration: 0.35 }}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3>Favorites</h3>
      <p>Curate your personal collection of top tracks. One click to heart.</p>
      <div className="card-visual mock-list" style={{ overflow: 'hidden', position: 'relative' }}>
        {/* Gradient Masks */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '20px', background: 'linear-gradient(to bottom, rgba(30,30,40,1), transparent)', zIndex: 2 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, rgba(30,30,40,1), transparent)', zIndex: 2 }} />
        
        <motion.div 
          style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
          animate={{ y: isHovered ? -60 : 0 }}
          transition={{ duration: 4, ease: "linear", repeat: isHovered ? Infinity : 0, repeatType: "loop" }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.div 
              key={i} 
              className="list-item"
              initial={{ x: 0, opacity: 0.8 }}
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
            >
              <div className="avatar" style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '6px', opacity: 0.8 }}></div>
              <div className="lines" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ height: '4px', width: '60%', background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></span>
                <span style={{ height: '4px', width: '40%', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}></span>
              </div>
              <motion.div 
                className="heart"
                style={{ position: 'relative' }}
                whileHover={{ scale: 1.2 }}
              >
                <FontAwesomeIcon 
                  icon={faHeart} 
                  style={{ 
                    color: (isHovered && i === 2) ? '#ff4b4b' : 'rgba(255,255,255,0.2)', 
                    fontSize: '1rem',
                    transition: 'color 0.3s ease' 
                  }} 
                />
                {/* Heart Explosion Particles - Only on specific item when hovered */}
                {(isHovered && i === 2) && (
                  <>
                    <motion.div 
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        border: '2px solid #ff4b4b',
                        borderRadius: '50%'
                      }}
                    />
                  </>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
