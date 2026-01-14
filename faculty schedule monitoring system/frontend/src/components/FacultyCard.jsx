import { Link } from 'react-router-dom';

const FacultyCard = ({ faculty, onClick }) => {
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

  const getStatusColor = (attendance) => {
    if (attendance >= 95) return 'success';
    if (attendance >= 85) return 'warning';
    return 'danger';
  };

  return (
    <div 
      className="card border-0 shadow-sm h-100 faculty-card"
      style={{ transition: 'transform 0.2s, box-shadow 0.2s', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
      onClick={onClick}
    >
      <div className="card-body text-center p-4">
        <div className="mb-3">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center text-white fw-bold mx-auto"
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: getAvatarColor(faculty.name),
              fontSize: '1.5rem',
            }}
          >
            {getInitials(faculty.name)}
          </div>
        </div>
        <h5 className="mb-2">{faculty.name}</h5>
        <p className="text-muted small mb-3">{faculty.department}</p>
        
        <div className="d-flex flex-column gap-2">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Email:</span>
            <span className="small">{faculty.email}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Attendance:</span>
            <span className={`badge bg-${getStatusColor(faculty.attendance)}`}>
              {faculty.attendance}%
            </span>
          </div>
          {faculty.phone && (
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">Phone:</span>
              <span className="small">{faculty.phone}</span>
            </div>
          )}
          {faculty.office_location && (
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">Office:</span>
              <span className="small">{faculty.office_location}</span>
            </div>
          )}
          {faculty.totalClasses && (
            <div className="d-flex justify-content-between align-items-center">
              <span className="text-muted small">Classes:</span>
              <span className="badge bg-info">{faculty.totalClasses}</span>
            </div>
          )}
        </div>
        
        {faculty.status && (
          <div className="mt-3 pt-3 border-top">
            <span className={`badge ${
              faculty.status === 'active' ? 'bg-success' :
              faculty.status === 'on-leave' ? 'bg-warning' :
              'bg-secondary'
            }`}>
              {faculty.status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyCard;

