import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { startTimer, pauseTimer, resumeTimer, stopTimer } from '../store';
import { getIcon } from '../utils/iconUtils';
import { formatDuration } from '../utils/timeUtils';

// Icons
const PlayIcon = getIcon('play');
const PauseIcon = getIcon('pause');
const StopIcon = getIcon('square');

const TimeTracker = ({ taskId, onTimeEntryCompleted, isActive }) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const activeTimer = useSelector(state => state.timer.activeTimer);
  const dispatch = useDispatch();
  
  // Set up timer when active
  useEffect(() => {
    let intervalId;
    
    if (isActive && activeTimer?.isRunning) {
      // Calculate initial elapsed time
      const startTime = new Date(activeTimer.startTime);
      const initialElapsed = Math.floor((new Date() - startTime) / 1000);
      setElapsedSeconds(initialElapsed);
      
      // Set up interval to update elapsed time
      intervalId = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, activeTimer]);
  
  const handleStart = () => {
    dispatch(startTimer({ taskId }));
    setElapsedSeconds(0);
  };
  
  const handlePauseResume = () => {
    if (activeTimer?.isRunning) {
      dispatch(pauseTimer());
    } else {
      dispatch(resumeTimer());
    }
  };
  
  const handleStop = () => {
    if (activeTimer && activeTimer.taskId === taskId) {
      const startTime = new Date(activeTimer.startTime);
      const endTime = new Date();
      const seconds = Math.floor((endTime - startTime) / 1000);
      
      dispatch(stopTimer());
      
      // Report time entry to parent component
      onTimeEntryCompleted(taskId, seconds, startTime, endTime);
      setElapsedSeconds(0);
    }
  };
  
  return (
    <div className="flex items-center space-x-1">
      {isActive ? (
        <>
          <button
            onClick={handlePauseResume}
            className={`rounded-md p-1.5 ${activeTimer?.isRunning 
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400' 
              : 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'}`}
            title={activeTimer?.isRunning ? "Pause timer" : "Resume timer"}
          >
            {activeTimer?.isRunning ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleStop}
            className="rounded-md bg-red-100 p-1.5 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
            title="Stop timer"
          >
            <StopIcon className="h-3.5 w-3.5" />
          </button>
          <span className="text-xs font-medium">{formatDuration(elapsedSeconds)}</span>
        </>
      ) : (
        <button
          onClick={handleStart}
          className="rounded-md bg-blue-100 p-1.5 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
          title="Start timer"
        >
          <PlayIcon className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default TimeTracker;