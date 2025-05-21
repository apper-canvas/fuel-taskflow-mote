import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, BarChart3, Home, Bookmark } from 'lucide-react';

// Pages
import HomePage from './pages/Home';
import NotFound from './pages/NotFound';
import Reports from './pages/Reports';
import Templates from './pages/Templates';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });
  const { pathname } = useLocation();

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
      {/* Navigation */}
      <nav className="fixed top-0 z-40 flex w-full items-center justify-between bg-white px-4 py-3 shadow-sm dark:bg-surface-800">
        <div className="flex items-center space-x-6">
          <h1 className="text-xl font-bold text-primary">TaskFlow</h1>
          <div className="flex items-center space-x-2">
            <Link 
              to="/" 
              className={`flex items-center rounded-md px-3 py-2 text-sm ${pathname === '/' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
            >
              <Home className="mr-2 h-4 w-4" />
              Tasks
            </Link>
            <Link
              to="/reports" 
              className={`flex items-center rounded-md px-3 py-2 text-sm ${pathname === '/reports' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-surface-100 dark:hover:bg-surface-700'}`}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Reports
            </Link>
            <Link
              to="/templates" 
              className={`flex items-center rounded-md px-3 py-2 text-sm ${
                pathname === '/templates' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Templates
            </Link>
            <Link
              to="/templates" 
              className={`flex items-center rounded-md px-3 py-2 text-sm ${
                pathname === '/templates' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <Bookmark className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </div>
        </div>
      </nav>
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
          <Route path="/" element={<HomePage />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates" element={<Templates />} />
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