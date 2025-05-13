import { useState, useEffect } from 'react'
import Mixer from './components/Mixer'
import Favorites from './components/Favorites'
import Submissions from './components/Submissions'
import InfoTop from './components/InfoTop'
import { AudioProvider, useAudio } from './contexts/AudioContext'

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

  const [mockSubmissions, setMockSubmissions] = useState([
    { id: 1, audioUrl: '/tempAudio/madash1.mp3' },
    { id: 2, audioUrl: '/tempAudio/NIEDOPALONY JOINT.wav' }
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
    }
  }

  return (
    <AudioProvider>
      <AudioInitializer backingTrackUrl={mockBacking[0]}>
        <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
          <InfoTop />
          <Favorites favorites={favorites} onRemoveFromFavorites={handleRemoveFromFavorites} />
          <Mixer submissions={[...mockSubmissions, ...favorites]} />
          <Submissions onAddToFavorites={handleAddToFavorites} mockSubmissions={mockSubmissions} />
        </main>
      </AudioInitializer>
    </AudioProvider>
  )
}

export default App
