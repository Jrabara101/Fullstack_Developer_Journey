import { Link } from 'react-router-dom';
import UserDropdown from './UserDropdown';

const Layout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
        <div className="container-fluid">
          <Link to="/" className="navbar-brand fw-bold">
            Faculty Schedule Monitor
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/schedule" className="nav-link">
                  Schedule
                </Link>
              </li>
              <li className="nav-item">
                <UserDropdown />
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <main className="container-fluid py-4 flex-grow-1">
        {children}
      </main>
    </div>
  );
};

export default Layout;
