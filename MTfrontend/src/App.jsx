import { useState } from 'react'
import Mixer from './components/Mixer'
import Favorites from './components/Favorites'
import Submissions from './components/Submissions'
import InfoTop from './components/InfoTop'

function App() {
  const [favorites, setFavorites] = useState([]);


  const [mockSubmissions, setMockSubmissions] = useState([
    { id: 1, audioUrl: '#' },
    { id: 2, audioUrl: '#' },
    { id: 3, audioUrl: '#' },
    { id: 4, audioUrl: '#' },
    { id: 5, audioUrl: '#' },
    { id: 6, audioUrl: '#' },
    { id: 7, audioUrl: '#' },
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
      // Remove from favorites
      const updatedFavorites = favorites.filter(sub => sub.id !== submission.id);
      setFavorites(updatedFavorites);
      
      // Add back to submissions
      if (!mockSubmissions.find(sub => sub.id === submission.id)) {
        setMockSubmissions([...mockSubmissions, submission]);
      }
    }
  }

  return (
      <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>

        <InfoTop />
        <Favorites favorites={favorites} onRemoveFromFavorites={handleRemoveFromFavorites} />
        <Mixer />
        <Submissions onAddToFavorites={handleAddToFavorites} mockSubmissions={mockSubmissions} />

      
      </main>
  )
}

export default App
