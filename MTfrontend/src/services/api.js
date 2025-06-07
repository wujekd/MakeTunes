
const API_BASE_URL = 'http://localhost:5242/api';

export const api = {


  // MARK SUBMISSION AS LISTENED
  //       [HttpPost("submissions/{submissionId}/mark-listened")] - dotnet endpoint 
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

  // SELECT FINAL CHOICE
  //    [HttpPut("{id}/final-choice")]  - dotnet endpoint 
  markFinalChoice: async (submissionId) => {
    console.log("Marking final choice:", submissionId);

    try {
      const response = await fetch(`${API_BASE_URL}/VotingControllers/${submissionId}/final-choice`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error marking final choice:', error);
      throw error;
    } 
  }
}; 
