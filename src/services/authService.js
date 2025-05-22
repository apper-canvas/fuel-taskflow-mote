/**
 * Authentication service to manage auth state and ApperClient instance
 */

let apperClientInstance = null;

export const authService = {
  /**
   * Get the ApperClient instance, initializing it if necessary
   * @returns {Object} ApperClient instance
   */
  getApperClient: () => {
    if (!apperClientInstance) {
      const { ApperClient } = window.ApperSDK;
      apperClientInstance = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
    return apperClientInstance;
  },

  /**
   * Reset the ApperClient instance (useful after logout)
   */
  resetApperClient: () => {
    apperClientInstance = null;
  }
};
