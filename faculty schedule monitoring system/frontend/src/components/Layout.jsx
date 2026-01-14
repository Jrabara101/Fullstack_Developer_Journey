import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import { useAuth } from '../contexts/AuthContext';

const Layout = ({ children }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [showDashboardDropdown, setShowDashboardDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDashboardDropdown(false);
      }
    };

    if (showDashboardDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDashboardDropdown]);

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
              <li 
                className="nav-item dropdown" 
                ref={dropdownRef}
                onMouseEnter={() => setShowDashboardDropdown(true)}
                onMouseLeave={() => setShowDashboardDropdown(false)}
              >
                <Link 
                  to="/" 
                  className="nav-link dropdown-toggle"
                  id="dashboardDropdown"
                  role="button"
                  aria-expanded={showDashboardDropdown}
                >
                  Dashboard
                </Link>
                {showDashboardDropdown && (
                  <ul 
                    className="dropdown-menu show position-absolute shadow-lg border-0"
                    aria-labelledby="dashboardDropdown"
                    style={{ 
                      minWidth: '220px', 
                      borderRadius: '8px',
                      marginTop: '8px',
                      backgroundColor: '#fff'
                    }}
                  >
                    <li>
                      <Link 
                        to="/analytics" 
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setShowDashboardDropdown(false)}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L10 22L18 17" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L10 17L18 12" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <div className="fw-semibold">Analytics Dashboard</div>
                          <small className="text-muted">Admin view</small>
                        </div>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/academy" 
                        className="dropdown-item d-flex align-items-center gap-2"
                        onClick={() => setShowDashboardDropdown(false)}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2L2 7L10 12L18 7L10 2Z" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L10 22L18 17" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L10 17L18 12" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div>
                          <div className="fw-semibold">Academy Dashboard</div>
                          <small className="text-muted">Faculty view</small>
                        </div>
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              {isAdmin && (
                <li className="nav-item">
                  <Link to="/faculty-portal" className="nav-link">
                    Faculty Portal
                  </Link>
                </li>
              )}
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
