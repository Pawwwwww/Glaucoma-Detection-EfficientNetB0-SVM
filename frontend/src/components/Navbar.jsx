import { Link, useLocation } from 'react-router-dom';
import { Eye } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="glass-nav">
      <div className="logo text-gradient">
        <Eye size={28} color="#60a5fa" />
        <span>GlauAI</span>
      </div>

      <div className="nav-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link
          to="/detect"
          className={`nav-link ${location.pathname === '/detect' ? 'active' : ''}`}
        >
          Check
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
