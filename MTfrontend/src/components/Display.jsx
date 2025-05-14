import React, { useState, useEffect } from 'react';
import './Display.css';
import { useAudio } from '../contexts/AudioContext';

const Display = () => {
    const { currentTime, duration } = useAudio();
    return (
        <section className="display-section col-span-2 row-span-1">
            <div className="digital-display">
                <div className="display-screen">
                    <div className="time-display">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Display;