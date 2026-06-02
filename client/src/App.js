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
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute

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
          {/* Protected Routes */}
          <ProtectedRoute path="/forge" element={<Forge />} />
          <ProtectedRoute path="/fuel" element={<Fuel />} />
          <ProtectedRoute path="/progress" element={<Progress />} />
          <ProtectedRoute path="/logs" element={<Logs />} />
          <ProtectedRoute path="/ai-dietician" element={<AIDietician />} />
          <ProtectedRoute path="/ai-workout" element={<AIWorkout />} />
          <ProtectedRoute path="/supplements" element={<Supplements />} />
          <ProtectedRoute path="/leaderboards" element={<Leaderboards />} />
          <ProtectedRoute path="/challenges" element={<Challenges />} />
          <ProtectedRoute path="/reels" element={<ProgressReels />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
