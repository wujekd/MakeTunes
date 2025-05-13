import React, { createContext, useState, useEffect, useRef } from 'react';

// Create the context
export const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  // Audio context reference
  const audioContextRef = useRef(null);
  
  // Audio element references
  const masterAudioRef = useRef(null);
  const backingAudioRef = useRef(null);
  
  // state
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [masterGainNode, setMasterGainNode] = useState(null);
  const [backingGainNode, setBackingGainNode] = useState(null);

  const [masterSource, setMasterSource] = useState(null);
  const [backingSource, setBackingSource] = useState(null);

  const [masterVolume, setMasterVolume] = useState(1);
  const [backingVolume, setBackingVolume] = useState(1);

  const [error, setError] = useState(null);
  
  // Web Audio API context init
  useEffect(() => {
    try {
      // Create Audio Context
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      
      // Create gain nodes
      const masterGain = audioContextRef.current.createGain();
      const backingGain = audioContextRef.current.createGain();
      
      // Set gain values
      masterGain.gain.value = masterVolume;
      backingGain.gain.value = backingVolume;
      
      // Connect gain nodes to destination
      masterGain.connect(audioContextRef.current.destination);
      backingGain.connect(audioContextRef.current.destination);
      
      setMasterGainNode(masterGain);
      setBackingGainNode(backingGain);
      
      console.log('Audio context initialized:', audioContextRef.current);
    } catch (err) {
      console.error('Error initializing Audio Context:', err);
      setError(err.message);
    }
    
    // Clean up
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize audio sources when audio elements are available
  useEffect(() => {
    const initializeSources = () => {
      if (!audioContextRef.current || !masterAudioRef.current || !backingAudioRef.current) return;
      if (masterSource || backingSource) return;

      try {
        // Create master source
        const masterSrc = audioContextRef.current.createMediaElementSource(masterAudioRef.current);
        masterSrc.connect(masterGainNode);
        setMasterSource(masterSrc);

        // Create backing source
        const backingSrc = audioContextRef.current.createMediaElementSource(backingAudioRef.current);
        backingSrc.connect(backingGainNode);
        setBackingSource(backingSrc);
      } catch (err) {
        console.error('Error creating audio sources:', err);
        setError(err.message);
      }
    };

    // Wait for both gain nodes to be available
    if (masterGainNode && backingGainNode) {
      initializeSources();
    }
  }, [masterGainNode, backingGainNode]);
  
  // Update volume levels when they change
  useEffect(() => {
    if (masterGainNode) {
      masterGainNode.gain.value = masterVolume;
    }
  }, [masterVolume, masterGainNode]);
  
  useEffect(() => {
    if (backingGainNode) {
      backingGainNode.gain.value = backingVolume;
    }
  }, [backingVolume, backingGainNode]);
  
  // Play a track
  const playTrack = (trackId, audioUrl) => {
    console.log(`Attempting to play track ${trackId} from URL: ${audioUrl}`);
    
    if (!audioContextRef.current || !masterAudioRef.current) {
      console.error('Audio context or element not initialized');
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
    
    // Set the audio source
    masterAudioRef.current.src = audioUrl;
    setCurrentTrackId(trackId);
    
    // Start playback
    masterAudioRef.current.play()
      .then(() => {
        setIsPlaying(true);
        setDuration(masterAudioRef.current.duration);
      })
      .catch(err => {
        console.error('Error playing audio:', err);
        setError(err.message);
      });
  };
  
  const togglePlay = () => {
    if (!masterAudioRef.current) return;
    
    if (isPlaying) {
      masterAudioRef.current.pause();
    } else {
      masterAudioRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  // Track progress
  useEffect(() => {
    if (!masterAudioRef.current) return;
    
    const updateProgress = () => {
      if (masterAudioRef.current) {
        const current = masterAudioRef.current.currentTime;
        const total = masterAudioRef.current.duration;
        setCurrentTime(current);
        setProgress((current / total) * 100);
      }
    };
    
    masterAudioRef.current.addEventListener('timeupdate', updateProgress);
    
    return () => {
      if (masterAudioRef.current) {
        masterAudioRef.current.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, []);
  
  // Handle track ending
  useEffect(() => {
    if (!masterAudioRef.current) return;
    
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
    
    masterAudioRef.current.addEventListener('ended', handleEnded);
    
    return () => {
      if (masterAudioRef.current) {
        masterAudioRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);
  
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
    masterVolume,
    backingVolume,
    error,
    
    // Refs
    masterAudioRef,
    backingAudioRef,
    
    // Methods
    playTrack,
    togglePlay,
    nextTrack,
    previousTrack,
    setMasterVolume,
    setBackingVolume
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