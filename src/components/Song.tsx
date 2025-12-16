// Song component
import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Song = ({ currentSong, isPlaying, favorites, toggleFavorite }) => {
  const isFavorite = favorites?.includes(currentSong?.id);

  return (
    <div className="song-container">
      <img
        className={isPlaying ? "song-playing" : ""}
        alt={currentSong?.name}
        src={currentSong?.cover}
      />
      <div className="song-info">
        <div className="song-title-row">
            <h2>{currentSong?.name}</h2>
            <span 
                onClick={() => toggleFavorite(currentSong.id)}
                style={{ cursor: 'pointer', marginLeft: '1rem' }}
            >
            <FontAwesomeIcon 
                icon={faHeart} 
                className={`favorite ${isFavorite ? 'active' : ''}`}
                size="lg"
            />
            </span>
        </div>
        <h3>{currentSong?.artist}</h3>
      </div>
    </div>
  );
};

export default Song;
