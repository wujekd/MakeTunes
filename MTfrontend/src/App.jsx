import { useState } from 'react'
import Mixer from './components/Mixer'
import Favorites from './components/Favorites'
import Submissions from './components/Submissions'
import InfoTop from './components/InfoTop'
import { AudioProvider } from './contexts/AudioContext'

function App() {
  const [favorites, setFavorites] = useState([]);


  const [mockSubmissions, setMockSubmissions] = useState([
    { id: 1, audioUrl: './tempAudio/madash1.mp3' },
    { id: 2, audioUrl: './tempAudio/NIEDOPALONY JOINT.wav' }
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
      <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
        <InfoTop />
        <Favorites favorites={favorites} onRemoveFromFavorites={handleRemoveFromFavorites} />
        <Mixer submissions={[...mockSubmissions, ...favorites]} />
        <Submissions onAddToFavorites={handleAddToFavorites} mockSubmissions={mockSubmissions} />
      </main>
    </AudioProvider>
  )
}

export default App
