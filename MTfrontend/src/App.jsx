import { useState } from 'react'
import Mixer from './components/Mixer'
import Favorites from './components/Favorites'
import Submissions from './components/Submissions'

function App() {
  const [favorites, setFavorites] = useState([]);

  const handleAddToFavorites = (submission) => {
    if (!favorites.find(fav => fav.id === submission.id)) {
      setFavorites([...favorites, submission]);
    }
  };

  return (
    <div className="wrapper">
      <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
        <section className='info-section col-span-7 row-span-2'>
          <div className='w-2/3 flex flex-col gap-3'>
            <h3>Project Title</h3>
            <p>Votes: 0</p>
            <h3 className="text-gray-500 text-xl">Author</h3>
          </div>
          <p>Project description goes here</p>
          <div className="flex">
            <img src="https://via.placeholder.com/140" alt="Cover" className="rounded" />
          </div>
        </section>

        <Favorites />
        
        <Mixer />

        <Submissions onAddToFavorites={handleAddToFavorites} />
      </main>
    </div>
  )
}

export default App
