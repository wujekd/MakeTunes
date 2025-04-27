import React, { useRef, useEffect } from 'react';
import SubmissionItem from './SubmissionItem';

const Favorites = ({ favorites, onRemoveFromFavorites }) => {
  // Reference to the favorites container
  const scrollContainerRef = useRef(null);

  // Add wheel event listener for horizontal scrolling
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const handleWheel = (event) => {
        // Prevent the default vertical scroll
        event.preventDefault();
        
        // Scroll horizontally instead of vertically
        scrollContainer.scrollLeft += event.deltaY;
      };
      
      // Add the event listener
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
      
      // Clean up the event listener when component unmounts
      return () => {
        scrollContainer.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  
  const favoriteItemStyle = {
    position: 'relative',
    display: 'inline-block', 
    flexShrink: 0,
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

  // Style for the favorites container to reduce vertical spacing and enable horizontal scrolling
  const favoritesContainerStyle = {
    marginTop: '-15px',   // Negative margin to move items up
    display: 'flex',      // Use flexbox for horizontal layout
    overflowX: 'auto',    // Enable horizontal scrolling
    overflowY: 'hidden',  // Disable vertical scrolling
    whiteSpace: 'nowrap', // Prevent items from wrapping
    padding: '10px 0',    // Add some vertical padding
    scrollbarWidth: 'thin', // Thin scrollbar for Firefox
    msOverflowStyle: 'none', // Hide scrollbar in IE/Edge
    flexWrap: 'nowrap',   // Ensure no wrapping in flexbox
  };
  
  // Style for webkit browsers to customize the scrollbar
  const scrollbarStyle = `
    .favorites-container::-webkit-scrollbar {
      height: 4px;
    }
    .favorites-container::-webkit-scrollbar-track {
      background: #f1f1f1;
    }
    .favorites-container::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }
    .favorites-container::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  `;

  return (
    <section className="favorites-section col-span-5 row-span-1">
      <style>{scrollbarStyle}</style>
      <h2 className="favorites-title">Favorites</h2>
      
      <div 
        className="favorites-container" 
        style={favoritesContainerStyle}
        ref={scrollContainerRef}
      >
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
                onAddToFavorites={null}
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