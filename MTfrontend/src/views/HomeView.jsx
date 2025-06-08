import React from 'react';
import UserProjects from '../components/UserProjects';
import UserVotings from '../components/UserVotings';
import './HomeView.css';

const HomeView = () => {
  return (
    <main className="home-view">
      <header className="home-header">
        <h1 className="home-title">Welcome to MakeTunes</h1>
      </header>
      
      <div className="home-content">
        <div className="home-section">
          <UserProjects />
        </div>
        <div className="home-section">
          <UserVotings />
        </div>
      </div>
    </main>
  );
};

export default HomeView; 