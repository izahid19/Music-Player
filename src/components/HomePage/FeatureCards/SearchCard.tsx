import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

export default function SearchCard() {
  const [isHovered, setIsHovered] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    if (isHovered) {
      // Reset state
      setSearchText("");
      setShowResults(false);

      // Typing animation
      const textToType = "Drake";
      const typingDelay = 400; // Start typing after search bar expands
      
      textToType.split('').forEach((char, index) => {
        const id = setTimeout(() => {
          setSearchText(prev => prev + char);
        }, typingDelay + (index * 150));
        timeoutIds.push(id);
      });

      // Show results after typing
      const resultsId = setTimeout(() => {
        setShowResults(true);
      }, typingDelay + (textToType.length * 150) + 200);
      timeoutIds.push(resultsId);
      
    } else {
      setSearchText("");
      setShowResults(false);
    }

    return () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, [isHovered]);

  return (
    <motion.div 
      className="bento-card"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.5 }}
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <h3>Quick Search</h3>
      <p>Find any song in your library instantly with our real-time search.</p>
      <div className="card-visual mock-search">
        <motion.div 
          className="search-bar"
          animate={{ width: isHovered ? "100%" : "90%" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem' }}
        >
          <FontAwesomeIcon icon={faSearch} style={{ opacity: 0.6 }} />
          <motion.span>
            {searchText}
            <motion.span 
              animate={{ opacity: [0, 1, 0] }} 
              transition={{ duration: 0.8, repeat: Infinity }}
              style={{ display: isHovered ? 'inline' : 'none', marginLeft: '1px' }}
            >
              |
            </motion.span>
          </motion.span>
        </motion.div>
        
        <div className="result-grid">
          {[1, 2, 3].map((i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0.3, scale: 0.9 }}
              animate={showResults ? { 
                opacity: 1, 
                scale: 1,
                backgroundColor: "rgba(255,255,255,0.15)"
              } : { 
                opacity: 0.3, 
                scale: 0.9,
                backgroundColor: "rgba(255,255,255,0.05)"
              }}
              style={{ 
                borderRadius: '6px', 
                overflow: 'hidden', 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              transition={{ duration: 0.3, delay: showResults ? i * 0.1 : 0 }}
            >
                {/* Mock Result Content */}
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                    {showResults && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)` }}
                        />
                    )}
                </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
