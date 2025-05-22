import { useState, useEffect, createContext } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, BarChart3, Home, Bookmark, FolderKanban } from 'lucide-react';

// Pages
import HomePage from './pages/Home';
import NotFound from './pages/NotFound';
import Reports from './pages/Reports';
import Templates from './pages/Templates';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Callback from './pages/Callback';
import ErrorPage from './pages/ErrorPage';
import { setUser, clearUser } from './store/userSlice';

// Create auth context
export const AuthContext = createContext(null);

// Create protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.user);
  const navigate = useNavigate();
  return isAuthenticated ? children : navigate('/login');
};
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    if (localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return true;
    }
    return false;
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInitialized, setIsInitialized] = useState(false);
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

  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || currentPath.includes(
            '/callback') || currentPath.includes('/error');
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
               ? `/signup?redirect=${currentPath}`
               : currentPath.includes('/login')
               ? `/login?redirect=${currentPath}`
               : '/login');
          } else if (redirectPath) {
            if (
              ![
                'error',
                'signup',
                'login',
                'callback'
              ].some((path) => currentPath.includes(path)))
              navigate(`/login?redirect=${redirectPath}`);
            else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, [dispatch, navigate]);

  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
        toast.success("Logged out successfully");
      } catch (error) {
        console.error("Logout failed:", error);
        toast.error("Logout failed");
      }
    }
  };

  // Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="flex items-center justify-center h-screen bg-surface-50 dark:bg-surface-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-surface-50 text-surface-900 transition-colors duration-300 dark:bg-surface-900 dark:text-surface-50">
      {/* Navigation */}
      {useSelector(state => state.user.isAuthenticated) && (
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
              to="/projects" 
              className={`flex items-center rounded-md px-3 py-2 text-sm ${
                pathname === '/projects' ? 'bg-primary/10 text-primary dark:bg-primary/20' : 'hover:bg-surface-100 dark:hover:bg-surface-700'
              }`}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              Projects
            </Link>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-surface-600 dark:text-surface-400">
            {useSelector(state => state.user.user?.firstName)}
          </span>
          <button 
            onClick={authMethods.logout}
            className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Logout
          </button>
        </div>
      </nav>
      )}
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
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
          <Route path="/" element={<HomePage />} />  
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
    </AuthContext.Provider>
  );
}

export default App;