/**
 * Firebase Error Handler Utility
 * Provides user-friendly error messages for Firebase authentication errors
 */

export const getFirebaseErrorMessage = (error: any): string => {
  // Handle error object with code property
  const errorCode = error?.code || error?.message;
  
  if (!errorCode) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Authentication errors
  if (errorCode.includes('auth/popup-blocked')) {
    return 'Pop-up was blocked by your browser. Please enable pop-ups and try again.';
  }
  
  if (errorCode.includes('auth/popup-closed-by-user')) {
    return 'Sign-in was cancelled. Please try again.';
  }
  
  if (errorCode.includes('auth/internal-error')) {
    return 'Authentication service error. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('auth/network-request-failed')) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  if (errorCode.includes('auth/email-already-in-use')) {
    return 'The email ID is already existed. Try with another email.';
  }
  
  if (errorCode.includes('auth/invalid-email')) {
    return 'Invalid email address. Please enter a valid email.';
  }
  
  if (errorCode.includes('auth/weak-password')) {
    return 'Password is too weak. Please use a stronger password.';
  }
  
  if (errorCode.includes('auth/user-not-found')) {
    return 'No account found with this email. Please register first.';
  }
  
  if (errorCode.includes('auth/wrong-password')) {
    return 'Incorrect password. Please try again.';
  }
  
  if (errorCode.includes('auth/too-many-requests')) {
    return 'Too many login attempts. Please try again later.';
  }
  
  if (errorCode.includes('auth/account-exists-with-different-credential')) {
    return 'An account already exists with this email but a different sign-in method.';
  }
  
  // Firestore errors
  if (errorCode.includes('firestore') || errorCode.includes('FIRESTORE')) {
    return 'Database connection error. Please check your internet connection and try again.';
  }
  
  // Network errors
  if (errorCode.includes('network') || errorCode.includes('NETWORK')) {
    return 'Network connection error. Please check your internet connection and try again.';
  }
  
  // Certificate errors
  if (errorCode.includes('ERR_CERT')) {
    return 'SSL certificate error. Please check that you are accessing the correct website.';
  }
  
  // Default message
  return error?.message || 'An error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  const message = error?.message || error?.code || '';
  return message.includes('network') || 
         message.includes('offline') || 
         message.includes('connection') ||
         message.includes('ERR_');
};

export const isAuthError = (error: any): boolean => {
  const code = error?.code || error?.message || '';
  return code.includes('auth/');
};

export const shouldRetry = (error: any): boolean => {
  const code = error?.code || error?.message || '';
  return isNetworkError(error) || code.includes('UNAVAILABLE') || code.includes('DEADLINE_EXCEEDED');
};
