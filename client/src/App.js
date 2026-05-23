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

export default function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forge" element={<Forge />} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/logs" element={<Logs />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
