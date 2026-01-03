import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const UserDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#667eea';
    const colors = [
      '#667eea',
      '#764ba2',
      '#f093fb',
      '#4facfe',
      '#00f2fe',
      '#43e97b',
      '#fa709a',
      '#fee140',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="dropdown" ref={dropdownRef}>
      <button
        className="btn btn-link text-white text-decoration-none d-flex align-items-center gap-2"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="position-relative">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: getAvatarColor(user?.name),
              fontSize: '0.875rem',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            {getInitials(user?.name)}
          </div>
          <span
            className="position-absolute bottom-0 end-0 rounded-circle border border-white"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: '#10b981'
            }}
          ></span>
        </div>
        <span className="d-none d-md-inline">{user?.name || 'User'}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={isOpen ? 'rotate-180' : ''}
          style={{ transition: 'transform 0.2s' }}
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="dropdown-menu show position-absolute end-0 mt-2 shadow-lg border-0"
          style={{ minWidth: '280px', borderRadius: '12px' }}
        >
          <div className="px-3 py-3 d-flex align-items-center gap-3">
            <div className="position-relative">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: getAvatarColor(user?.name),
                  fontSize: '1.125rem',
                  border: '2px solid #e5e7eb'
                }}
              >
                {getInitials(user?.name)}
              </div>
              <span
                className="position-absolute bottom-0 end-0 rounded-circle border border-white"
                style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: '#10b981'
                }}
              ></span>
            </div>
            <div className="flex-grow-1">
              <div className="fw-semibold text-dark">{user?.name || 'User'}</div>
              <div className="small text-muted">{user?.role === 'admin' ? 'Admin' : 'User'}</div>
            </div>
          </div>

          <hr className="dropdown-divider my-0" />

          <div className="py-2">
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z"
                  fill="currentColor"
                />
                <path
                  d="M10 12C5.58172 12 2 13.7909 2 16V20H18V16C18 13.7909 14.4183 12 10 12Z"
                  fill="currentColor"
                />
              </svg>
              <span>My Profile</span>
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => { setIsOpen(false); navigate('/settings'); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 12C11.1046 12 12 11.1046 12 10C12 8.89543 11.1046 8 10 8C8.89543 8 8 8.89543 8 10C8 11.1046 8.89543 12 10 12Z"
                  fill="currentColor"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10 0L12.5 2.5L15.5 1.5L16.5 4.5L19.5 5.5L17 8L19.5 10.5L16.5 11.5L15.5 14.5L12.5 13.5L10 16L7.5 13.5L4.5 14.5L3.5 11.5L0.5 10.5L3 8L0.5 5.5L3.5 4.5L4.5 1.5L7.5 2.5L10 0ZM10 2L8 4L5 3L4 6L1 7L3 9L1 11L4 12L5 15L8 14L10 16L12 14L15 15L16 12L19 11L17 9L19 7L16 6L15 3L12 4L10 2Z"
                  fill="currentColor"
                />
              </svg>
              <span>Settings</span>
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2 justify-content-between"
              onClick={() => { setIsOpen(false); navigate('/billing'); }}
            >
              <div className="d-flex align-items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M18 4H2C0.9 4 0 4.9 0 6V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V6C20 4.9 19.1 4 18 4ZM18 14H2V8H18V14Z"
                    fill="currentColor"
                  />
                  <path
                    d="M4 10H6V12H4V10ZM8 10H16V12H8V10Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Billing</span>
              </div>
              <span className="badge bg-danger">4</span>
            </button>
          </div>

          <hr className="dropdown-divider my-0" />

          <div className="py-2">
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => { setIsOpen(false); navigate('/faq'); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M10 14V10M10 6H10.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>FAQ</span>
            </button>

            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => { setIsOpen(false); navigate('/pricing'); }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 0L12.5 6.5L20 7.5L15 12.5L16.5 20L10 16L3.5 20L5 12.5L0 7.5L7.5 6.5L10 0Z"
                  fill="currentColor"
                />
              </svg>
              <span>Pricing</span>
            </button>
          </div>

          <hr className="dropdown-divider my-0" />

          <div className="py-2">
            <button
              className="dropdown-item d-flex align-items-center gap-2 text-danger"
              onClick={handleLogout}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M10 6V10M10 10L13 7M10 10L7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
