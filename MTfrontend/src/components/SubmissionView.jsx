import React from 'react';
import Mixer from './Mixer';
import InfoTop from './InfoTop';
import Upload from './Upload';
import Submissions from './Submissions';
import { AudioProvider } from '../contexts/AudioContext';

const SubmissionView = ({ project }) => {
    return (
        <AudioProvider>
            <main className='grid grid-cols-7 grid-rows-5 h-screen w-screen'>
                <InfoTop project={project} />
                <Upload />
                <Mixer />
                <Submissions />
            </main>
        </AudioProvider>
    );
};

export default SubmissionView; 