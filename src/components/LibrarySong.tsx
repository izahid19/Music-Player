import React from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

const LibrarySong = ({
  song,
  setCurrentSong,
  songs,
  audioRef,
  isPlaying,
  setIsPlaying,
  favorites,
  toggleFavorite,
}) => {
  const songSelectHandler = async () => {
    await setCurrentSong(song);
    setIsPlaying(true);
  };
  
  const favoriteHandler = (e) => {
    e.stopPropagation();
    toggleFavorite(song.id);
  };

  const isFavorite = favorites.includes(song.id);

  return (
    <motion.div
      onClick={songSelectHandler}
      className={`library-song ${song.active ? "selected" : ""}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <img src={song.cover} alt={song.name} />
      <div className="song-description">
        <h3>{song.name}</h3>
        <h4>{song.artist}</h4>
      </div>
      <motion.span
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        style={{ display: 'inline-flex', marginLeft: 'auto' }}
      >
        <FontAwesomeIcon
          onClick={favoriteHandler}
          icon={faHeart}
          className={`favorite ${isFavorite ? "active" : ""}`}
          style={{ 
            color: isFavorite ? "#ef4444" : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "1rem"
          }}
        />
      </motion.span>
    </motion.div>
  );
};

export default LibrarySong;
