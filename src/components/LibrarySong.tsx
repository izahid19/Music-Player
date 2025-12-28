import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

interface Song {
  id: string;
  name: string;
  artist: string;
  cover: string;
  audio: string;
  color: [string, string];
  active: boolean;
  source?: 'local' | 'jiosaavn';
}

interface LibrarySongProps {
  name: string;
  artist: string;
  cover: string;
  id: string;
  setCurrentSong: (song: Song) => void;
  songs: Song[];
  audioRef: React.RefObject<HTMLAudioElement>;
  isPlaying: boolean;
  setSongs: (songs: Song[]) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  active: boolean;
  isFavorite: boolean;
  isPopular: boolean;
  source?: 'local' | 'jiosaavn';
  onExternalPlay?: () => void;
  songData?: Song;
}

const LibrarySong: React.FC<LibrarySongProps> = ({
  name,
  artist,
  cover,
  id,
  setCurrentSong,
  songs,
  audioRef,
  isPlaying,
  setSongs,
  setIsPlaying,
  active,
  isFavorite,
  isPopular,
  source = 'local',
  onExternalPlay,
  songData,
}) => {
  const songSelectHandler = async () => {
    // For JioSaavn songs, use the external play handler
    if (source === 'jiosaavn' && onExternalPlay) {
      onExternalPlay();
      return;
    }

    // For local songs, use the existing logic
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

    // Always play the song when selected from library
    // Use setTimeout to ensure the audio source is updated first
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Playback error:', e));
        if (setIsPlaying) setIsPlaying(true);
      }
    }, 100);
  };

  return (
    <div onClick={songSelectHandler} className={`library-song ${active ? 'selected' : ''} ${source === 'jiosaavn' ? 'jiosaavn-song' : ''}`}>
      <img src={cover} alt={name}></img>
      <div className="song-description">
        <h3>
            {name} 
            {isPopular && source === 'local' && (
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

