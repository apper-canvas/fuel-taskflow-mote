import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { getIcon } from '../utils/iconUtils';
import MainFeature from '../components/MainFeature';

// Icons
const CheckCircleIcon = getIcon('check-circle');
const UsersIcon = getIcon('users');
const BarChartIcon = getIcon('bar-chart-2');
const LayoutIcon = getIcon('layout-dashboard');

const Home = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  // Hide welcome message after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Stats data for the dashboard
  const stats = [
    {
      title: "Tasks Completed",
      value: "12",
      icon: "check-circle",
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
    },
    {
      title: "In Progress",
      value: "4",
      icon: "clock",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
    },
    {
      title: "Team Members",
      value: "5",
      icon: "users",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "Projects",
      value: "3",
      icon: "folder",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
    }
  ];

  // Render a stat card with icon
  const StatCard = ({ stat }) => {
    const Icon = getIcon(stat.icon);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center rounded-xl p-4 ${stat.color}`}
      >
        <div className="mr-4 rounded-lg bg-white/30 p-3 dark:bg-black/20">
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium">{stat.title}</p>
          <h3 className="text-2xl font-bold">{stat.value}</h3>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Welcome toast notification */}
      {showWelcome && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="rounded-lg bg-white px-6 py-3 shadow-soft dark:bg-surface-800"
          >
            <p className="flex items-center text-sm font-medium">
              <CheckCircleIcon className="mr-2 h-5 w-5 text-green-500" />
              Welcome to TaskFlow! Your productivity journey starts here.
            </p>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-surface-200 dark:border-surface-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary md:text-3xl">
                TaskFlow
              </h1>
              <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                Organize • Collaborate • Achieve
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => toast.success("New project created!")}
                className="btn btn-primary shadow-soft"
              >
                <span className="flex items-center">
                  <span className="mr-2 text-xs">+</span> New Project
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Stats */}
        <section className="mb-10">
          <h2 className="mb-4 text-xl font-semibold">Dashboard Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </div>
        </section>

        {/* Main Feature */}
        <section className="mb-10">
          <h2 className="mb-6 text-xl font-semibold">Task Management</h2>
          <MainFeature />
        </section>

        {/* Features Section */}
        <section className="mb-10">
          <h2 className="mb-6 text-xl font-semibold">Key Features</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card hover:shadow-soft transition-shadow"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                <CheckCircleIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Task Tracking</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Create, organize and prioritize tasks with deadline reminders and status updates.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card hover:shadow-soft transition-shadow"
            >
              <div className="mb-4 rounded-full bg-secondary/10 p-3 w-12 h-12 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Team Collaboration</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Assign tasks to team members, share project details, and communicate efficiently.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="card hover:shadow-soft transition-shadow"
            >
              <div className="mb-4 rounded-full bg-accent/10 p-3 w-12 h-12 flex items-center justify-center">
                <BarChartIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Progress Analytics</h3>
              <p className="text-sm text-surface-600 dark:text-surface-400">
                Track productivity metrics, visualize project progress, and identify bottlenecks.
              </p>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Home;