/**
 * Network and Connectivity Check Utility
 * Provides methods to check network status and handle offline scenarios
 */

export const networkChecker = {
  /**
   * Check if device has internet connectivity
   */
  isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  },

  /**
   * Check connectivity with Firebase backend
   */
  async checkFirebaseConnectivity(): Promise<boolean> {
    try {
      if (!this.isOnline()) {
        return false;
      }

      // Use a simple fetch to test connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch('https://www.google.com/robots.txt', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      return response.ok || response.status === 200 || response.status === 304;
    } catch {
      return false;
    }
  },

  /**
   * Get user-friendly connectivity error message
   */
  getConnectivityError(): string {
    if (!this.isOnline()) {
      return 'No internet connection. Please check your network and try again.';
    }
    return 'Unable to connect to the server. Please check your connection and try again.';
  },

  /**
   * Wait for network to come online
   */
  waitForOnline(maxWaitTime: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isOnline()) {
        resolve(true);
        return;
      }

      const timeout = setTimeout(() => {
        window.removeEventListener('online', handleOnline);
        resolve(false);
      }, maxWaitTime);

      const handleOnline = () => {
        clearTimeout(timeout);
        window.removeEventListener('online', handleOnline);
        resolve(true);
      };

      window.addEventListener('online', handleOnline);
    });
  },

  /**
   * Setup network status listeners
   */
  setupNetworkListeners(onlineCallback?: () => void, offlineCallback?: () => void) {
    if (typeof window === 'undefined') return;

    if (onlineCallback) {
      window.addEventListener('online', onlineCallback);
    }

    if (offlineCallback) {
      window.addEventListener('offline', offlineCallback);
    }

    return () => {
      if (onlineCallback) {
        window.removeEventListener('online', onlineCallback);
      }
      if (offlineCallback) {
        window.removeEventListener('offline', offlineCallback);
      }
    };
  },
};
