import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Projects from './components/Projects';
import ProjectView from './views/ProjectView';
import HomeView from './views/HomeView';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:projectId" element={<ProjectView />} />
        <Route path="/" element={<HomeView />} />
      </Routes>
    </Router>
  );
}


export default App;