import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faAngleLeft,
  faAngleRight,
  faPause,
  faShuffle,
  faRepeat,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";

const Player = ({
  currentSong,
  isPlaying,
  setIsPlaying,
  audioRef,
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
  setRepeatMode,
  skipTrack,
  favorites,
  toggleFavorite,
}) => {
  const playSongHandler = () => {
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const activeLibraryHandler = (nextPrev) => {
    const newSongs = songs.map((songClicked) => {
      if (songClicked.id === nextPrev.id) {
        return { ...songClicked, active: true };
      } else {
        return { ...songClicked, active: false };
      }
    });
    setSongs(newSongs);
    if (isPlaying) audioRef.current.play();
  };

  const getTime = (time) => {
    return Math.floor(time / 60) + ":" + ("0" + Math.floor(time % 60)).slice(-2);
  };

  const draghandler = (e) => {
    audioRef.current.currentTime = e.target.value;
    setSongInfo({ ...songInfo, currentTime: e.target.value });
  };

  const skipTrackHandler = async (direction) => {
    let currentIndex = songs.findIndex((song) => song.active);
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

  const volumeChangeHandler = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMuteHandler = () => {
    setIsMuted(!isMuted);
  };

  const toggleShuffleHandler = () => {
    setIsShuffled(!isShuffled);
  };

  const cycleRepeatHandler = () => {
    const modes = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  const trackAnim = {
    transform: `translateX(${songInfo.animationPercentage}%)`,
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
            type="range"
            onChange={draghandler}
          />
          <div style={trackAnim} className="animate-track" />
        </div>
        <p>{songInfo.duration ? getTime(songInfo.duration) : "0:00"}</p>
      </div>
      
      <div className="play-control">
        <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <FontAwesomeIcon
            onClick={toggleShuffleHandler}
            className={`shuffle ${isShuffled ? 'active' : ''}`}
            icon={faShuffle}
            size="lg"
            title="Shuffle"
          />
        </motion.span>
        
        <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <FontAwesomeIcon
            onClick={() => skipTrackHandler("skip-back")}
            className="skip-back"
            icon={faAngleLeft}
            size="2x"
          />
        </motion.span>
        
        <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
          <FontAwesomeIcon
            onClick={playSongHandler}
            className="play"
            icon={isPlaying ? faPause : faPlay}
            size="2x"
          />
        </motion.span>
        
        <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <FontAwesomeIcon
            onClick={() => skipTrackHandler("skip-forward")}
            className="skip-forward"
            icon={faAngleRight}
            size="2x"
          />
        </motion.span>
        
        <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="repeat-btn">
          <FontAwesomeIcon
            onClick={cycleRepeatHandler}
            className={`repeat ${repeatMode !== 'off' ? 'active' : ''}`}
            icon={faRepeat}
            size="lg"
            title={repeatMode === 'one' ? 'Repeat One' : repeatMode === 'all' ? 'Repeat All' : 'Repeat Off'}
          />
          {repeatMode === 'one' && <span className="repeat-one-badge">1</span>}
        </motion.span>
      </div>
      
      <div className="volume-control">
        <motion.span whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <FontAwesomeIcon
            onClick={toggleMuteHandler}
            className="volume-icon"
            icon={isMuted || volume === 0 ? faVolumeXmark : faVolumeHigh}
            size="lg"
            title={isMuted ? "Unmute" : "Mute"}
          />
        </motion.span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : volume}
          onChange={volumeChangeHandler}
          className="volume-slider"
        />
        <span className="volume-percentage">
          {Math.round((isMuted ? 0 : volume) * 100)}%
        </span>
      </div>
    </div>
  );
};

export default Player;
