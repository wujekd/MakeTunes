import React, { createContext, useState, useEffect, useRef } from 'react';

// Create the context
export const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  // Audio context reference
  const audioContextRef = useRef(null);
  
  // Audio element references
  const submissionAudioRef = useRef(null);
  const backingAudioRef = useRef(null);
  
  // state
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [submissionGainNode, setSubmissionGainNode] = useState(null);
  const [backingGainNode, setBackingGainNode] = useState(null);

  const [submissionSource, setSubmissionSource] = useState(null);
  const [backingSource, setBackingSource] = useState(null);

  const [submissionVolume, setSubmissionVolume] = useState(1);
  const [backingVolume, setBackingVolume] = useState(1);

  const [error, setError] = useState(null);
  
  // Web Audio API context init
  useEffect(() => {
    let isInitialized = false;
    
    const initializeAudioContext = async () => {
      if (isInitialized) return;
      
      try {
        // Create Audio Context
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioCtx();
        
        // Create gain nodes
        const submissionGain = audioContextRef.current.createGain();
        const backingGain = audioContextRef.current.createGain();
        
        // Set gain values
        submissionGain.gain.value = submissionVolume;
        backingGain.gain.value = backingVolume;
        
        // Connect gain nodes to destination
        submissionGain.connect(audioContextRef.current.destination);
        backingGain.connect(audioContextRef.current.destination);
        
        setSubmissionGainNode(submissionGain);
        setBackingGainNode(backingGain);
        
        isInitialized = true;
        console.log('Audio context initialized:', audioContextRef.current);
      } catch (err) {
        console.error('Error initializing Audio Context:', err);
        setError(err.message);
      }
    };

    initializeAudioContext();
    
    // Clean up
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Set backing track
  const setBackingTrack = (backingUrl) => {
    if (!backingAudioRef.current) {
      console.error('Backing audio element not initialized');
      return;
    }

    if (!backingUrl) {
      console.error('Invalid backing track URL');
      return;
    }

    // Only set if the URL has changed
    if (backingAudioRef.current.src !== backingUrl) {
      console.log('Setting backing track:', backingUrl);
      backingAudioRef.current.crossOrigin = "anonymous";
      backingAudioRef.current.src = backingUrl;
    }
  };

  // Initialize audio sources when audio elements are available
  useEffect(() => {
    let isInitialized = false;
    
    const initializeSources = () => {
      if (isInitialized) return;
      if (!audioContextRef.current || !submissionAudioRef.current || !backingAudioRef.current) return;
      if (submissionSource || backingSource) return;

      try {
        // Set CORS attributes
        submissionAudioRef.current.crossOrigin = "anonymous";
        backingAudioRef.current.crossOrigin = "anonymous";

        // Create submission source
        const submissionSrc = audioContextRef.current.createMediaElementSource(submissionAudioRef.current);
        submissionSrc.connect(submissionGainNode);
        setSubmissionSource(submissionSrc);

        // Create backing source
        const backingSrc = audioContextRef.current.createMediaElementSource(backingAudioRef.current);
        backingSrc.connect(backingGainNode);
        setBackingSource(backingSrc);
        
        isInitialized = true;
        console.log('Audio sources initialized');
      } catch (err) {
        console.error('Error creating audio sources:', err);
        setError(err.message);
      }
    };

    // Wait for both gain nodes to be available
    if (submissionGainNode && backingGainNode) {
      initializeSources();
    }
  }, [submissionGainNode, backingGainNode]);
  
  // Update volume levels when they change
  useEffect(() => {
    if (submissionGainNode) {
      submissionGainNode.gain.value = submissionVolume;
    }
  }, [submissionVolume, submissionGainNode]);
  
  useEffect(() => {
    if (backingGainNode) {
      backingGainNode.gain.value = backingVolume;
    }
  }, [backingVolume, backingGainNode]);
  
  // Play a track
  const playTrack = (trackId, audioUrl) => {
    console.log(`Attempting to play track ${trackId} from URL: ${audioUrl}`);
    
    if (!audioContextRef.current || !submissionAudioRef.current || !backingAudioRef.current) {
      console.error('Audio context or elements not initialized');
      return;
    }

    if (!audioUrl || audioUrl === '#') {
      console.error('Invalid audio URL:', audioUrl);
      return;
    }
    
    // Resume audio context if it's suspended
    if (audioContextRef.current.state === 'suspended') {
      console.log('Resuming suspended audio context');
      audioContextRef.current.resume();
    }
    
    // Set the submission audio source
    submissionAudioRef.current.src = audioUrl;
    setCurrentTrackId(trackId);
    
    // Start playback of both tracks
    Promise.all([
      submissionAudioRef.current.play(),
      backingAudioRef.current.play()
    ])
      .then(() => {
        setIsPlaying(true);
        setDuration(submissionAudioRef.current.duration);
      })
      .catch(err => {
        console.error('Error playing audio:', err);
        setError(err.message);
      });
  };
  
  const togglePlay = () => {
    if (!submissionAudioRef.current || !backingAudioRef.current) return;
    
    if (isPlaying) {
      submissionAudioRef.current.pause();
      backingAudioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Resume audio context if it's suspended (important for page refresh)
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        console.log('Resuming suspended audio context in togglePlay');
        audioContextRef.current.resume();
      }
      
      // Set playing state immediately to update UI
      setIsPlaying(true);
      
      Promise.all([
        submissionAudioRef.current.play(),
        backingAudioRef.current.play()
      ])
        .then(() => {
          console.log('Audio playback started successfully');
        })
        .catch(err => {
          console.error('Error playing audio in togglePlay:', err);
          setError(err.message);
          // Reset playing state if play failed
          setIsPlaying(false);
        });
    }
  };
  
  // Track progress
  useEffect(() => {
    if (!submissionAudioRef.current || !backingAudioRef.current) return;
    
    const updateProgress = () => {
      if (submissionAudioRef.current) {
        const current = submissionAudioRef.current.currentTime;
        const total = submissionAudioRef.current.duration;
        setCurrentTime(current);
        setProgress((current / total) * 100);
        
        // Sync backing track with submission track
        if (Math.abs(backingAudioRef.current.currentTime - current) > 0.1) {
          backingAudioRef.current.currentTime = current;
        }
      }
    };
    
    const audioElement = submissionAudioRef.current;
    audioElement.addEventListener('timeupdate', updateProgress);
    
    return () => {
      audioElement.removeEventListener('timeupdate', updateProgress);
    };
  }, [submissionAudioRef.current]);
  
  // Handle track ending
  useEffect(() => {
    if (!submissionAudioRef.current || !backingAudioRef.current) return;
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      // Stop both tracks
      submissionAudioRef.current.pause();
      backingAudioRef.current.pause();
      // Reset both track positions
      submissionAudioRef.current.currentTime = 0;
      backingAudioRef.current.currentTime = 0;
    };
    
    const submissionElement = submissionAudioRef.current;
    const backingElement = backingAudioRef.current;
    
    submissionElement.addEventListener('ended', handleEnded);
    backingElement.addEventListener('ended', handleEnded);
    
    return () => {
      submissionElement.removeEventListener('ended', handleEnded);
      backingElement.removeEventListener('ended', handleEnded);
    };
  }, [submissionAudioRef.current, backingAudioRef.current]);
  
  // next track
  const nextTrack = (submissionsList) => {
    if (!currentTrackId || !submissionsList || submissionsList.length === 0) return;
    
    const currentIndex = submissionsList.findIndex(submission => submission.id === currentTrackId);
    const nextIndex = (currentIndex + 1) % submissionsList.length;
    const nextSubmission = submissionsList[nextIndex];
    
    playTrack(nextSubmission.id, nextSubmission.audioUrl);
  };
  
  // previous track
  const previousTrack = (submissionsList) => {
    if (!currentTrackId || !submissionsList || submissionsList.length === 0) return;
    
    const currentIndex = submissionsList.findIndex(submission => submission.id === currentTrackId);
    const prevIndex = (currentIndex - 1 + submissionsList.length) % submissionsList.length;
    const prevSubmission = submissionsList[prevIndex];
    
    playTrack(prevSubmission.id, prevSubmission.audioUrl);
  };

  const value = {
    // States
    currentTrackId,
    isPlaying,
    progress,
    currentTime,
    duration,
    submissionVolume,
    backingVolume,
    error,
    
    // Refs
    submissionAudioRef,
    backingAudioRef,
    
    // Methods
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    setSubmissionVolume,
    setBackingVolume,
    setBackingTrack
  };
  
  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
};

// hook for using the audio context
export const useAudio = () => {
  const context = React.useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}; 