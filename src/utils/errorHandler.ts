import { Alert, Platform } from 'react-native';

export interface ErrorInfo {
  title?: string;
  message: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

/**
 * Detects if an error is a network/connectivity error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;

  const errorMessage = error.message.toLowerCase();
  const networkKeywords = [
    'network',
    'fetch',
    'connection',
    'internet',
    'offline',
    'timeout',
    'econnrefused',
    'enotfound',
    'enodev',
    'networkerror',
    'failed to fetch',
  ];

  return networkKeywords.some((keyword) => errorMessage.includes(keyword));
};

/**
 * Gets a user-friendly error message based on error type
 */
export const getErrorMessage = (error: unknown, defaultMessage?: string): string => {
  if (!error) {
    return defaultMessage || 'Something went wrong. Please try again.';
  }

  // Network/connectivity errors
  if (isNetworkError(error)) {
    return 'No internet connection. Please check your network and try again.';
  }

  // Firebase/Firestore errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('permission') || errorMessage.includes('permission-denied')) {
      return 'You do not have permission to perform this action.';
    }
    
    if (errorMessage.includes('unavailable') || errorMessage.includes('unreachable')) {
      return 'Service is temporarily unavailable. Please try again later.';
    }
    
    if (errorMessage.includes('quota') || errorMessage.includes('limit')) {
      return 'Service limit reached. Please try again later.';
    }

    // Return the original error message if it's already user-friendly
    if (error.message && error.message.length < 100) {
      return error.message;
    }
  }

  return defaultMessage || 'Something went wrong. Please try again.';
};

/**
 * Shows a consistent error alert to the user
 */
export const showErrorAlert = (
  error: unknown,
  options?: {
    title?: string;
    defaultMessage?: string;
    showRetry?: boolean;
    onRetry?: () => void;
    onDismiss?: () => void;
  }
): void => {
  const title = options?.title || 'Error';
  const message = getErrorMessage(error, options?.defaultMessage);
  const showRetry = options?.showRetry || false;
  const onRetry = options?.onRetry;
  const onDismiss = options?.onDismiss;

  const buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [];

  if (showRetry && onRetry) {
    buttons.push(
      {
        text: 'Retry',
        onPress: onRetry,
      },
      {
        text: 'OK',
        style: 'cancel',
        onPress: onDismiss,
      }
    );
  } else {
    buttons.push({
      text: 'OK',
      onPress: onDismiss,
    });
  }

  Alert.alert(title, message, buttons);
};

/**
 * Shows a success alert
 */
export const showSuccessAlert = (
  message: string,
  title: string = 'Success',
  onDismiss?: () => void
): void => {
  Alert.alert(title, message, [
    {
      text: 'OK',
      onPress: onDismiss,
    },
  ]);
};

/**
 * Shows an error alert with retry option for Firestore operations
 */
export const showFirestoreError = (
  error: unknown,
  retryAction?: () => void,
  onDismiss?: () => void
): void => {
  showErrorAlert(error, {
    title: 'Error',
    defaultMessage: 'Failed to save. Please check your connection and try again.',
    showRetry: !!retryAction,
    onRetry: retryAction,
    onDismiss,
  });
};

/**
 * Shows a network error alert
 */
export const showNetworkError = (retryAction?: () => void, onDismiss?: () => void): void => {
  showErrorAlert(new Error('Network error'), {
    title: 'No Internet Connection',
    defaultMessage: 'Please check your internet connection and try again.',
    showRetry: !!retryAction,
    onRetry: retryAction,
    onDismiss,
  });
};

/**
 * Shows an OpenAI/API error alert
 */
export const showAPIError = (error: unknown, retryAction?: () => void): void => {
  let defaultMessage = 'Something went wrong. Please try again.';
  let title = 'Error';
  
  // Extract more specific error messages
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase();
    
    if (errorMsg.includes('network') || errorMsg.includes('connection') || errorMsg.includes('fetch')) {
      defaultMessage = 'No internet connection. Please check your network and try again.';
      title = 'Connection Error';
    } else if (errorMsg.includes('quota') || errorMsg.includes('exceeded') || errorMsg.includes('429')) {
      defaultMessage = 'OpenAI API quota exceeded. Please:\n\n• Check your OpenAI account billing\n• Add credits to your OpenAI account\n• Verify your subscription is active\n\nYou can manage this at: https://platform.openai.com/account/billing';
      title = 'API Quota Exceeded';
    } else if (errorMsg.includes('server error') || errorMsg.includes('500')) {
      defaultMessage = 'The server encountered an error. This is likely due to:\n\n• Missing or invalid OpenAI API key on the backend\n• Backend API not properly configured\n• Server temporarily unavailable\n\nPlease check your backend configuration and try again.';
      title = 'Server Error';
    } else if (errorMsg.includes('api') || errorMsg.includes('server')) {
      defaultMessage = 'Server error. Please try again in a moment.';
      title = 'Server Error';
    } else if (errorMsg.includes('timeout')) {
      defaultMessage = 'Request timed out. Please try again.';
      title = 'Timeout';
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      defaultMessage = 'API endpoint not found. Please check if the backend is deployed correctly.';
      title = 'API Not Found';
    } else if (errorMsg.length > 0 && errorMsg.length < 200) {
      // Use the actual error message if it's user-friendly
      defaultMessage = error.message;
    }
  }
  
  showErrorAlert(error, {
    title: title,
    defaultMessage: defaultMessage,
    showRetry: !!retryAction,
    onRetry: retryAction,
  });
};

/**
 * Shows a payment error alert with specific RevenueCat error handling
 */
export const showPaymentError = (error: unknown, retryAction?: () => void): void => {
  let title = 'Purchase Failed';
  let message = 'Unable to complete purchase. Please try again.';

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('cancelled') || errorMessage.includes('cancel')) {
      // User cancelled - don't show error
      return;
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      title = 'Connection Error';
      message = 'Unable to connect to the store. Please check your internet connection and try again.';
    } else if (errorMessage.includes('payment') || errorMessage.includes('billing')) {
      message = 'There was an issue processing your payment. Please check your payment method and try again.';
    } else if (errorMessage.includes('already purchased') || errorMessage.includes('owned')) {
      message = 'You already own this subscription. Please restore your purchases if needed.';
    } else {
      message = error.message || message;
    }
  }

  const buttons: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }> = [];

  if (retryAction) {
    buttons.push(
      {
        text: 'Retry',
        onPress: retryAction,
      },
      {
        text: 'OK',
        style: 'cancel',
      }
    );
  } else {
    buttons.push({
      text: 'OK',
    });
  }

  Alert.alert(title, message, buttons);
};

