import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // Mock data - replace with actual API calls
  const [connections] = useState([
    { id: 1, name: 'Cecilia Payne', connections: 45, avatar: null },
    { id: 2, name: 'Curtis Fletcher', connections: 1320, avatar: null },
    { id: 3, name: 'Alice Stone', connections: 125, avatar: null },
    { id: 4, name: 'Darrell Barnes', connections: 456, avatar: null },
    { id: 5, name: 'Eugenia Moore', connections: 1200, avatar: null },
  ]);

  const [teams] = useState([
    { id: 1, name: 'React Developers', members: 72, role: 'DEVELOPER', icon: 'react', color: 'primary' },
    { id: 2, name: 'Support Team', members: 122, role: 'SUPPORT', icon: 'support', color: 'success' },
    { id: 3, name: 'UI Designers', members: 7, role: 'DESIGNER', icon: 'figma', color: 'info' },
    { id: 4, name: 'Vue.js Developers', members: 289, role: 'DEVELOPER', icon: 'vue', color: 'success' },
    { id: 5, name: 'Digital Marketing', members: 24, role: 'MARKETING', icon: 'twitter', color: 'warning' },
  ]);

  const [activityTimeline] = useState([
    {
      id: 1,
      title: 'Client Meeting',
      description: 'Project meeting with john @10:15am',
      date: 'Today',
      type: 'meeting',
      client: { name: 'Lester McCarthy (Client)', role: 'CEO of Infibeam', avatar: null },
    },
    {
      id: 2,
      title: 'Create a new project for client',
      description: 'Add files to new design folder',
      date: '2 Day Ago',
      type: 'project',
    },
    {
      id: 3,
      title: 'Shared 2 New Project Files',
      description: 'Sent by Mollie Dixon',
      date: '6 Day Ago',
      type: 'share',
      files: [
        { name: 'App Guidelines', type: 'PDF' },
        { name: 'Testing Results', type: 'DOC' },
      ],
    },
    {
      id: 4,
      title: 'Project status updated',
      description: 'Woocommerce iOS App Completed',
      date: '10 Day Ago',
      type: 'update',
    },
  ]);

  const [userTeams] = useState([
    { id: 1, name: 'Backend Developer', members: 126, icon: 'gear' },
    { id: 2, name: 'React Developer', members: 98, icon: 'react' },
  ]);

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
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getUserName = () => {
    return user?.name || 'John Doe';
  };

  const getUserEmail = () => {
    return user?.email || 'john.doe@example.com';
  };

  return (
    <div className="container-fluid py-4">
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">User Profile / Profile</h4>
        <button className="btn btn-link p-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
          </svg>
        </button>
      </div>

      {/* Profile Banner */}
      <div className="card shadow-sm mb-4 border-0" style={{ overflow: 'hidden' }}>
        <div
          className="position-relative"
          style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #43e97b 100%)',
            minHeight: '200px',
            padding: '2rem',
          }}
        >
          <div className="d-flex align-items-end position-relative" style={{ zIndex: 2 }}>
            {/* Profile Picture */}
            <div className="me-4">
              <div
                className="rounded-circle border border-4 border-white shadow"
                style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: getAvatarColor(getUserName()),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '3rem',
                  fontWeight: 'bold',
                }}
              >
                {getInitials(getUserName())}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-grow-1 text-white">
              <h3 className="mb-2 fw-bold">{getUserName()}</h3>
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                  </svg>
                  <span>UX Designer</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                  </svg>
                  <span>Vatican City</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                  <span>Joined April 2021</span>
                </div>
              </div>
            </div>

            {/* Connected Button */}
            <div>
              <button className="btn btn-primary d-flex align-items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1 1.65-2.547l.647-.647a4.018 4.018 0 0 1 2.547-1.65L11.45 2.12a4 4 0 1 1 5.657 5.657l-.789.789a1 1 0 0 1-1.414-1.414l.789-.789a2 2 0 1 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l-.79.79a4 4 0 0 1 5.657 0l.79-.79a1 1 0 0 1 1.414 1.414l-.79.79a4 4 0 0 1 0 5.657l-.79.79a1 1 0 0 1-1.414-1.414l.79-.79a2 2 0 0 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a2 2 0 0 0-2.828 2.828l.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l-.79.79a4 4 0 0 1 5.657 0z"/>
                </svg>
                Connected
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            Profile
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'teams' ? 'active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
              <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
              <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
            </svg>
            Teams
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
            </svg>
            Projects
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1 1.65-2.547l.647-.647a4.018 4.018 0 0 1 2.547-1.65L11.45 2.12a4 4 0 1 1 5.657 5.657l-.789.789a1 1 0 0 1-1.414-1.414l.789-.789a2 2 0 1 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l-.79.79a4 4 0 0 1 5.657 0z"/>
            </svg>
            Connections
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div className="row g-4">
          {/* ABOUT Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-4">ABOUT</h5>
                
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                    </svg>
                    <span className="text-muted">Full Name:</span>
                    <span className="fw-semibold">{getUserName()}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <span className="text-muted">Status:</span>
                    <span className="text-success fw-semibold">Active</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 3.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
                    </svg>
                    <span className="text-muted">Role:</span>
                    <span className="fw-semibold">Developer</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                    </svg>
                    <span className="text-muted">Country:</span>
                    <span className="fw-semibold">USA</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    </svg>
                    <span className="text-muted">Languages:</span>
                    <span className="fw-semibold">English</span>
                  </div>
                </div>

                <h6 className="fw-semibold mb-3">CONTACTS</h6>
                <div className="mb-4">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.65 12.5a.678.678 0 0 1-.58-.122L6.5 10.43a.678.678 0 0 1-.122-.58l.122-1.034a.678.678 0 0 0-.122-.58L4.654 6.328a.678.678 0 0 0-.58-.122l-1.034.122a.678.678 0 0 1-.58-.122z"/>
                    </svg>
                    <span className="text-muted">Contact:</span>
                    <span>(123) 456-7890</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    <span className="text-muted">Skype:</span>
                    <span>john.doe</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.501l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                    </svg>
                    <span className="text-muted">Email:</span>
                    <span>{getUserEmail()}</span>
                  </div>
                </div>

                <h6 className="fw-semibold mb-3">TEAMS</h6>
                <div>
                  {userTeams.map((team) => (
                    <div key={team.id} className="d-flex align-items-center gap-2 mb-2">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"/>
                        <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64.892-3.433.902-5.096 0-.272.18-.592.249-.904.214a9.9 9.9 0 0 0-.412.004c-.74.02-1.435.22-2.023.435l-.23.055c-.367.088-.564.5-.302.806l.169.213c.233.294.307.704.215 1.095l-.073.268c-.16.513-.5 1.003-.968 1.39a12.71 12.71 0 0 0 2.582 1.75l-.218.465a.873.873 0 0 1-.485.41l-.344.07c-1.17.234-1.23 1.4-.018 1.685l.003.001c.272.165.576.246.872.246l.088-.001a9.09 9.09 0 0 0 1.593-.25l.313-.11c.94-.33 1.88-.715 2.682-1.15l.12-.054c.312-.15.406-.533.227-.838l-.197-.325a.873.873 0 0 1 .117-1.008l1.002-1.005.022-.02a9.746 9.746 0 0 0 1.343-2.336z"/>
                      </svg>
                      <span>{team.name} ({team.members} Members)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline Card */}
          <div className="col-md-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title mb-4 d-flex align-items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M7.5 10.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L7.5 5.707V10.5z"/>
                  </svg>
                  Activity Timeline
                </h5>
                
                <div className="position-relative">
                  {activityTimeline.map((activity, index) => (
                    <div key={activity.id} className="d-flex mb-4">
                      <div className="d-flex flex-column align-items-center me-3">
                        <div
                          className="rounded-circle border border-2 border-primary"
                          style={{
                            width: '12px',
                            height: '12px',
                            backgroundColor: 'white',
                            zIndex: 2,
                          }}
                        />
                        {index < activityTimeline.length - 1 && (
                          <div
                            className="position-absolute"
                            style={{
                              width: '2px',
                              height: '60px',
                              backgroundColor: '#dee2e6',
                              left: '5px',
                              top: '12px',
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-grow-1">
                        <div className="fw-semibold mb-1">{activity.title}</div>
                        <div className="text-muted small mb-1">{activity.description}</div>
                        {activity.client && (
                          <div className="d-flex align-items-center gap-2 mt-2 mb-2">
                            <div
                              className="rounded-circle"
                              style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: getAvatarColor(activity.client.name),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                              }}
                            >
                              {getInitials(activity.client.name)}
                            </div>
                            <div>
                              <div className="small fw-semibold">{activity.client.name}</div>
                              <div className="small text-muted">{activity.client.role}</div>
                            </div>
                          </div>
                        )}
                        {activity.files && (
                          <div className="d-flex gap-2 mt-2">
                            {activity.files.map((file, idx) => (
                              <div key={idx} className="d-flex align-items-center gap-1 border rounded p-2">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                                </svg>
                                <span className="small">{file.name} ({file.type})</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-muted small">{activity.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* OVERVIEW Card */}
          <div className="col-md-4">
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">OVERVIEW</h5>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-success">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    <div>
                      <div className="fw-semibold">Task Compiled</div>
                      <div className="text-muted small">13.5k</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-warning">
                      <path d="M2.866 14.85c-.078.444.36.791.746.593l4.39-2.256 4.389 2.256c.386.198.824-.149.746-.592l-.83-4.73 3.522-3.356c.33-.314.16-.888-.282-.95l-4.898-.696L8.465.792a.513.513 0 0 0-.927 0L5.354 3.12l-4.898.696c-.441.062-.612.636-.283.95l3.523 3.356-.83 4.73zm4.905-2.767-3.686 1.894.694-3.957a.565.565 0 0 0-.163-.505L1.71 6.745l4.052-.576a.525.525 0 0 0 .393-.288L8 2.223l1.847 3.658a.525.525 0 0 0 .393.288l4.052.575-2.906 2.77a.565.565 0 0 0-.163.506l.694 3.957-3.686-1.894a.503.503 0 0 0-.461 0z"/>
                    </svg>
                    <div>
                      <div className="fw-semibold">Projects Compiled</div>
                      <div className="text-muted small">146</div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-primary">
                      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1 1.65-2.547l.647-.647a4.018 4.018 0 0 1 2.547-1.65L11.45 2.12a4 4 0 1 1 5.657 5.657l-.789.789a1 1 0 0 1-1.414-1.414l.789-.789a2 2 0 1 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l-.79.79a4 4 0 0 1 5.657 0z"/>
                    </svg>
                    <div>
                      <div className="fw-semibold">Connections</div>
                      <div className="text-muted small">897</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connections Card */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Connections</h5>
                  <button className="btn btn-link p-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                    </svg>
                  </button>
                </div>
                <div className="list-group list-group-flush">
                  {connections.map((connection) => (
                    <div key={connection.id} className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-2">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle"
                          style={{
                            width: '32px',
                            height: '32px',
                            backgroundColor: getAvatarColor(connection.name),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          {getInitials(connection.name)}
                        </div>
                        <div>
                          <div className="small fw-semibold">{connection.name}</div>
                          <div className="small text-muted">{connection.connections} Connections</div>
                        </div>
                      </div>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-muted">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                      </svg>
                    </div>
                  ))}
                </div>
                <a href="#" className="text-decoration-none small">View all connections</a>
              </div>
            </div>

            {/* Teams Card */}
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="card-title mb-0">Teams</h5>
                  <button className="btn btn-link p-0">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                    </svg>
                  </button>
                </div>
                <div className="list-group list-group-flush">
                  {teams.map((team) => (
                    <div key={team.id} className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-2">
                      <div className="d-flex align-items-center gap-2">
                        <div className={`bg-${team.color} text-white rounded-circle d-flex align-items-center justify-content-center`} style={{ width: '32px', height: '32px' }}>
                          {team.icon === 'react' && <span className="fw-bold">R</span>}
                          {team.icon === 'support' && <span className="fw-bold">S</span>}
                          {team.icon === 'figma' && <span className="fw-bold">F</span>}
                          {team.icon === 'vue' && <span className="fw-bold">V</span>}
                          {team.icon === 'twitter' && <span className="fw-bold">T</span>}
                        </div>
                        <div>
                          <div className="small fw-semibold">{team.name}</div>
                          <div className="small text-muted">{team.members} Members</div>
                        </div>
                      </div>
                      <span className={`badge bg-${team.color === 'primary' ? 'primary' : team.color === 'success' ? 'success' : team.color === 'info' ? 'info' : 'warning'}`}>
                        {team.role}
                      </span>
                    </div>
                  ))}
                </div>
                <a href="#" className="text-decoration-none small">View all teams</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects List Section */}
      {activeTab === 'profile' && (
        <div className="card shadow-sm mt-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="card-title mb-0">Projects List</h5>
              <div className="d-flex align-items-center gap-3">
                <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                  <option>Show 7</option>
                  <option>Show 10</option>
                  <option>Show 25</option>
                </select>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search: Search Project"
                  style={{ width: '200px' }}
                />
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="text-uppercase small fw-semibold text-muted">PROJECT</th>
                    <th className="text-uppercase small fw-semibold text-muted">TOTAL TASK</th>
                    <th className="text-uppercase small fw-semibold text-muted">PROGRESS</th>
                    <th className="text-uppercase small fw-semibold text-muted">HOURS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="4" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <p className="text-muted small mb-0">Showing 0 to 0 of 0 entries</p>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-secondary" disabled>Previous</button>
                <button className="btn btn-sm btn-outline-secondary" disabled>Next</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Teams Tab Content */}
      {activeTab === 'teams' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Teams</h5>
            <p className="text-muted">Teams content coming soon...</p>
          </div>
        </div>
      )}

      {/* Projects Tab Content */}
      {activeTab === 'projects' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Projects</h5>
            <p className="text-muted">Projects content coming soon...</p>
          </div>
        </div>
      )}

      {/* Connections Tab Content */}
      {activeTab === 'connections' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="card-title">Connections</h5>
            <p className="text-muted">Connections content coming soon...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
