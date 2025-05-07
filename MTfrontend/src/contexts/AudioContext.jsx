import React, { createContext, useState, useEffect, useRef } from 'react';

// Create the context
export const AudioContext = createContext(null);

export const AudioProvider = ({ children }) => {
  // Audio context reference
  const audioContextRef = useRef(null);
  
  // Playback state
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Audio nodes
  const [masterGainNode, setMasterGainNode] = useState(null);
  const [backingGainNode, setBackingGainNode] = useState(null);
  
  // Track sources
  const [masterSource, setMasterSource] = useState(null);
  const [backingSource, setBackingSource] = useState(null);
  
  // Volume levels
  const [masterVolume, setMasterVolume] = useState(1);
  const [backingVolume, setBackingVolume] = useState(1);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Initialize Web Audio API context
  useEffect(() => {
    try {
      // Create Audio Context
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioCtx();
      
      // Create gain nodes
      const masterGain = audioContextRef.current.createGain();
      masterGain.connect(audioContextRef.current.destination);
      setMasterGainNode(masterGain);
      
      const backingGain = audioContextRef.current.createGain();
      backingGain.connect(audioContextRef.current.destination);
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
    
    if (!audioContextRef.current) {
      console.error('Audio context not initialized');
      return;
    }
    
    // Ensure we have a valid URL
    if (!audioUrl || audioUrl === '#') {
      console.error('Invalid audio URL:', audioUrl);
      return;
    }
    
    // Resume audio context if it's suspended (needed for browsers that require user interaction)
    if (audioContextRef.current.state === 'suspended') {
      console.log('Resuming suspended audio context');
      audioContextRef.current.resume();
    }
    
    // Stop any currently playing track
    if (masterSource) {
      try {
        masterSource.stop();
        setMasterSource(null);
      } catch (err) {
        console.error('Error stopping current source:', err);
      }
    }
    
    // Set the current track ID
    setCurrentTrackId(trackId);
    
    // For testing with mock audio, use a built-in oscillator if URL contains 'track'
    if (audioUrl.includes('track') && !audioUrl.endsWith('.mp3') && !audioUrl.endsWith('.wav')) {
      console.log('Using test oscillator for mock audio');
      const oscillator = audioContextRef.current.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
      oscillator.connect(masterGainNode);
      oscillator.start();
      setMasterSource(oscillator);
      setIsPlaying(true);
      
      // Set duration for test oscillator
      const testDuration = 10; // 10 seconds
      setDuration(testDuration);
      
      // Simulate progress for 10 seconds
      let startTime = audioContextRef.current.currentTime;
      
      const updateProgress = () => {
        if (!isPlaying) return;
        
        const elapsed = audioContextRef.current.currentTime - startTime;
        const progressValue = (elapsed / testDuration) * 100;
        setProgress(progressValue);
        setCurrentTime(elapsed);
        
        if (progressValue < 100) {
          requestAnimationFrame(updateProgress);
        } else {
          oscillator.stop();
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }
      };
      
      requestAnimationFrame(updateProgress);
      return;
    }
    
    // Create a new source from the audio file
    console.log('Fetching audio file:', audioUrl);
    fetch(audioUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log('Audio fetch response:', response);
        return response.arrayBuffer();
      })
      .then(arrayBuffer => {
        console.log('Audio buffer received, decoding...');
        return audioContextRef.current.decodeAudioData(arrayBuffer);
      })
      .then(audioBuffer => {
        console.log('Audio decoded successfully, length:', audioBuffer.duration);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(masterGainNode);
        
        // Set the duration
        setDuration(audioBuffer.duration);
        
        // Start playback
        source.start();
        setMasterSource(source);
        setIsPlaying(true);
        
        // Track progress
        const startTime = audioContextRef.current.currentTime;
        
        const updateProgress = () => {
          const elapsed = audioContextRef.current.currentTime - startTime;
          const progressValue = Math.min((elapsed / audioBuffer.duration) * 100, 100);
          setProgress(progressValue);
          setCurrentTime(elapsed);
          
          if (progressValue < 100 && isPlaying) {
            requestAnimationFrame(updateProgress);
          } else if (progressValue >= 100) {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }
        };
        
        requestAnimationFrame(updateProgress);
      })
      .catch(error => {
        console.error('Error loading audio:', error);
        setError(`Error loading audio: ${error.message}`);
        
        // Fall back to oscillator for debugging
        console.log('Falling back to oscillator for demonstration');
        const oscillator = audioContextRef.current.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime); // A4 note
        oscillator.connect(masterGainNode);
        oscillator.start();
        setMasterSource(oscillator);
        setIsPlaying(true);
        
        // Set duration for test oscillator
        const testDuration = 10; // 10 seconds
        setDuration(testDuration);
        
        // Simulate progress for 10 seconds
        let startTime = audioContextRef.current.currentTime;
        
        const updateProgress = () => {
          if (!isPlaying) return;
          
          const elapsed = audioContextRef.current.currentTime - startTime;
          const progressValue = (elapsed / testDuration) * 100;
          setProgress(progressValue);
          setCurrentTime(elapsed);
          
          if (progressValue < 100) {
            requestAnimationFrame(updateProgress);
          } else {
            oscillator.stop();
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
          }
        };
        
        requestAnimationFrame(updateProgress);
      });
  };
  
  
  const togglePlay = () => {
    if (!audioContextRef.current) return;
    
    if (isPlaying) {      audioContextRef.current.suspend();
    } else {
      audioContextRef.current.resume();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  //  next track
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