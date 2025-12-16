import React, { useState } from "react";
import { motion } from "framer-motion";
import LibrarySong from "./LibrarySong";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSearch, faHeart } from "@fortawesome/free-solid-svg-icons";

const Library = ({
  songs,
  setCurrentSong,
  audioRef,
  isPlaying,
  setSongs,
  libraryStatus,
  setLibraryStatus,
  setIsPlaying,
  favorites,
  toggleFavorite,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorite = showFavorites ? favorites.includes(song.id) : true;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className={`library ${libraryStatus ? "active-library" : ""}`}>
      <div className="library-header">
        <h2>Library <span className="song-count">({songs.length} songs)</span></h2>
        <FontAwesomeIcon 
          icon={faTimes} 
          onClick={() => setLibraryStatus(false)} 
          className="close-icon"
          style={{ cursor: "pointer", padding: "2rem" }}
        />
      </div>
      
      <div className="search-container">
        <FontAwesomeIcon icon={faSearch} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search songs & artists..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <motion.button 
          className={`filter-btn ${showFavorites ? 'active' : ''}`}
          onClick={() => setShowFavorites(!showFavorites)}
          title="Show Favorites"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '0.5rem',
            color: showFavorites ? '#ef4444' : 'var(--text-secondary)',
            fontSize: '1.2rem',
            transition: 'all 0.3s ease'
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faHeart} />
        </motion.button>
      </div>

      <div className="library-songs">
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song) => (
            <LibrarySong
              song={song}
              setCurrentSong={setCurrentSong}
              songs={songs}
              key={song.id}
              audioRef={audioRef}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
            />
          ))
        ) : (
          <h3 style={{textAlign: 'center', padding: '2rem'}}>No songs found</h3>
        )}
      </div>
    </div>
  );
};

export default Library;
