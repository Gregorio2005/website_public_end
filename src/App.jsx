import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Website from './pages/Website';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Website />} />
        {/* Si más adelante mueves el Login o Specs aquí, añade sus rutas aquí */}
      </Routes>
    </Router>
  );
}

export default App
