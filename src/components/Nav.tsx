import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const Nav = ({ libraryStatus, setLibraryStatus, theme, toggleTheme, hideLibrary = false }) => {
  const spring = {
    type: "spring",
    stiffness: 700,
    damping: 30
  } as any;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Playly
      </motion.h1>
      <div className="nav-buttons">
        <motion.div 
          className={`theme-toggle-switch ${theme}`}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="switch-handle"
            layout 
            transition={spring}
          >
            <motion.div
              key={theme}
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <FontAwesomeIcon icon={theme === 'light' ? faSun : faMoon} />
            </motion.div>
          </motion.div>
        </motion.div>
        {!hideLibrary && (
          <motion.button 
            onClick={() => setLibraryStatus(!libraryStatus)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Library &nbsp;
            <FontAwesomeIcon icon={faMusic} />
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
};

export default Nav;