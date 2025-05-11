import React, { useEffect } from 'react';
import { useAudio } from '../contexts/AudioContext';

const SubmissionItem = ({ submission, onAddToFavorites }) => {
  const { 
    playTrack, 
    currentTrackId, 
    isPlaying, 
    progress,
    togglePlay
  } = useAudio();

  const isCurrentTrack = currentTrackId === submission.id;
  
  const handlePlayClick = () => {
    playTrack(submission.id, submission.audioUrl);
    console.log(`Playing track: ${submission.id} from ${submission.audioUrl}`);
  };

  const handlePauseClick = () => {
    togglePlay();
    console.log(`Pausing track: ${submission.id}`);
  };

  const handleAddToFavorites = () => {
    console.log('testy');
    if (onAddToFavorites) {
      onAddToFavorites(submission); 
      console.log('Added to favorites');
      console.log(submission);
    }
  };

  // Calculate progress for this specific submission
  const displayProgress = isCurrentTrack ? progress : 0;

  // Add a highlight style for the currently playing submission using contrast color
  const containerStyle = isCurrentTrack && isPlaying ? {
    backgroundColor: 'var(--primary1-700)',
    borderLeft: '3px solid var(--contrast-600)',
    boxShadow: '0 0 5px var(--contrast-700)',
    padding: '5px'
  } : {};

  return (
    <div className="submission-container" style={containerStyle}>
      <button className="play-button" onClick={(isPlaying && isCurrentTrack) ? handlePauseClick : handlePlayClick}>
        <div className="progress-bar" style={{ width: `${displayProgress}%` }}></div>
        <span className="play-icon">{isCurrentTrack && isPlaying ? '❚❚' : '▶'}</span>
      </button>
      {onAddToFavorites && (
        <button 
          className="favorite-button" 
          onClick={handleAddToFavorites}
          // Enable the favorite button if this track is being played or progress is >= 80%
          // disabled={!(isCurrentTrack)}
        >
          Add to favorites
        </button>
      )}
    </div>
  );
};

export default SubmissionItem;