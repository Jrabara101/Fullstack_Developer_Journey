import { useState } from 'react';
import { Link } from 'react-router-dom';

const UpcomingNavigation = ({ items, type = 'schedule' }) => {
  const [filter, setFilter] = useState('all');

  const filteredItems = filter === 'all' 
    ? items 
    : items.filter(item => item.type === filter);

  const getTypeIcon = (itemType) => {
    switch (itemType) {
      case 'class':
        return '📚';
      case 'meeting':
        return '👥';
      case 'event':
        return '🎉';
      case 'office':
        return '💼';
      default:
        return '📅';
    }
  };

  const getTypeColor = (itemType) => {
    switch (itemType) {
      case 'class':
        return 'primary';
      case 'meeting':
        return 'success';
      case 'event':
        return 'info';
      case 'office':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-header bg-white border-bottom">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            Upcoming {type === 'schedule' ? 'Schedules' : type === 'meeting' ? 'Meetings' : 'Events'}
          </h5>
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {type === 'schedule' && (
              <>
                <button
                  type="button"
                  className={`btn ${filter === 'class' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('class')}
                >
                  Classes
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'meeting' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('meeting')}
                >
                  Meetings
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'office' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('office')}
                >
                  Office Hours
                </button>
              </>
            )}
            {type === 'event' && (
              <>
                <button
                  type="button"
                  className={`btn ${filter === 'event' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('event')}
                >
                  Events
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'holiday' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setFilter('holiday')}
                >
                  Holidays
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="card-body p-0">
        {filteredItems.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted">No upcoming items found</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                to={item.link || '#'}
                className="list-group-item list-group-item-action border-0 border-bottom px-4 py-3"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="d-flex align-items-start gap-3">
                  <div
                    className={`bg-${getTypeColor(item.type)} bg-opacity-10 rounded-circle p-2 flex-shrink-0`}
                    style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}
                  >
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-0">{item.title}</h6>
                      <span className={`badge bg-${getTypeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-muted mb-2 small">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="me-1">
                        <path d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14Z" fill="currentColor"/>
                        <path d="M8 4V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      {item.date}{item.time && ` • ${item.time}`}{item.duration && ` • Duration: ${item.duration}`}
                    </p>
                    {item.location && (
                      <p className="text-muted mb-0 small">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="me-1">
                          <path d="M8 0C4.13401 0 1 3.13401 1 7C1 12 8 16 8 16C8 16 15 12 15 7C15 3.13401 11.866 0 8 0ZM8 9.5C6.067 9.5 4.5 7.933 4.5 6C4.5 4.067 6.067 2.5 8 2.5C9.933 2.5 11.5 4.067 11.5 6C11.5 7.933 9.933 9.5 8 9.5Z" fill="currentColor"/>
                        </svg>
                        {item.location}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-muted mb-0 small mt-1">{item.description}</p>
                    )}
                    {item.mode && (
                      <span className={`badge ${item.mode === 'online' ? 'bg-info' : 'bg-secondary'} mt-2`}>
                        {item.mode}
                      </span>
                    )}
                    {item.participants && (
                      <span className="badge bg-info mt-2 ms-2">
                        {item.participants} participants
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      {filteredItems.length > 0 && (
        <div className="card-footer bg-white border-top">
          <Link to={type === 'schedule' ? '/schedules' : type === 'meeting' ? '/meetings' : '/events'} className="btn btn-sm btn-link text-decoration-none w-100">
            View All {type === 'schedule' ? 'Schedules' : type === 'meeting' ? 'Meetings' : 'Events'} →
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingNavigation;

