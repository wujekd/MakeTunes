import React, { useState } from 'react';
import SubmissionItem from './SubmissionItem';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  const handleAddToFavorites = (submission) => {
    // is submission already in favorites
    if (!favorites.find(fav => fav.id === submission.id)) {
      setFavorites([...favorites, submission]);
    }
  };

  const handleRemoveFavorite = (id) => {
    setFavorites(favorites.filter(fav => fav.id !== id));
  };

  return (
    <section className="favorites-section col-span-5 row-span-1">
      <h2 className="favorites-title">Favorites</h2>
      
      <div className="favorites-container">
        {favorites.length > 0 ? (
          favorites.map(favorite => (
            <div key={favorite.id} className="favorite-item">
              <button 
                className="remove-favorite"
                onClick={() => handleRemoveFavorite(favorite.id)}
              >
                ×
              </button>
              <SubmissionItem 
                submission={favorite} 
                onAddToFavorites={null} // No need to add again
              />
            </div>
          ))
        ) : (
          <div className="favorites-empty">No favorites added yet</div>
        )}
      </div>
    </section>
  );
};

export default Favorites; 