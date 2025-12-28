import React, { useState, useEffect, useCallback } from 'react';
import LibrarySong from './LibrarySong';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSearch, faHeart, faSpinner } from '@fortawesome/free-solid-svg-icons';

interface Song {
  id: string;
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  active: boolean;
  source?: 'local' | 'jiosaavn';
  album?: string;
  duration?: number;
  year?: string;
}

interface LibraryProps {
  songs: Song[];
  setCurrentSong: (song: Song) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  setSongs: (songs: Song[]) => void;
  libraryStatus: boolean;
  setLibraryStatus: (status: boolean) => void;
  favorites?: string[];
  onJioSaavnPlay?: (song: Song) => void;
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
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
  favorites = [],
  onJioSaavnPlay,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavorites, setShowFavorites] = useState(false);
  const [jioSaavnSongs, setJioSaavnSongs] = useState<Song[]>([]);
  const [isSearchingJioSaavn, setIsSearchingJioSaavn] = useState(false);
  const [jioSaavnError, setJioSaavnError] = useState<string | null>(null);
  
  // Debounce search query for JioSaavn API
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  // Filter local songs
  const filteredSongs = songs ? songs.filter(song => {
      const matchesSearch = song.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          song.artist.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFavorite = showFavorites ? favorites.includes(song.id) : true;
      return matchesSearch && matchesFavorite;
  }) : [];

  // Search JioSaavn when debounced query changes
  useEffect(() => {
    const searchJioSaavn = async () => {
      if (debouncedSearchQuery.trim().length < 2) {
        setJioSaavnSongs([]);
        setJioSaavnError(null);
        return;
      }

      setIsSearchingJioSaavn(true);
      setJioSaavnError(null);

      try {
        const response = await fetch(`/api/jiosaavn/search?query=${encodeURIComponent(debouncedSearchQuery)}&limit=10`);
        const data = await response.json();
        
        if (data.success && data.songs) {
          setJioSaavnSongs(data.songs);
        } else {
          setJioSaavnSongs([]);
          if (data.error) {
            setJioSaavnError(data.error);
          }
        }
      } catch (error) {
        console.error('JioSaavn search error:', error);
        setJioSaavnSongs([]);
        setJioSaavnError('Could not connect to JioSaavn');
      } finally {
        setIsSearchingJioSaavn(false);
      }
    };

    searchJioSaavn();
  }, [debouncedSearchQuery]);

  const handleClose = () => {
    setLibraryStatus(false);
  };

  // Handle JioSaavn song selection
  const handleJioSaavnSongSelect = useCallback((song: Song) => {
    if (onJioSaavnPlay) {
      onJioSaavnPlay(song);
    } else {
      // Fallback: set as current song directly
      setCurrentSong(song);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(e => console.log('Playback error:', e));
          setIsPlaying(true);
        }
      }, 100);
    }
  }, [onJioSaavnPlay, setCurrentSong, audioRef, setIsPlaying]);

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
            placeholder="Search songs & artists..." 
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
        {/* Local Songs Section */}
        {filteredSongs.length > 0 && (
          <>
            {searchQuery.trim().length >= 2 && (
              <div className="library-section-header">
                <span>Your Library</span>
              </div>
            )}
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
                isPopular={songs.findIndex((s: Song) => s.id === song.id) < 3}
                source="local"
              />
            ))}
          </>
        )}

        {/* JioSaavn Section */}
        {searchQuery.trim().length >= 2 && (
          <>
            <div className="library-section-header jiosaavn-header">
              <span>🌍 Global Results</span>
              {isSearchingJioSaavn && (
                <FontAwesomeIcon icon={faSpinner} spin className="search-spinner" />
              )}
            </div>
            
            {jioSaavnError && (
              <div className="jiosaavn-error">
                {jioSaavnError}
              </div>
            )}
            
            {!isSearchingJioSaavn && !jioSaavnError && jioSaavnSongs.length === 0 && (
              <div className="jiosaavn-no-results">
                No results found online
              </div>
            )}
            
            {jioSaavnSongs.map((song) => (
              <LibrarySong
                songs={[song]}
                cover={song.cover}
                name={song.name}
                artist={song.artist}
                active={false}
                key={song.id}
                id={song.id}
                setCurrentSong={() => {}}
                audioRef={audioRef}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                setSongs={() => {}}
                isFavorite={false}
                isPopular={false}
                source="jiosaavn"
                onExternalPlay={() => handleJioSaavnSongSelect(song)}
                songData={song}
              />
            ))}
          </>
        )}

        {/* Empty state */}
        {filteredSongs.length === 0 && searchQuery.trim().length < 2 && (
          <div className="library-empty">
            {showFavorites ? 'No favorites yet' : 'No songs in library'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
