import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

// Pages
import Home from './pages/Home';
import NotFound from './pages/NotFound';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 transition-colors duration-300 dark:bg-surface-900 dark:text-surface-50">
      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleDarkMode}
        className="fixed right-4 top-4 z-50 rounded-full bg-white p-2 shadow-soft dark:bg-surface-800"
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
      >
        {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-primary" />}
      </motion.button>

      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {/* Toast Container for notifications */}
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={darkMode ? "dark" : "light"}
        toastClassName="rounded-lg font-sans"
      />
    </div>
  );
}

export default App;