'use client';

import React, { useState, useRef, useEffect } from "react";

//Import Components
import Player from "../../components/Player";
import SongComponent from "../../components/Song";
import Library from "../../components/Library";
import Nav from "../../components/Nav";

interface Song {
  id: string;
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  active: boolean;
}

function MusicPlayer() {
  //Ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const isInitialMount = useRef(true);
  const hasFetchedSongs = useRef(false);

  //State
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [songInfo, setSongInfo] = useState({
    currentTime: 0,
    duration: 0,
    animationPercentage: 0,
  });
  const [libraryStatus, setLibraryStatus] = useState(false);
  const [volume, setVolume] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('musicPlayerVolume');
      return saved !== null ? parseFloat(saved) : 0.3;
    }
    return 0.3;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffled, setIsShuffled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('musicPlayerShuffle') === 'true';
    }
    return false;
  });
  const [repeatMode, setRepeatMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('musicPlayerRepeat') || 'off';
    }
    return 'off';
  });
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('musicPlayerTheme') || 'light';
    }
    return 'light';
  });
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('musicPlayerFavorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Fetch songs from API
  useEffect(() => {
    if (hasFetchedSongs.current) return;
    hasFetchedSongs.current = true;

    const fetchSongs = async () => {
      try {
        const response = await fetch('/api/songs?all=true');
        if (!response.ok) throw new Error('Failed to fetch songs');
        
        const data = await response.json();
        const songsData = data.songs || data;
        
        if (!songsData || songsData.length === 0) {
          setError('No songs available. Add songs from the admin dashboard.');
          setLoading(false);
          return;
        }

        // Restore active state from localStorage
        const savedSongId = localStorage.getItem('musicPlayerSongId');
        const songsWithActive = songsData.map((song: Song, index: number) => ({
          ...song,
          active: savedSongId ? song.id === savedSongId : index === 0,
        }));

        setSongs(songsWithActive);
        
        // Set current song
        const activeSong = songsWithActive.find((s: Song) => s.active) || songsWithActive[0];
        setCurrentSong(activeSong);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError('Failed to load songs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Favorites Persistence
  useEffect(() => {
    localStorage.setItem('musicPlayerFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Theme Persistence
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('musicPlayerTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme: string) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleFavorite = (songId: string) => {
    if (favorites.includes(songId)) {
      setFavorites(favorites.filter((id: string) => id !== songId));
    } else {
      setFavorites([...favorites, songId]);
    }
  };

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('musicPlayerVolume', volume.toString());
    localStorage.setItem('musicPlayerShuffle', isShuffled.toString());
    localStorage.setItem('musicPlayerRepeat', repeatMode);
  }, [volume, isShuffled, repeatMode]);

  // Save current song to localStorage
  useEffect(() => {
    if (currentSong?.id) {
      localStorage.setItem('musicPlayerSongId', currentSong.id);
    }
  }, [currentSong]);

  // Save playback position periodically
  useEffect(() => {
    const savePosition = () => {
      if (audioRef.current && !isNaN(audioRef.current.currentTime)) {
        localStorage.setItem('musicPlayerPosition', audioRef.current.currentTime.toString());
      }
    };

    let interval: any;
    if (isPlaying) {
      interval = setInterval(savePosition, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
      savePosition();
    };
  }, [isPlaying]);

  // Handle playback
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Playback error:", error);
        });
      }
    }
  }, [isPlaying, currentSong]);

  // Helper function for skip track
  const skipTrack = (direction: string) => {
    if (!currentSong) return;
    
    let currentIndex = songs.findIndex((song: Song) => song.id === currentSong.id);
    let nextIndex;

    if (isShuffled && direction === 'forward') {
      nextIndex = Math.floor(Math.random() * songs.length);
      while (nextIndex === currentIndex && songs.length > 1) {
        nextIndex = Math.floor(Math.random() * songs.length);
      }
    } else if (direction === 'forward') {
      nextIndex = (currentIndex + 1) % songs.length;
    } else {
      nextIndex = currentIndex - 1 < 0 ? songs.length - 1 : currentIndex - 1;
    }

    const nextSong = songs[nextIndex];
    setCurrentSong(nextSong);

    if (isPlaying) {
      setTimeout(() => {
        const audio = audioRef.current;
        if (audio) {
          audio.play().catch(e => console.log('Playback error:', e));
        }
      }, 100);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (isPlaying) {
            audioRef.current?.pause();
          } else {
            audioRef.current?.play();
          }
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          skipTrack('forward');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          skipTrack('back');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(prev + 0.1, 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(prev - 0.1, 0));
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          setIsMuted(!isMuted);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, isMuted, currentSong, isShuffled]);

  const timeUpdateHandler = (e: any) => {
    const current = e.target.currentTime;
    const duration = e.target.duration;
    const roundedCurrent = Math.round(current);
    const roundedDuration = Math.round(duration);
    const animation = Math.round((roundedCurrent / roundedDuration) * 100);

    setSongInfo({
      ...songInfo,
      currentTime: current,
      duration: duration,
      animationPercentage: animation,
    });
  };

  // Sync active state when currentSong changes
  useEffect(() => {
    if (!currentSong) return;
    setSongs((prevSongs: Song[]) => {
      return prevSongs.map((song) => ({
        ...song,
        active: song.id === currentSong.id,
      }));
    });
  }, [currentSong]);

  const songEndHandler = async () => {
    if (!audioRef.current || !currentSong) return;

    if (repeatMode === 'one') {
      audioRef.current.currentTime = 0;
      if (isPlaying) audioRef.current.play();
      return;
    }

    let currentIndex = songs.findIndex((song: Song) => song.id === currentSong.id);
    let nextIndex;

    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * songs.length);
      while (nextIndex === currentIndex && songs.length > 1) {
        nextIndex = Math.floor(Math.random() * songs.length);
      }
    } else if (repeatMode === 'all' || currentIndex < songs.length - 1) {
      nextIndex = (currentIndex + 1) % songs.length;
    } else {
      setIsPlaying(false);
      return;
    }

    const nextSong = songs[nextIndex];
    setCurrentSong(nextSong);

    if (isPlaying) {
      setTimeout(() => audioRef.current?.play(), 100);
    }
  };

  // Loading or error state
  if (loading || error || !currentSong) {
    return (
      <div className="App" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--bg-color)',
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: 20 }}>
          {loading ? (
            <>
              <div className="loading-spinner" style={{
                width: 50,
                height: 50,
                border: '3px solid rgba(102, 126, 234, 0.2)',
                borderTop: '3px solid #667eea',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px',
              }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ color: 'var(--text-color)' }}>Loading music...</p>
            </>
          ) : (
            <>
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 24,
              }}>🎵</div>
              <p style={{ color: 'var(--text-color)', marginBottom: 20 }}>
                {error || 'No songs available'}
              </p>
              <a 
                href="/admin/login" 
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: 8,
                  fontWeight: 500,
                }}
              >
                Go to Admin Dashboard
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`App ${libraryStatus ? "library-active" : ""}`}>
      <div className="ocean" style={{ background: `${currentSong.color[0]}` }}>
        <div className="wave" style={{ background: `${currentSong.color[1]}` }}></div>
        <div className="wave" style={{ background: `${currentSong.color[1]}` }}></div>
      </div>
      <Nav
        libraryStatus={libraryStatus}
        setLibraryStatus={setLibraryStatus}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <SongComponent
        currentSong={currentSong}
        isPlaying={isPlaying}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
      <Player
        currentSong={currentSong}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        audioRef={audioRef}
        setSongInfo={setSongInfo}
        songInfo={songInfo}
        songs={songs}
        setCurrentSong={setCurrentSong}
        setSongs={setSongs}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isShuffled={isShuffled}
        setIsShuffled={setIsShuffled}
        repeatMode={repeatMode}
        setRepeatMode={setRepeatMode}
        skipTrack={skipTrack}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
      <Library
        songs={songs}
        setCurrentSong={setCurrentSong}
        audioRef={audioRef}
        isPlaying={isPlaying}
        setSongs={setSongs}
        libraryStatus={libraryStatus}
        setLibraryStatus={setLibraryStatus}
        setIsPlaying={setIsPlaying}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
      />
      <audio
        onTimeUpdate={timeUpdateHandler}
        onLoadedMetadata={(e) => {
          timeUpdateHandler(e);
          if (isInitialMount.current) {
            const savedPosition = localStorage.getItem('musicPlayerPosition');
            if (savedPosition && audioRef.current) {
              const position = parseFloat(savedPosition);
              if (!isNaN(position)) {
                audioRef.current.currentTime = position;
              }
            }
            isInitialMount.current = false;
          }
        }}
        ref={audioRef}
        src={currentSong.audio}
        onEnded={songEndHandler}
      />
    </div>
  );
}

export default MusicPlayer;
