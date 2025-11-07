import { Link, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>🍽️ Restaurant POS</h1>
        </div>
        <nav className="navbar-links">
          <Link to="/admin" className={`nav-link ${isActive('/admin')}`}>
            👨‍💼 Admin
          </Link>
          <Link to="/cocina" className={`nav-link ${isActive('/cocina')}`}>
            👨‍🍳 Cocina
          </Link>
          <Link to="/mesero" className={`nav-link ${isActive('/mesero')}`}>
            🍴 Mesero
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
