'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 1 }}
    >
      <motion.p
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        Built with ❤️ by{' '}
        <a 
          href="https://devzahid.vercel.app/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
          style={{ textDecoration: 'underline', fontWeight: 500 }}
        >
          Zahid
        </a>
      </motion.p>
    </motion.footer>
  );
}
