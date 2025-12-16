import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const Song = ({ currentSong, isPlaying, favorites, toggleFavorite }) => {
  const isFavorite = favorites.includes(currentSong.id);

  return (
    <div className="song-container">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentSong.id}
          className={isPlaying ? "song-playing" : ""}
          src={currentSong.cover}
          alt={currentSong.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
      
      <div className="song-info">
        <AnimatePresence mode="wait">
          <motion.h2
            key={currentSong.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentSong.name}
          </motion.h2>
        </AnimatePresence>
        <motion.span
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          style={{ display: 'inline-flex' }}
        >
          <FontAwesomeIcon
            onClick={() => toggleFavorite(currentSong.id)}
            className={`favorite ${isFavorite ? 'active' : ''}`}
            icon={faHeart}
            size="lg"
            title="Like"
          />
        </motion.span>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.h3
          key={currentSong.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {currentSong.artist}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
};

export default Song;
