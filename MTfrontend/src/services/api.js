
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


  // MARK SUBMISSION AS FAVORITE
  //[HttpPost("add-favorite")]
  addFavorite: async (SubmissionId, CollabId) => {
    console.log("Adding favorite- submissionId: ", SubmissionId, " collabId: ", CollabId);

    try {
      const response = await fetch(`${API_BASE_URL}/VotingControllers/add-favorite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ SubmissionId, CollabId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // UNMARK SUBMISSION AS FAVORITE
removeFavorite: async (SubmissionId, CollabId) => {
  console.log("Removing favorite - submissionId:", SubmissionId, "collabId:", CollabId);

  try {
    const response = await fetch(`${API_BASE_URL}/VotingControllers/remove-favorite`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ SubmissionId, CollabId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response;

  } catch (error) {
    console.error('Error removing favorite:', error);
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
