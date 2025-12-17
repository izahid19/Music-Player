import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const LibrarySong = ({
  name,
  artist,
  cover,
  id,
  setCurrentSong,
  songs,
  audioRef,
  isPlaying,
  setSongs,
  active,
  isFavorite,
  isPopular
}) => {
  const songSelectHandler = async () => {
    const selectedSong = songs.filter((state) => state.id === id);
    await setCurrentSong(selectedSong[0]);
    // Active state logic
    const newSongs = songs.map((song) => {
      if (song.id === id) {
        return {
          ...song,
          active: true,
        };
      } else {
        return {
          ...song,
          active: false,
        };
      }
    });
    setSongs(newSongs); // Update state

    // Audio play
    if (isPlaying) audioRef.current.play();
  };

  return (
    <div onClick={songSelectHandler} className={`library-song ${active ? 'selected' : ''}`}>
      <img src={cover} alt={name}></img>
      <div className="song-description">
        <h3>
            {name} 
            {isPopular && (
                <span className="popular-tag">
                    🔥 Popular
                </span>
            )}
        </h3>
        <h4>{artist}</h4>
      </div>
       {isFavorite && (
          <FontAwesomeIcon icon={faHeart} style={{marginLeft: 'auto', color: '#ef4444'}} />
      )}
    </div>
  );
};

export default LibrarySong;
