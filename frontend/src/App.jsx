import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DetectionPage from './pages/DetectionPage';
import Navbar from './components/Navbar';
import './index.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/detect" element={<DetectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
