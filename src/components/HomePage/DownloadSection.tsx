'use client';

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAndroid } from '@fortawesome/free-brands-svg-icons';
import { faDownload, faMobileAlt, faMusic, faBell } from '@fortawesome/free-solid-svg-icons';

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

export default function DownloadSection() {
  const handleDownload = () => {
    // Direct download of the APK file
    const link = document.createElement('a');
    link.href = '/playylymusic.apk';
    link.download = 'playylymusic.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.section 
      className="download-section"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <motion.div className="download-content">
        {/* Left side - Text content */}
        <motion.div className="download-text" variants={itemVariants}>
          <motion.div className="download-badge" variants={itemVariants}>
            <FontAwesomeIcon icon={faMobileAlt} />
            <span>Mobile App</span>
          </motion.div>
          
          <motion.h2 variants={itemVariants}>
            Take Your Music <span className="gradient-text">Anywhere</span>
          </motion.h2>
          
          <motion.p variants={itemVariants}>
            Download our Android app and enjoy your favorite music on the go. 
            Get instant updates when new songs are added!
          </motion.p>

          <motion.div className="download-features" variants={itemVariants}>
            <div className="feature-item">
              <FontAwesomeIcon icon={faMusic} />
              <span>Stream all songs</span>
            </div>
            <div className="feature-item">
              <FontAwesomeIcon icon={faBell} />
              <span>Update notifications</span>
            </div>
          </motion.div>

          <motion.button 
            className="download-button"
            variants={itemVariants}
            whileHover={{ 
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)"
            }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
          >
            <FontAwesomeIcon icon={faAndroid} className="android-icon" />
            <div className="button-text">
              <span className="button-label">Download for</span>
              <span className="button-platform">Android</span>
            </div>
            <FontAwesomeIcon icon={faDownload} className="download-icon" />
          </motion.button>

          <motion.p className="download-note" variants={itemVariants}>
            APK file • Android 8.0+
          </motion.p>
        </motion.div>

        {/* Right side - Phone mockup */}
        <motion.div 
          className="download-visual"
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
        >
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="mock-header">
                <span className="mock-title">Playyly</span>
                <div className="mock-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="mock-album">
                <motion.div 
                  className="album-cover"
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{ 
                    duration: 8, 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                >
                  <span>♪</span>
                </motion.div>
              </div>
              <div className="mock-info">
                <div className="song-title"></div>
                <div className="artist-name"></div>
              </div>
              <div className="mock-progress">
                <motion.div 
                  className="progress-fill"
                  animate={{ width: ["0%", "100%"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              </div>
              <div className="mock-controls">
                <span className="control-btn small">⏮</span>
                <span className="control-btn play">▶</span>
                <span className="control-btn small">⏭</span>
              </div>
            </div>
            <div className="phone-notch"></div>
          </div>
          
          {/* Floating elements */}
          <motion.div 
            className="floating-note note-1"
            animate={{ y: [-10, 10, -10], x: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ♪
          </motion.div>
          <motion.div 
            className="floating-note note-2"
            animate={{ y: [10, -10, 10], x: [5, -5, 5] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            ♫
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
