import React from 'react';
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
            <style jsx>{`
                .digital-display {
                    background: #000;
                    padding: 1rem;
                    border-radius: 4px;
                    border: 2px solid #333;
                }
                .display-screen {
                    background: #1a1a1a;
                    padding: 0.5rem;
                    border-radius: 2px;
                }
                .time-display {
                    font-family: "Digital-7", monospace;
                    color: #00ff00;
                    font-size: 2rem;
                    text-align: center;
                    text-shadow: 0 0 5px #00ff00;
                }
            `}</style>
        </section>
    );
};

export default Display;