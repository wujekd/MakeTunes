// Mock API calls for development
export const mockApi = {
  // Mark submission as listened after reaching 80% of playback
  markSubmissionAsListened: async (submissionId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, submissionId });
      }, 2000);
    });
  },

  // Submit final vote for a submission
  submitFinalVote: async (submissionId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, submissionId });
      }, 3000);
    });
  }
}; 