import React, { useEffect, useRef } from 'react';
import { useAudio } from '../contexts/AudioContext';
import './SubmissionItem.css';

const SubmissionItem = ({ 
  submission, 
  onAddToFavorites, 
  onVote,
  isVotedFor,
  isSubmittingVote,
  isInFavorites,
  onMarkAsListened
}) => {
  const { 
    currentTrackId, 
    isPlaying, 
    playTrack, 
    togglePlay,
    progress,
    duration
  } = useAudio();

  const isCurrentTrack = currentTrackId === submission.id;
  const displayProgress = isCurrentTrack ? progress : 0;
  const hasListenedEnough = useRef(false);

  // Track if user has listened to 80% of the track
  useEffect(() => {
    if (isCurrentTrack && isPlaying && progress >= 80 && !submission.listened && !hasListenedEnough.current) {
      hasListenedEnough.current = true;
      onMarkAsListened(submission.id);
    }
  }, [isCurrentTrack, isPlaying, progress, submission.listened, submission.id, onMarkAsListened]);

  // Reset the listened flag when track changes
  useEffect(() => {
    if (!isCurrentTrack) {
      hasListenedEnough.current = false;
    }
  }, [isCurrentTrack]);

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(submission.id, submission.audioUrl);
    }
  };

  return (
    <div className={`submission-container ${isVotedFor ? 'voted-for' : ''} ${isSubmittingVote ? 'submitting' : ''}`}>
      <button 
        className="play-button" 
        onClick={handlePlayClick}
      >
        <div className="progress-bar" style={{ width: `${displayProgress}%` }}></div>
        <span className="play-icon">{isCurrentTrack && isPlaying ? '❚❚' : '▶'}</span>
      </button>
      
      {isInFavorites ? (
        <button 
          className="vote-button"
          onClick={() => onVote(submission)}
          disabled={isSubmittingVote || isVotedFor}
        >
          {isVotedFor ? '✓ Voted' : 'Vote'}
        </button>
      ) : (
        <button 
          className="favorite-button"
          onClick={() => onAddToFavorites(submission)}
          disabled={!submission.listened}
        >
          {submission.listened ? 'Add to favorites' : 'Listen to 80% to add'}
        </button>
      )}
    </div>
  );
};

export default SubmissionItem;