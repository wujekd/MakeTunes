import React from 'react';
import './InfoTop.css';
import Display from './Display';

const InfoTop = () => {
  return (
    <section className='info-section col-span-7 row-span-2'>
      <div className='w-2/3 flex flex-col gap-3'>
        <h3>Project Title</h3>
        <p>Votes: 0</p>
        <h3 className="text-gray-500 text-xl">Author</h3>
      </div>
      <Display />
    </section>
  );
};

export default InfoTop;