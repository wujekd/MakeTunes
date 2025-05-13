import { useState, useEffect } from 'react'
import Mixer from './components/Mixer'
import Favorites from './components/Favorites'
import Submissions from './components/Submissions'
import InfoTop from './components/InfoTop'
import { AudioProvider, useAudio } from './contexts/AudioContext'
import { mockApi } from './services/mockApi'

// Create a wrapper component to handle audio initialization
const AudioInitializer = ({ children, backingTrackUrl }) => {
  const { setBackingTrack } = useAudio();

  useEffect(() => {
    if (backingTrackUrl) {
      console.log('Initializing backing track with URL:', backingTrackUrl);
      setBackingTrack(backingTrackUrl);
    }
  }, []); // Only run once on mount

  return children;
};

function App() {
  const [favorites, setFavorites] = useState([]);
  const [votedFor, setVotedFor] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const [mockSubmissions, setMockSubmissions] = useState([
    { id: 1, audioUrl: '/tempAudio/madash1.mp3', listened: false },
    { id: 2, audioUrl: '/tempAudio/NIEDOPALONY JOINT.wav', listened: true }
  ]);

  const [mockBacking] = useState([
    '/tempAudio/voiceover2.mp3'  // Updated to match the actual file path
  ]);

  const handleAddToFavorites = (submission) => {
    if (!favorites.find(fav => fav.id === submission.id)) {
      setFavorites([...favorites, submission]);
      const updatedSubmissions = mockSubmissions.filter(sub => sub.id !== submission.id);
      setMockSubmissions(updatedSubmissions);
    }
  };

  const handleRemoveFromFavorites = (submission) => {
    if (favorites.find(fav => fav.id === submission.id)) {
      const updatedFavorites = favorites.filter(sub => sub.id !== submission.id);
      setFavorites(updatedFavorites);
      
      if (!mockSubmissions.find(sub => sub.id === submission.id)) {
        setMockSubmissions([...mockSubmissions, submission]);
      }

      // If removing the voted submission, clear the vote
      if (votedFor === submission.id) {
        setVotedFor(null);
      }
    }
  };

  const handleVote = async (submission) => {
    if (isSubmittingVote) return;
    
    setIsSubmittingVote(true);
    try {
      const result = await mockApi.submitFinalVote(submission.id);
      if (result.success) {
        setVotedFor(submission.id);
        // Move the voted submission to the beginning of favorites
        const updatedFavorites = [
          submission,
          ...favorites.filter(fav => fav.id !== submission.id)
        ];
        setFavorites(updatedFavorites);
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const handleMarkAsListened = async (submissionId) => {
    try {
      const result = await mockApi.markSubmissionAsListened(submissionId);
      if (result.success) {
        setMockSubmissions(prevSubmissions => 
          prevSubmissions.map(sub => 
            sub.id === submissionId 
              ? { ...sub, listened: true }
              : sub
          )
        );
      }
    } catch (error) {
      console.error('Error marking submission as listened:', error);
    }
  };

  return (
    <AudioProvider>
      <AudioInitializer backingTrackUrl={mockBacking[0]}>
        <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
          <InfoTop />
          <Favorites 
            favorites={favorites} 
            onRemoveFromFavorites={handleRemoveFromFavorites}
            onVote={handleVote}
            votedFor={votedFor}
            isSubmittingVote={isSubmittingVote}
          />
          <Mixer submissions={[...mockSubmissions, ...favorites]} />
          <Submissions 
            onAddToFavorites={handleAddToFavorites} 
            mockSubmissions={mockSubmissions}
            onMarkAsListened={handleMarkAsListened}
          />
        </main>
      </AudioInitializer>
    </AudioProvider>
  )
}

export default App
