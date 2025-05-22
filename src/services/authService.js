/**
 * Authentication service for handling user authentication
 */

// Initialize the ApperClient
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const authService = {
  // Note: Authentication is primarily handled by ApperUI
  // These methods are placeholders for any additional auth functionality
  getApperClient
};