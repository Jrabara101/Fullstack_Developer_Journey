import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual API calls
  const [stats] = useState({
    totalFaculty: 45,
    activeSchedules: 120,
    todayClasses: 28,
    pendingRequests: 8,
  });

  const [attendanceData] = useState([
    { month: 'Jan', present: 85, absent: 5, late: 10 },
    { month: 'Feb', present: 90, absent: 3, late: 7 },
    { month: 'Mar', present: 88, absent: 4, late: 8 },
    { month: 'Apr', present: 92, absent: 2, late: 6 },
    { month: 'May', present: 89, absent: 4, late: 7 },
    { month: 'Jun', present: 91, absent: 3, late: 6 },
  ]);

  const [payrollData] = useState({
    totalPayroll: 245000,
    paid: 230000,
    pending: 15000,
  });

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      // Replace with actual API call
      const mockFaculties = [
        { id: 1, name: 'Dr. Sarah Johnson', department: 'Computer Science', email: 'sarah.j@university.edu', attendance: 95, salary: 8500, avatar: null },
        { id: 2, name: 'Prof. Michael Chen', department: 'Mathematics', email: 'michael.c@university.edu', attendance: 92, salary: 8200, avatar: null },
        { id: 3, name: 'Dr. Emily Rodriguez', department: 'Physics', email: 'emily.r@university.edu', attendance: 98, salary: 9000, avatar: null },
        { id: 4, name: 'Prof. David Kim', department: 'Chemistry', email: 'david.k@university.edu', attendance: 89, salary: 8000, avatar: null },
        { id: 5, name: 'Dr. Lisa Anderson', department: 'Biology', email: 'lisa.a@university.edu', attendance: 94, salary: 8600, avatar: null },
      ];
      setFaculties(mockFaculties);
      if (mockFaculties.length > 0) {
        setSelectedFaculty(mockFaculties[0]);
      }
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
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
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const activityTimeline = selectedFaculty ? [
    { id: 1, title: 'Class Scheduled', description: 'CS 101 - Introduction to Programming', time: '9:00 AM', date: 'Today', type: 'schedule' },
    { id: 2, title: 'Meeting Completed', description: 'Department meeting with faculty', time: '2:00 PM', date: 'Yesterday', type: 'meeting' },
    { id: 3, title: 'Assignment Graded', description: 'Graded 45 assignments for CS 101', time: '4:30 PM', date: '2 days ago', type: 'grade' },
    { id: 4, title: 'Office Hours', description: 'Conducted office hours with students', time: '1:00 PM', date: '3 days ago', type: 'office' },
  ] : [];

  const notifications = [
    { id: 1, message: '3 new schedule requests pending approval', type: 'warning', time: '5 min ago' },
    { id: 2, message: 'Dr. Sarah Johnson submitted attendance for last week', type: 'info', time: '15 min ago' },
    { id: 3, message: 'Payroll processed for 40 faculty members', type: 'success', time: '1 hour ago' },
    { id: 4, message: 'System maintenance scheduled for tonight', type: 'info', time: '2 hours ago' },
  ];

  const upcomingSchedules = selectedFaculty ? [
    { id: 1, title: 'CS 101 - Introduction to Programming', date: '2024-01-15', time: '9:00 AM - 10:30 AM', room: 'Room 201', type: 'class' },
    { id: 2, title: 'CS 205 - Data Structures', date: '2024-01-15', time: '11:00 AM - 12:30 PM', room: 'Room 203', type: 'class' },
    { id: 3, title: 'Faculty Meeting', date: '2024-01-16', time: '2:00 PM - 3:00 PM', room: 'Conference Hall', type: 'meeting' },
    { id: 4, title: 'Office Hours', date: '2024-01-15', time: '3:00 PM - 5:00 PM', room: 'Office 305', type: 'office' },
  ] : [];

  const maxAttendance = Math.max(...attendanceData.map(d => d.present + d.absent + d.late));

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Analytics Dashboard</h2>
          <p className="text-muted mb-0">Comprehensive overview of faculty performance and activities</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted text-uppercase small mb-2">Total Faculty</h6>
                  <h3 className="mb-0">{stats.totalFaculty}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#667eea"/>
                    <path d="M12 14C7.58172 14 4 16.7909 4 20.5V22H20V20.5C20 16.7909 16.4183 14 12 14Z" fill="#667eea"/>
                  </svg>
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
                  <h6 className="text-muted text-uppercase small mb-2">Active Schedules</h6>
                  <h3 className="mb-0">{stats.activeSchedules}</h3>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="#10b981" strokeWidth="2"/>
                    <path d="M16 2V6M8 2V6M3 10H21" stroke="#10b981" strokeWidth="2"/>
                  </svg>
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
                  <h6 className="text-muted text-uppercase small mb-2">Today's Classes</h6>
                  <h3 className="mb-0">{stats.todayClasses}</h3>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#0dcaf0" strokeWidth="2"/>
                    <path d="M12 6V12L16 14" stroke="#0dcaf0" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
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
                  <h6 className="text-muted text-uppercase small mb-2">Pending Requests</h6>
                  <h3 className="mb-0 text-warning">{stats.pendingRequests}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#ffc107" strokeWidth="2"/>
                    <path d="M2 17L12 22L22 17" stroke="#ffc107" strokeWidth="2"/>
                    <path d="M2 12L12 17L22 12" stroke="#ffc107" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Faculty List */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Faculty Members</h5>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {faculties.map((faculty) => (
                    <button
                      key={faculty.id}
                      className={`list-group-item list-group-item-action border-0 ${
                        selectedFaculty?.id === faculty.id ? 'bg-primary bg-opacity-10' : ''
                      }`}
                      onClick={() => setSelectedFaculty(faculty)}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                          style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: getAvatarColor(faculty.name),
                            fontSize: '1rem',
                          }}
                        >
                          {getInitials(faculty.name)}
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{faculty.name}</h6>
                          <small className="text-muted">{faculty.department}</small>
                          <div className="mt-1">
                            <span className="badge bg-success">{faculty.attendance}% Attendance</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Faculty Details */}
        <div className="col-lg-8">
          {selectedFaculty ? (
            <>
              {/* Faculty Header */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center gap-4">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: getAvatarColor(selectedFaculty.name),
                        fontSize: '1.5rem',
                      }}
                    >
                      {getInitials(selectedFaculty.name)}
                    </div>
                    <div className="flex-grow-1">
                      <h4 className="mb-1">{selectedFaculty.name}</h4>
                      <p className="text-muted mb-2">{selectedFaculty.department}</p>
                      <div className="d-flex gap-3">
                        <span className="badge bg-primary">Email: {selectedFaculty.email}</span>
                        <span className="badge bg-success">Attendance: {selectedFaculty.attendance}%</span>
                        <span className="badge bg-info">Salary: ${selectedFaculty.salary.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <ul className="nav nav-tabs mb-4" role="tablist">
                <li className="nav-item" role="presentation">
                  <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#attendance" type="button">
                    Attendance
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" data-bs-toggle="tab" data-bs-target="#payroll" type="button">
                    Payroll
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" data-bs-toggle="tab" data-bs-target="#timeline" type="button">
                    Activity Timeline
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button className="nav-link" data-bs-toggle="tab" data-bs-target="#schedules" type="button">
                    Upcoming Schedules
                  </button>
                </li>
              </ul>

              <div className="tab-content">
                {/* Attendance Tab */}
                <div className="tab-pane fade show active" id="attendance" role="tabpanel">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-4">Attendance Progress</h5>
                      <div className="d-flex align-items-end gap-2" style={{ height: '200px' }}>
                        {attendanceData.map((data, index) => {
                          const total = data.present + data.absent + data.late;
                          const presentHeight = (data.present / maxAttendance) * 100;
                          const absentHeight = (data.absent / maxAttendance) * 100;
                          const lateHeight = (data.late / maxAttendance) * 100;
                          
                          return (
                            <div key={index} className="flex-grow-1 d-flex flex-column align-items-center">
                              <div className="d-flex align-items-end gap-1 w-100" style={{ height: '180px' }}>
                                <div
                                  className="bg-success rounded-top"
                                  style={{
                                    width: '100%',
                                    height: `${presentHeight}%`,
                                    minHeight: '4px',
                                  }}
                                  title={`Present: ${data.present}%`}
                                ></div>
                                <div
                                  className="bg-danger rounded-top"
                                  style={{
                                    width: '100%',
                                    height: `${absentHeight}%`,
                                    minHeight: '4px',
                                  }}
                                  title={`Absent: ${data.absent}%`}
                                ></div>
                                <div
                                  className="bg-warning rounded-top"
                                  style={{
                                    width: '100%',
                                    height: `${lateHeight}%`,
                                    minHeight: '4px',
                                  }}
                                  title={`Late: ${data.late}%`}
                                ></div>
                              </div>
                              <small className="mt-2 text-muted">{data.month}</small>
                            </div>
                          );
                        })}
                      </div>
                      <div className="d-flex justify-content-center gap-4 mt-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-success" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                          <small>Present</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-danger" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                          <small>Absent</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-warning" style={{ width: '16px', height: '16px', borderRadius: '4px' }}></div>
                          <small>Late</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payroll Tab */}
                <div className="tab-pane fade" id="payroll" role="tabpanel">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-4">Payroll Information</h5>
                      <div className="row g-4">
                        <div className="col-md-4">
                          <div className="text-center p-4 bg-primary bg-opacity-10 rounded">
                            <h6 className="text-muted mb-2">Total Payroll</h6>
                            <h3 className="mb-0">${payrollData.totalPayroll.toLocaleString()}</h3>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-4 bg-success bg-opacity-10 rounded">
                            <h6 className="text-muted mb-2">Paid</h6>
                            <h3 className="mb-0 text-success">${payrollData.paid.toLocaleString()}</h3>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="text-center p-4 bg-warning bg-opacity-10 rounded">
                            <h6 className="text-muted mb-2">Pending</h6>
                            <h3 className="mb-0 text-warning">${payrollData.pending.toLocaleString()}</h3>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="progress" style={{ height: '30px' }}>
                          <div
                            className="progress-bar bg-success"
                            role="progressbar"
                            style={{ width: `${(payrollData.paid / payrollData.totalPayroll) * 100}%` }}
                          >
                            {((payrollData.paid / payrollData.totalPayroll) * 100).toFixed(1)}%
                          </div>
                          <div
                            className="progress-bar bg-warning"
                            role="progressbar"
                            style={{ width: `${(payrollData.pending / payrollData.totalPayroll) * 100}%` }}
                          >
                            {((payrollData.pending / payrollData.totalPayroll) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Timeline Tab */}
                <div className="tab-pane fade" id="timeline" role="tabpanel">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-4">Activity Timeline</h5>
                      <div className="timeline">
                        {activityTimeline.map((activity, index) => (
                          <div key={activity.id} className="d-flex gap-3 mb-4">
                            <div className="flex-shrink-0">
                              <div
                                className="rounded-circle d-flex align-items-center justify-content-center text-white"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  backgroundColor: 
                                    activity.type === 'schedule' ? '#667eea' :
                                    activity.type === 'meeting' ? '#10b981' :
                                    activity.type === 'grade' ? '#f59e0b' : '#ec4899',
                                }}
                              >
                                {activity.type === 'schedule' ? '📅' : activity.type === 'meeting' ? '👥' : activity.type === 'grade' ? '✓' : '💼'}
                              </div>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{activity.title}</h6>
                              <p className="text-muted mb-1 small">{activity.description}</p>
                              <small className="text-muted">{activity.date} at {activity.time}</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upcoming Schedules Tab */}
                <div className="tab-pane fade" id="schedules" role="tabpanel">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="mb-4">Upcoming Schedules</h5>
                      <div className="list-group list-group-flush">
                        {upcomingSchedules.map((schedule) => (
                          <div key={schedule.id} className="list-group-item border-0 border-bottom px-0 py-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{schedule.title}</h6>
                                <p className="text-muted mb-1 small">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="me-1">
                                    <path d="M8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0ZM8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14Z" fill="currentColor"/>
                                    <path d="M8 4V8L11 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                  {schedule.date} • {schedule.time}
                                </p>
                                <p className="text-muted mb-0 small">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="me-1">
                                    <path d="M2 3H14C14.5523 3 15 3.44772 15 4V12C15 12.5523 14.5523 13 14 13H2C1.44772 13 1 12.5523 1 12V4C1 3.44772 1.44772 3 2 3Z" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M1 6H15" stroke="currentColor" strokeWidth="1.5"/>
                                  </svg>
                                  {schedule.room}
                                </p>
                              </div>
                              <span className={`badge ${
                                schedule.type === 'class' ? 'bg-primary' :
                                schedule.type === 'meeting' ? 'bg-success' : 'bg-info'
                              }`}>
                                {schedule.type}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center py-5">
                <p className="text-muted">Select a faculty member to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <h5 className="mb-0">Notifications</h5>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                {notifications.map((notif) => (
                  <div key={notif.id} className="list-group-item border-0 border-bottom px-0 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className={`bg-${notif.type} bg-opacity-10 rounded-circle p-2`}>
                        {notif.type === 'warning' ? '⚠️' : notif.type === 'success' ? '✓' : 'ℹ️'}
                      </div>
                      <div className="flex-grow-1">
                        <p className="mb-0">{notif.message}</p>
                        <small className="text-muted">{notif.time}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

