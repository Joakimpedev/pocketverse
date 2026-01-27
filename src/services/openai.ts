// API endpoint URL - Backend deployed on Vercel
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://pocketverse-api.vercel.app/api/get-verse';

export interface VerseResponse {
  reference: string;
  text: string;
  explanation: string;
}

/**
 * Gets a Bible verse for a given situation using backend API
 * API key is stored securely on the backend, never in the app
 * @param userInput - The user's description of their situation or feelings
 * @returns Verse data with reference, text, and explanation
 * @throws Error if API call fails or response is invalid
 */
export const getVerseForSituation = async (
  userInput: string
): Promise<VerseResponse> => {
  if (!userInput.trim()) {
    throw new Error('User input cannot be empty');
  }

  try {
    console.log('Making API request to:', API_BASE_URL);
    console.log('Request payload:', { userInput: userInput.trim().substring(0, 50) + '...' });
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput: userInput.trim() }),
    });

    console.log('API response status:', response.status);
    console.log('API response ok:', response.ok);

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      let errorDetails = '';
      
      try {
        const errorData = await response.json();
        console.error('API error response (JSON):', errorData);
        errorMessage = errorData.error || errorData.message || errorMessage;
        errorDetails = JSON.stringify(errorData);
      } catch (parseError) {
        try {
          const textResponse = await response.text();
          console.error('API error response (text):', textResponse);
          if (textResponse && textResponse.trim()) {
            errorMessage = textResponse.trim();
            errorDetails = textResponse;
          }
        } catch (textError) {
          console.error('Could not read error response:', textError);
        }
      }
      
      // Provide specific error message based on status code
      if (response.status === 500) {
        // Check for specific OpenAI errors in the error message
        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('exceeded')) {
          errorMessage = 'OpenAI API quota exceeded. Please check your OpenAI account billing and add credits to continue using the service.';
        } else if (errorMessage.includes('api key') || errorMessage.includes('invalid')) {
          errorMessage = errorDetails 
            ? `Server error: ${errorDetails.substring(0, 150)}`
            : 'OpenAI API key error. Please check the API key configuration on the backend.';
        } else {
          errorMessage = errorDetails 
            ? `Server error: ${errorDetails.substring(0, 150)}`
            : 'Server error: The API encountered an internal error. Please try again later.';
        }
      } else if (response.status === 404) {
        errorMessage = 'API endpoint not found. Please check if the backend is deployed correctly.';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'Authentication error. Please check API configuration.';
      } else if (response.status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again in a moment.';
      }
      
      throw new Error(errorMessage);
    }

    const verseData: VerseResponse = await response.json();
    console.log('API response received:', { 
      reference: verseData.reference, 
      hasText: !!verseData.text,
      hasExplanation: !!verseData.explanation 
    });

    // Validate response structure
    if (!verseData.reference || !verseData.text || !verseData.explanation) {
      console.error('Invalid response structure:', verseData);
      throw new Error('Invalid response format: missing required fields');
    }

    return verseData;
  } catch (error) {
    console.error('Error in getVerseForSituation:', error);
    
    if (error instanceof Error) {
      // Check if it's a network error
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes('network') ||
        errorMessage.includes('fetch') ||
        errorMessage.includes('connection') ||
        errorMessage.includes('failed to fetch') ||
        errorMessage.includes('networkerror')
      ) {
        throw new Error('No internet connection. Please check your network and try again.');
      }
      
      // Preserve the original error message instead of replacing it
      // Only add context if the message is too generic
      if (error.message === 'Something went wrong. Please try again.' || 
          error.message === 'Failed to get verse') {
        throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
      }
      
      // Re-throw with the original message (or add context)
      throw new Error(error.message || 'Failed to get verse. Please try again.');
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

