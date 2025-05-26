import React from 'react';
import Mixer from '../components/Mixer';
import InfoTop from '../components/InfoTop';
import Upload from '../components/Upload';
import { AudioProvider } from '../contexts/AudioContext';

const SubmissionView = ({ project }) => {
    return (
        <AudioProvider>
            <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
                <InfoTop project={project} />
                <Upload />
                <Mixer />
            </main>
        </AudioProvider>
    );
};

export default SubmissionView; 