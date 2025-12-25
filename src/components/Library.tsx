import React from 'react';
import LibrarySong from './LibrarySong';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch, faHeart } from '@fortawesome/free-solid-svg-icons';

interface LibraryProps {
  songs: any[];
  setCurrentSong: (song: any) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setSongs: (songs: any[]) => void;
  libraryStatus: boolean;
  setLibraryStatus: (status: boolean) => void;
  favorites?: string[];
}

const Library: React.FC<LibraryProps> = ({
  songs,
  setCurrentSong,
  audioRef,
  isPlaying,
  setIsPlaying,
  setSongs,
  libraryStatus,
  setLibraryStatus,
  favorites = []
}) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFavorites, setShowFavorites] = React.useState(false);

  const filteredSongs = songs ? songs.filter(song => {
      const matchesSearch = song.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorite = showFavorites ? favorites.includes(song.id) : true;
      return matchesSearch && matchesFavorite;
  }) : [];

  const handleClose = () => {
    setLibraryStatus(false);
  };

  return (
    <div className={`library ${libraryStatus ? 'active-library' : ''}`}>
      <div className="library-header">
        <h2>Library <span className="song-count">({songs ? songs.length : 0} songs)</span></h2>
        <button 
          className="close-btn"
          onClick={handleClose}
          type="button"
          aria-label="Close library"
        >
          <FontAwesomeIcon icon={faTimes} size="lg" />
        </button>
      </div>
      
      <div className="search-container">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
           <button 
                onClick={() => setShowFavorites(!showFavorites)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}
                title={showFavorites ? "Show All" : "Show Favorites"}
           >
              <FontAwesomeIcon 
                  icon={faHeart} 
                  style={{ color: showFavorites ? '#ef4444' : 'var(--text-secondary)', fontSize: '1.2rem' }} 
              />
           </button>
      </div>

      <div className="library-songs">
        {filteredSongs.map((song) => (
          <LibrarySong
            songs={songs}
            cover={song.cover}
            name={song.name}
            artist={song.artist}
            active={song.active}
            key={song.id}
            id={song.id}
            setCurrentSong={setCurrentSong}
            audioRef={audioRef}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
            setSongs={setSongs}
            isFavorite={favorites.includes(song.id)}
            isPopular={songs.findIndex((s: any) => s.id === song.id) < 3}
          />
        ))}
      </div>
    </div>
  );
};

export default Library;
