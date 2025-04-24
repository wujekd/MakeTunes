import React from 'react';
import SubmissionItem from './SubmissionItem';

const Submissions = ({ onAddToFavorites }) => {
  
  const mockSubmissions = [
    { id: 1, title: 'Submission 1', author: 'User 1', audioUrl: '#' },
    { id: 2, title: 'Submission 2', author: 'User 2', audioUrl: '#' },
    { id: 3, title: 'Submission 3', author: 'User 3', audioUrl: '#' },
  ];

  return (
    <section className="submissions-section col-span-5 row-span-3">
      <h2 className="submissions-title">Submissions</h2>
      
      <div className="submissions-container">
        {mockSubmissions.map(submission => (
          <SubmissionItem 
            key={submission.id}
            submission={submission}
            onAddToFavorites={onAddToFavorites}
          />
        ))}
      </div>
    </section>
  );
};

export default Submissions; 