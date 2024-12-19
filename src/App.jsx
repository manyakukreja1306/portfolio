import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import OtherPage from './components/OtherPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> {/* Home page with About, Projects, etc. */}
        <Route path="/other" element={<OtherPage />} /> {/* Standalone other page */}
      </Routes>
    </Router>
  );
}

export default App;
