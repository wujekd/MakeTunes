import React, { useState } from 'react';
import { AudioProvider, useAudio } from '../contexts/AudioContext';
import InfoTop from '../components/InfoTop';
import Favorites from '../components/Favorites';
import Mixer from '../components/Mixer';
import Submissions from '../components/Submissions';
import { mockApi } from '../services/mockApi';

const AudioInitializer = ({ children, backingTrackUrl }) => {
  const { setBackingTrack } = useAudio();

  React.useEffect(() => {
    if (backingTrackUrl) {
      console.log('Initializing backing track with URL:', backingTrackUrl);
      setBackingTrack(backingTrackUrl);
    }
  }, []);

  return children;
};

const HomeView = () => {
  const [favorites, setFavorites] = useState([]);
  const [votedFor, setVotedFor] = useState(null);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const [mockSubmissions, setMockSubmissions] = useState([
    { id: 1, audioUrl: '/tempAudio/madash1.mp3', listened: false },
    { id: 2, audioUrl: '/tempAudio/NIEDOPALONY JOINT.wav', listened: true }
  ]);

  const [mockBacking] = useState([
    '/tempAudio/voiceover2.mp3'
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
  );
};

export default HomeView; 