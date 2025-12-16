import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";

const Nav = ({ libraryStatus, setLibraryStatus, hideLibrary = false }) => {
  return (
    <nav>
      <motion.h1
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        Playyly
      </motion.h1>
      <div className="nav-buttons">
        {!hideLibrary && (
          <button onClick={() => setLibraryStatus(!libraryStatus)}>
            Library
            <FontAwesomeIcon icon={faMusic} style={{ marginLeft: "0.5rem" }} />
          </button>
        )}
      </div>
    </nav>
  );
};

export default Nav;
