import React from 'react';
import SubmissionItem from './SubmissionItem';

const Favorites = ({ favorites, onRemoveFromFavorites }) => {
  // Style for the favorite item container to have proper positioning context
  const favoriteItemStyle = {
    position: 'relative',
    display: 'inline-block'
  };

  // Style for the remove button with absolute positioning
  const removeButtonStyle = {
    position: 'absolute',
    top: '0',
    right: '0',
    zIndex: '10',
    background: 'rgba(255, 0, 0, 0.7)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  };

  // Style for the favorites container to reduce vertical spacing
  const favoritesContainerStyle = {
    marginTop: '-15px'  // Negative margin to move items up
  };

  return (
    <section className="favorites-section col-span-5 row-span-1">
      <h2 className="favorites-title">Favorites</h2>
      
      <div className="favorites-container" style={favoritesContainerStyle}>
        {favorites && favorites.length > 0 ? (
          favorites.map(favorite => (
            <div key={favorite.id} className="favorite-item" style={favoriteItemStyle}>
              <button
                style={removeButtonStyle}
                onClick={() => onRemoveFromFavorites(favorite)}
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