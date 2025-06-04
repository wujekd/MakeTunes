
const API_BASE_URL = 'http://localhost:5242/api';

export const api = {

  markSubmissionAsListened: async (submissionId) => {
    console.log('Marking submission as listened:', submissionId);
    try {
      const response = await fetch(`${API_BASE_URL}/VotingControllers/submissions/${submissionId}/mark-listened`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error marking submission as listened:', error);
      throw error;
    }
  },
}; 