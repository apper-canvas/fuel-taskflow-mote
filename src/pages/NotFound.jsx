import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getIcon } from '../utils/iconUtils';

// Icons
const AlertTriangleIcon = getIcon('alert-triangle');
const ArrowLeftIcon = getIcon('arrow-left');
const HomeIcon = getIcon('home');

const NotFound = () => {
  const navigate = useNavigate();
  
  // Auto-redirect after 10 seconds
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      navigate('/');
    }, 10000);
    
    return () => clearTimeout(redirectTimer);
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <AlertTriangleIcon className="h-16 w-16 text-amber-500" />
        </div>
        
        <h1 className="mb-2 text-3xl font-bold">404</h1>
        <h2 className="mb-4 text-xl font-semibold">Page Not Found</h2>
        
        <p className="mb-6 text-surface-600 dark:text-surface-400">
          The page you are looking for doesn't exist or has been moved.
          You'll be redirected to the home page in a few seconds.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link 
            to="/"
            className="btn btn-primary w-full"
          >
            <HomeIcon className="mr-2 h-4 w-4" />
            Go Home
          </Link>
          
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline w-full"
          >
            <ArrowLeftIcon className="mr-2 h-4 w-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;