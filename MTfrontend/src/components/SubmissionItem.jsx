import React, { useState } from 'react';

const SubmissionItem = ({ submission, onAddToFavorites }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(67);

  const handlePlayClick = () => {
    setIsPlaying(!isPlaying);
    
  };


  const handleAddToFavorites = () => {
    if (onAddToFavorites) {
      onAddToFavorites(submission); 
      console.log('Added to favorites');
      console.log(submission);
    }
  };


  return (
    <div className="submission-container">
      <button className="play-button" onClick={handlePlayClick}>
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <span className="play-icon">{isPlaying ? '❚❚' : '▶'}</span>
      </button>
      {onAddToFavorites && (
        <button className="favorite-button" onClick={handleAddToFavorites}>
          Add to favorites
        </button>
      )}
    </div>
  );
};


export default SubmissionItem;