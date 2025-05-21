// Format seconds into human-readable duration
export const formatDuration = (seconds) => {
  if (seconds === 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (minutes > 0 || (hours > 0 && remainingSeconds > 0)) {
    result += `${minutes}m`;
  }
  
  if (hours === 0 && minutes === 0 && remainingSeconds > 0) {
    result = `${remainingSeconds}s`;
  }
  
  return result.trim();
};

// Calculate the duration between two dates in seconds
export const calculateDuration = (startDate, endDate) => {
  return Math.floor((new Date(endDate) - new Date(startDate)) / 1000);
};