'use client';

import { motion } from 'framer-motion';
import { ShuffleCard, FavoritesCard, DarkModeCard, SearchCard } from './FeatureCards';

export default function FeaturesSection() {
  return (
    <motion.section 
      className="features"
      aria-labelledby="features-heading"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2
        id="features-heading"
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        Why Playyly?
      </motion.h2>
      
      <div className="features-grid" role="list">
        <ShuffleCard />
        <FavoritesCard />
        <DarkModeCard />
        <SearchCard />
      </div>
    </motion.section>
  );
}
