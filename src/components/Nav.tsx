'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic, faTachometerAlt } from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import Link from "next/link";

interface NavProps {
  libraryStatus?: boolean;
  setLibraryStatus?: (status: boolean) => void;
  hideLibrary?: boolean;
}

const Nav = ({ libraryStatus = false, setLibraryStatus = () => {}, hideLibrary = false }: NavProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.email) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

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
        {isLoggedIn && (
          <Link href="/admin/dashboard">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ marginRight: hideLibrary ? 0 : '10px' }}
            >
              Dashboard
              <FontAwesomeIcon icon={faTachometerAlt} style={{ marginLeft: "0.5rem" }} />
            </motion.button>
          </Link>
        )}
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
