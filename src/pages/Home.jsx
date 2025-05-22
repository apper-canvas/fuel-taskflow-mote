import { motion } from 'framer-motion';
import MainFeature from '../components/MainFeature';

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 pt-24 pb-10">
        <h1 className="mb-6 text-3xl font-bold">My Tasks</h1>
        <MainFeature />
      </div>
    </motion.div>
  );
};

export default Home;