import React from 'react';
import { useAudio } from '../contexts/AudioContext';

const Mixer = ({ submissions }) => {
    const { 
        isPlaying, 
        masterVolume, 
        backingVolume, 
        togglePlay, 
        setMasterVolume, 
        setBackingVolume,
        nextTrack,
        previousTrack
    } = useAudio();

    const handleBackingVolumeChange = (e) => {
        setBackingVolume(parseFloat(e.target.value));
        console.log(backingVolume);
    }

    const handleMasterVolumeChange = (e) => {
        setMasterVolume(parseFloat(e.target.value));
    }

    const handlePrevTrack = () => {
        previousTrack(submissions);
    }

    const handleNextTrack = () => {
        nextTrack(submissions);
    }

    return (
        <section className='mixer-section col-span-2 row-span-3' id='mixer'>
            <audio src="#" className='hidden-audio' id="backing-player"></audio>
            <audio src="" className='hidden-audio' id="master-player"></audio>

            <div className="transport">
                <button id="back-btn" onClick={handlePrevTrack}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                        <path d="M4 12H20M4 12L8 8M4 12L8 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
                <button id="play-btn" onClick={togglePlay}>
                    {isPlaying ? (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="#ffffff">
                            <rect x="6" y="4" width="4" height="16" rx="1" fill="#ffffff"/>
                            <rect x="14" y="4" width="4" height="16" rx="1" fill="#ffffff"/>
                        </svg>
                    ) : (
                        <svg width="17" height="17" viewBox="-3 0 28 28" fill="#ffffff">
                            <path d="M21.4,13.5L4.4,1.3C3.3,0.7,2,0.8,2,2.9v20.1c0,2,1.4,2.3,2.4,1.6l17-12.2C22.2,11.6,22.2,14.3,21.4,13.5"/>
                        </svg>
                    )}
                </button>
                <button id="fwd-btn" onClick={handleNextTrack}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff" transform="rotate(180)">
                        <path d="M4 12H20M4 12L8 8M4 12L8 16" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                    </svg>
                </button>
            </div>

            {/* BACKING CHANNEL */}
            <div className='channel'>
                {/* Volume level indicator */}
                <div className="volume-indicator"></div>
                
                <span className="channel-label">Backing</span>
                <input 
                    type="range"
                    className="vertical-slider"
                    id="backing-volume" 
                    min="0" 
                    max="1"
                    onChange={handleBackingVolumeChange}
                    value={backingVolume} 
                    step="0.01"
                />
            </div>

            {/* MASTER CHANNEL */}
            <div className='channel'>
                {/* Volume level indicator */}
                <div className="volume-indicator"></div>
                
                <span className="channel-label">Master</span>
                <input 
                    type="range"
                    className="vertical-slider"
                    id="master-volume" 
                    min="0" 
                    max="1"
                    onChange={handleMasterVolumeChange}
                    value={masterVolume} 
                    step="0.01"
                />
            </div>
        </section>
    );
};

export default Mixer; 