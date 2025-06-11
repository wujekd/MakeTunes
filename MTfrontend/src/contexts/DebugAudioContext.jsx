import React, { createContext, useState, useRef, useEffect } from 'react';

export const DebugAudioContext = createContext(null);

export const DebugAudioProvider = ({ children }) => {
  // Simple state
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(null);
  
  // Audio refs
  const backingTrackRef = useRef(null);
  const submissionTrackRef = useRef(null);

  // Initialize audio elements
  useEffect(() => {
    console.log('[DebugAudio] Initializing audio elements');
    
    // Create audio elements
    const backingAudio = new Audio();
    const submissionAudio = new Audio();
    
    // Set basic properties
    backingAudio.preload = 'auto';
    submissionAudio.preload = 'auto';
    
    // Store in refs
    backingTrackRef.current = backingAudio;
    submissionTrackRef.current = submissionAudio;
    
    console.log('[DebugAudio] Audio elements created');
    
    // Cleanup
    return () => {
      if (backingTrackRef.current) {
        backingTrackRef.current.pause();
        backingTrackRef.current.src = '';
      }
      if (submissionTrackRef.current) {
        submissionTrackRef.current.pause();
        submissionTrackRef.current.src = '';
      }
    };
  }, []);

  // Load backing track
  const loadBackingTrack = (url) => {
    console.log('[DebugAudio] Loading backing track:', url);
    if (backingTrackRef.current && url) {
      backingTrackRef.current.src = url;
      console.log('[DebugAudio] Backing track URL set');
    }
  };

  // Load submission
  const loadSubmission = (url) => {
    console.log('[DebugAudio] Loading submission:', url);
    if (submissionTrackRef.current && url) {
      submissionTrackRef.current.src = url;
      console.log('[DebugAudio] Submission URL set');
    }
  };

  // Play both tracks
  const play = async () => {
    try {
      console.log('[DebugAudio] Starting playback');
      
      if (!backingTrackRef.current || !submissionTrackRef.current) {
        throw new Error('Audio elements not initialized');
      }

      // Reset to beginning
      backingTrackRef.current.currentTime = 0;
      submissionTrackRef.current.currentTime = 0;

      // Start both
      await Promise.all([
        backingTrackRef.current.play(),
        submissionTrackRef.current.play()
      ]);

      setIsPlaying(true);
      setError(null);
      console.log('[DebugAudio] Playback started successfully');
    } catch (err) {
      console.error('[DebugAudio] Playback failed:', err);
      setError(err.message);
      setIsPlaying(false);
    }
  };

  // Pause both tracks
  const pause = () => {
    console.log('[DebugAudio] Pausing playback');
    
    if (backingTrackRef.current) {
      backingTrackRef.current.pause();
    }
    if (submissionTrackRef.current) {
      submissionTrackRef.current.pause();
    }
    
    setIsPlaying(false);
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const value = {
    isPlaying,
    error,
    loadBackingTrack,
    loadSubmission,
    play,
    pause,
    togglePlay
  };

  return (
    <DebugAudioContext.Provider value={value}>
      {children}
    </DebugAudioContext.Provider>
  );
};

export const useDebugAudio = () => {
  const context = React.useContext(DebugAudioContext);
  if (!context) {
    throw new Error('useDebugAudio must be used within a DebugAudioProvider');
  }
  return context;
}; 