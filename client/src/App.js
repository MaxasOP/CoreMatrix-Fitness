import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Auth from './components/Auth';
import Home from './components/Home';
import Forge from './components/Forge';
import Fuel from './components/Fuel';
import Progress from './components/Progress';
import Logs from './components/Logs';
import Layout from './components/Layout';
import Setup from './components/Setup';

// Import the new Super App features (Assuming they are in a 'pages' folder)
import AIDietician from './pages/AIDietician';
import AIWorkout from './pages/AIWorkout';
import Supplements from './pages/Supplements';
import Leaderboards from './pages/Leaderboards';
import Challenges from './pages/Challenges';
import ProgressReels from './pages/ProgressReels';

export default function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/ai-dietician" element={<AIDietician />} />
          <Route path="/ai-workout" element={<AIWorkout />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/leaderboards" element={<Leaderboards />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/reels" element={<ProgressReels />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
