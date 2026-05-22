import React, { useContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Auth from './components/Auth';
import Home from './components/Home';
import Forge from './components/Forge';
import Fuel from './components/Fuel';
import Progress from './components/Progress';
import Logs from './components/Logs';

export default function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <nav style={{ padding: 10 }}>
        <Link to="/">Home</Link> | <Link to="/forge">Forge</Link> | <Link to="/fuel">Fuel</Link> | <Link to="/progress">Progress</Link> | <Link to="/logs">Logs</Link>
        {user ? (<span style={{ marginLeft: 12 }}>Signed in: <strong>{user.name}</strong> <button onClick={logout} style={{ marginLeft: 8 }}>Sign out</button></span>) : (<Link to="/auth" style={{ marginLeft: 12 }}>Sign in</Link>)}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/forge" element={<Forge />} />
        <Route path="/fuel" element={<Fuel />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/logs" element={<Logs />} />
      </Routes>
    </BrowserRouter>
  );
}
