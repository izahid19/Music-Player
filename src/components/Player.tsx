import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faAngleLeft,
  faAngleRight,
  faPause,
  faShuffle,
  faRepeat,
  faVolumeHigh,
  faVolumeXmark
} from "@fortawesome/free-solid-svg-icons";

const Player = ({
  audioRef,
  currentSong,
  isPlaying,
  setIsPlaying,
  setSongInfo,
  songInfo,
  songs,
  setCurrentSong,
  setSongs,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  isShuffled,
  setIsShuffled,
  repeatMode,
  setRepeatMode
}) => {
  const activeLibraryHandler = (nextPrev) => {
    const newSongs = songs.map((song) => {
      if (song.id === nextPrev.id) {
        return { ...song, active: true };
      } else {
        return { ...song, active: false };
      }
    });
    setSongs(newSongs);
  };

  const playSongHandler = () => {
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(!isPlaying);
    } else {
      audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const getTime = (time) => {
    return (
      Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2)
    );
  };

  const dragHandler = (e) => {
    audioRef.current.currentTime = e.target.value;
    setSongInfo({ ...songInfo, currentTime: e.target.value });
  };

  const skipTrackHandler = async (direction) => {
    let currentIndex = songs.findIndex((song) => song.id === currentSong.id);
    if (direction === "skip-forward") {
      await setCurrentSong(songs[(currentIndex + 1) % songs.length]);
      activeLibraryHandler(songs[(currentIndex + 1) % songs.length]);
    }
    if (direction === "skip-back") {
      if ((currentIndex - 1) % songs.length === -1) {
        await setCurrentSong(songs[songs.length - 1]);
        activeLibraryHandler(songs[songs.length - 1]);
        if (isPlaying) audioRef.current.play();
        return;
      }
      await setCurrentSong(songs[(currentIndex - 1) % songs.length]);
      activeLibraryHandler(songs[(currentIndex - 1) % songs.length]);
    }
    if (isPlaying) audioRef.current.play();
  };
  
  const trackAnim = {
    transform: `translateX(${songInfo.animationPercentage}%)`
  };

  const cycleRepeat = () => {
      const modes = ['off', 'one', 'all'];
      const nextIndex = (modes.indexOf(repeatMode) + 1) % modes.length;
      if (setRepeatMode) setRepeatMode(modes[nextIndex]);
  };

  return (
    <div className="player">
      <div className="time-control">
        <p>{getTime(songInfo.currentTime)}</p>
        <div
          style={{
            background: `linear-gradient(to right, ${currentSong.color[0]}, ${currentSong.color[1]})`,
          }}
          className="track"
        >
          <input
            min={0}
            max={songInfo.duration || 0}
            value={songInfo.currentTime}
            onChange={dragHandler}
            type="range"
          />
          <div style={trackAnim} className="animate-track"></div>
        </div>
        <p>{songInfo.duration ? getTime(songInfo.duration) : "0:00"}</p>
      </div>
      <div className="controls-wrapper">
        <div className="play-control">
          <FontAwesomeIcon
            onClick={() => setIsShuffled && setIsShuffled(!isShuffled)}
            className={`shuffle ${isShuffled ? 'active' : ''}`}
            size="1x"
            icon={faShuffle}
          />
          <FontAwesomeIcon
            onClick={() => skipTrackHandler('skip-back')}
            className="skip-back"
            size="2x"
            icon={faAngleLeft}
          />
          <FontAwesomeIcon
            onClick={playSongHandler}
            className="play"
            size="2x"
            icon={isPlaying ? faPause : faPlay}
          />
          <FontAwesomeIcon
            onClick={() => skipTrackHandler('skip-forward')}
            className="skip-forward"
            size="2x"
            icon={faAngleRight}
          />
          <div className="repeat-btn">
             <FontAwesomeIcon
                onClick={cycleRepeat}
                className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`}
                size="1x"
                icon={faRepeat}
              />
              {repeatMode === 'one' && (
                <span className="repeat-one-badge">1</span>
              )}
          </div>
        </div>
        <div className="volume-control">
           <FontAwesomeIcon 
             onClick={() => setIsMuted && setIsMuted(!isMuted)}
             className="volume-icon"
             size="1x"
             icon={isMuted || volume === 0 ? faVolumeXmark : faVolumeHigh}
           />
           <input
             onChange={(e) => setVolume && setVolume(parseFloat(e.target.value))}
             type="range"
             min={0}
             max={1}
             step={0.01}
             value={isMuted ? 0 : volume}
             className="volume-slider"
             style={{
                background: `linear-gradient(to right, var(--accent-color) ${isMuted ? 0 : volume * 100}%, rgba(255,255,255,0.1) ${isMuted ? 0 : volume * 100}%)`
             }}
           />
        </div>
      </div>
    </div>
  );
};

export default Player;
