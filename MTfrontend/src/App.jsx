import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Projects from './components/Projects';
import VotingView from './views/VotingView';
import HomeView from './views/HomeView';
import ProjectDetailView from './views/ProjectDetailView';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId/manage" element={<ProjectDetailView />} />
        <Route path="/projects/:projectId" element={<VotingView />} />
        <Route path="/" element={<HomeView />} />
      </Routes>
    </Router>
  );
}


export default App;