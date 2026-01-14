import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UpcomingNavigation from './UpcomingNavigation';

const AcademyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with actual API calls
  const [upcomingSchedules] = useState([
    { id: 1, title: 'CS 101 - Introduction to Programming', date: '2024-01-15', time: '9:00 AM - 10:30 AM', room: 'Room 201', type: 'class', mode: 'on-site' },
    { id: 2, title: 'CS 205 - Data Structures', date: '2024-01-15', time: '11:00 AM - 12:30 PM', room: 'Room 203', type: 'class', mode: 'on-site' },
    { id: 3, title: 'Office Hours', date: '2024-01-15', time: '3:00 PM - 5:00 PM', room: 'Office 305', type: 'office', mode: 'on-site' },
    { id: 4, title: 'CS 301 - Advanced Algorithms', date: '2024-01-16', time: '9:00 AM - 10:30 AM', room: 'Online (Zoom)', type: 'class', mode: 'online' },
  ]);

  const [meetings] = useState([
    { id: 1, title: 'Faculty Meeting', date: '2024-01-16', time: '2:00 PM - 3:00 PM', location: 'Conference Hall', type: 'meeting', participants: 15 },
    { id: 2, title: 'Department Review', date: '2024-01-18', time: '10:00 AM - 11:30 AM', location: 'Board Room', type: 'meeting', participants: 8 },
    { id: 3, title: 'Curriculum Planning', date: '2024-01-20', time: '1:00 PM - 2:30 PM', location: 'Online (Teams)', type: 'meeting', participants: 12 },
  ]);

  const [projects] = useState([
    { id: 1, title: 'Research Project: AI in Education', status: 'in-progress', deadline: '2024-03-15', progress: 65 },
    { id: 2, title: 'Course Material Development', status: 'in-progress', deadline: '2024-02-28', progress: 80 },
    { id: 3, title: 'Student Mentoring Program', status: 'planning', deadline: '2024-04-01', progress: 30 },
  ]);

  const [events] = useState([
    { id: 1, title: 'Science Fair 2024', date: '2024-01-25', time: '9:00 AM - 5:00 PM', location: 'Main Hall', type: 'event' },
    { id: 2, title: 'Guest Lecture Series', date: '2024-02-01', time: '3:00 PM - 5:00 PM', location: 'Auditorium', type: 'event' },
    { id: 3, title: 'Faculty Development Workshop', date: '2024-02-10', time: '10:00 AM - 4:00 PM', location: 'Training Center', type: 'event' },
  ]);

  const [holidays] = useState([
    { id: 1, title: 'New Year', date: '2024-01-01', type: 'holiday' },
    { id: 2, title: 'Martin Luther King Day', date: '2024-01-15', type: 'holiday' },
    { id: 3, title: 'Spring Break', date: '2024-03-18', type: 'holiday', duration: '7 days' },
  ]);

  const [classrooms] = useState([
    { id: 1, name: 'Room 201', capacity: 50, floor: 2, building: 'Main Building', status: 'available', equipment: ['Projector', 'Whiteboard', 'WiFi'] },
    { id: 2, name: 'Room 203', capacity: 40, floor: 2, building: 'Main Building', status: 'occupied', equipment: ['Projector', 'Whiteboard', 'WiFi', 'Smart Board'] },
    { id: 3, name: 'Room 301', capacity: 60, floor: 3, building: 'Main Building', status: 'available', equipment: ['Projector', 'Whiteboard', 'WiFi', 'Sound System'] },
    { id: 4, name: 'Lab 101', capacity: 30, floor: 1, building: 'Science Building', status: 'available', equipment: ['Computers', 'Projector', 'WiFi'] },
    { id: 5, name: 'Conference Hall', capacity: 100, floor: 1, building: 'Main Building', status: 'occupied', equipment: ['Projector', 'Sound System', 'WiFi', 'Stage'] },
  ]);

  const [sections] = useState([
    { id: 1, code: 'CS 101-A', course: 'Introduction to Programming', students: 45, schedule: 'Mon, Wed, Fri 9:00 AM', room: 'Room 201' },
    { id: 2, code: 'CS 205-B', course: 'Data Structures', students: 38, schedule: 'Mon, Wed, Fri 11:00 AM', room: 'Room 203' },
    { id: 3, code: 'CS 301-A', course: 'Advanced Algorithms', students: 32, schedule: 'Tue, Thu 9:00 AM', room: 'Online (Zoom)' },
  ]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    type: 'class',
    mode: 'on-site',
    date: '',
    time: '',
    duration: '90',
    room: '',
    description: '',
  });

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    // Handle schedule creation
    console.log('Schedule created:', scheduleForm);
    setShowScheduleModal(false);
    setScheduleForm({
      title: '',
      type: 'class',
      mode: 'on-site',
      date: '',
      time: '',
      duration: '90',
      room: '',
      description: '',
    });
  };

  const availableRooms = classrooms.filter(room => room.status === 'available');

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Academy Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user?.name || 'Faculty'}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setShowScheduleModal(true)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="me-2">
            <path d="M10 4V10M10 10V16M10 10H16M10 10H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Schedule Meeting/Class
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase small mb-2">Upcoming Classes</h6>
                  <h3 className="mb-0">{upcomingSchedules.filter(s => s.type === 'class').length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  📚
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase small mb-2">Meetings</h6>
                  <h3 className="mb-0">{meetings.length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  👥
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase small mb-2">Active Projects</h6>
                  <h3 className="mb-0">{projects.filter(p => p.status === 'in-progress').length}</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  📋
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase small mb-2">Assigned Sections</h6>
                  <h3 className="mb-0">{sections.length}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  📖
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'schedules' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedules')}
          >
            Schedules
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'meetings' ? 'active' : ''}`}
            onClick={() => setActiveTab('meetings')}
          >
            Meetings
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'projects' ? 'active' : ''}`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events & Holidays
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'classrooms' ? 'active' : ''}`}
            onClick={() => setActiveTab('classrooms')}
          >
            Classrooms & Sections
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <UpcomingNavigation 
                items={upcomingSchedules.map(s => ({ ...s, location: s.room, link: `/schedule/${s.id}` }))} 
                type="schedule" 
              />
            </div>
            <div className="col-lg-6">
              <UpcomingNavigation 
                items={meetings.map(m => ({ ...m, link: `/meetings/${m.id}` }))} 
                type="meeting" 
              />
            </div>
            <div className="col-lg-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">Active Projects</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {projects.map((project) => (
                      <div key={project.id} className="list-group-item border-0 border-bottom px-4 py-3">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="mb-0">{project.title}</h6>
                          <span className={`badge ${
                            project.status === 'in-progress' ? 'bg-warning' :
                            project.status === 'planning' ? 'bg-info' : 'bg-success'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="mb-2">
                          <div className="d-flex justify-content-between small text-muted mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <small className="text-muted">Deadline: {project.deadline}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <UpcomingNavigation 
                items={[...events.map(e => ({ ...e, link: `/events/${e.id}` })), ...holidays.map(h => ({ ...h, link: `/holidays/${h.id}` }))]} 
                type="event" 
              />
            </div>
          </div>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Room/Location</th>
                      <th>Mode</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingSchedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td>{schedule.title}</td>
                        <td>{schedule.date}</td>
                        <td>{schedule.time}</td>
                        <td>{schedule.room}</td>
                        <td>
                          <span className={`badge ${schedule.mode === 'online' ? 'bg-info' : 'bg-secondary'}`}>
                            {schedule.mode}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${schedule.type === 'class' ? 'bg-primary' : 'bg-info'}`}>
                            {schedule.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="list-group list-group-flush">
                {meetings.map((meeting) => (
                  <div key={meeting.id} className="list-group-item border-0 border-bottom px-0 py-3">
                    <div className="row align-items-center">
                      <div className="col-md-4">
                        <h6 className="mb-1">{meeting.title}</h6>
                        <small className="text-muted">Type: {meeting.type}</small>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Date</small>
                        <strong>{meeting.date}</strong>
                      </div>
                      <div className="col-md-2">
                        <small className="text-muted d-block">Time</small>
                        <strong>{meeting.time}</strong>
                      </div>
                      <div className="col-md-3">
                        <small className="text-muted d-block">Location</small>
                        <strong>{meeting.location}</strong>
                      </div>
                      <div className="col-md-1 text-end">
                        <span className="badge bg-info">{meeting.participants} 👥</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="row g-4">
                {projects.map((project) => (
                  <div key={project.id} className="col-md-6">
                    <div className="card border shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="mb-0">{project.title}</h5>
                          <span className={`badge ${
                            project.status === 'in-progress' ? 'bg-warning' :
                            project.status === 'planning' ? 'bg-info' : 'bg-success'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between small text-muted mb-2">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="progress" style={{ height: '12px' }}>
                            <div
                              className="progress-bar bg-primary"
                              role="progressbar"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">Deadline: {project.deadline}</small>
                          <button className="btn btn-sm btn-outline-primary">View Details</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">Upcoming Events</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {events.map((event) => (
                      <div key={event.id} className="list-group-item border-0 border-bottom px-4 py-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{event.title}</h6>
                            <p className="text-muted mb-1 small">
                              📅 {event.date} • 🕐 {event.time}
                            </p>
                            <p className="text-muted mb-0 small">📍 {event.location}</p>
                          </div>
                          <span className="badge bg-info">Event</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">Holidays</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {holidays.map((holiday) => (
                      <div key={holiday.id} className="list-group-item border-0 border-bottom px-4 py-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h6 className="mb-1">{holiday.title}</h6>
                            <p className="text-muted mb-0 small">
                              📅 {holiday.date}
                              {holiday.duration && ` • Duration: ${holiday.duration}`}
                            </p>
                          </div>
                          <span className="badge bg-warning">Holiday</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Classrooms & Sections Tab */}
        {activeTab === 'classrooms' && (
          <div className="row g-4">
            <div className="col-lg-7">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">Available Classrooms</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {classrooms.map((room) => (
                      <div key={room.id} className="list-group-item border-0 border-bottom px-4 py-3">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-2">
                              <h6 className="mb-0">{room.name}</h6>
                              <span className={`badge ${
                                room.status === 'available' ? 'bg-success' : 'bg-danger'
                              }`}>
                                {room.status}
                              </span>
                            </div>
                            <p className="text-muted mb-1 small">
                              📍 {room.building} • Floor {room.floor} • Capacity: {room.capacity} students
                            </p>
                            <div className="d-flex flex-wrap gap-2">
                              {room.equipment.map((eq, idx) => (
                                <span key={idx} className="badge bg-secondary">{eq}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-bottom">
                  <h5 className="mb-0">My Assigned Sections</h5>
                </div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    {sections.map((section) => (
                      <div key={section.id} className="list-group-item border-0 border-bottom px-4 py-3">
                        <h6 className="mb-2">{section.code}</h6>
                        <p className="text-muted mb-1 small">{section.course}</p>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <span className="badge bg-info">{section.students} students</span>
                          <small className="text-muted">{section.schedule}</small>
                        </div>
                        <p className="text-muted mb-0 small mt-2">📍 {section.room}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Schedule Meeting/Class</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowScheduleModal(false)}
                ></button>
              </div>
              <form onSubmit={handleScheduleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={scheduleForm.type}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value })}
                      required
                    >
                      <option value="class">Class</option>
                      <option value="meeting">Meeting</option>
                      <option value="office">Office Hours</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mode</label>
                    <select
                      className="form-select"
                      value={scheduleForm.mode}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, mode: e.target.value })}
                      required
                    >
                      <option value="on-site">On-Site</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={scheduleForm.date}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-control"
                        value={scheduleForm.time}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Duration (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={scheduleForm.duration}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
                      required
                    />
                  </div>
                  {scheduleForm.mode === 'on-site' && (
                    <div className="mb-3">
                      <label className="form-label">Room</label>
                      <select
                        className="form-select"
                        value={scheduleForm.room}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                        required
                      >
                        <option value="">Select a room</option>
                        {availableRooms.map((room) => (
                          <option key={room.id} value={room.name}>
                            {room.name} - {room.building} (Capacity: {room.capacity})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {scheduleForm.mode === 'online' && (
                    <div className="mb-3">
                      <label className="form-label">Meeting Link / Platform</label>
                      <input
                        type="text"
                        className="form-control"
                        value={scheduleForm.room}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                        placeholder="Zoom, Teams, or Meeting Link"
                        required
                      />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={scheduleForm.description}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowScheduleModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Schedule
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademyDashboard;

