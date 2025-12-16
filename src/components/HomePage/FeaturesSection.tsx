import { motion } from 'framer-motion';
import { ShuffleCard, FavoritesCard, DarkModeCard, SearchCard } from './FeatureCards';

export default function FeaturesSection() {
  return (
    <motion.section 
      className="features"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        Why Playyly?
      </motion.h2>
      
      <div className="features-grid">
        <ShuffleCard />
        <FavoritesCard />
        <DarkModeCard />
        <SearchCard />
      </div>
    </motion.section>
  );
}
