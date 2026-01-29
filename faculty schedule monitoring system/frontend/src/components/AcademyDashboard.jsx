import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import UpcomingNavigation from './UpcomingNavigation';
import FacultyCard from './FacultyCard';
import api from '../services/api';

const AcademyDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [facultyError, setFacultyError] = useState(null);
  const [facultySearch, setFacultySearch] = useState('');
  const [facultyDepartment, setFacultyDepartment] = useState('all');

  const [meetings] = useState([]);

  const [projects] = useState([]);

  const [events] = useState([]);

  const [holidays] = useState([]);

  const [classrooms, setClassrooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomError, setRoomError] = useState(null);

  const [sections] = useState([]);

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
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [requiresFacultyProfile, setRequiresFacultyProfile] = useState(false);
  const [facultyProfileForm, setFacultyProfileForm] = useState({
    name: '',
    email: '',
    department: '',
  });
  const [creatingFacultyProfile, setCreatingFacultyProfile] = useState(false);
  const [facultyProfileError, setFacultyProfileError] = useState(null);
  const [facultyProfileSuccess, setFacultyProfileSuccess] = useState(null);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({
    name: '',
    building: '',
    floor: '',
    capacity: '',
    status: 'available',
    equipment: [],
  });
  const [equipmentInput, setEquipmentInput] = useState('');
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [roomSubmitError, setRoomSubmitError] = useState(null);

  // Fetch schedules and rooms from API
  useEffect(() => {
    fetchSchedules();
    fetchRooms();
    fetchFaculties();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoadingSchedules(true);
      setScheduleError(null);
      const response = await api.get('/api/schedules');
      const schedules = response.data;
      
      // Transform backend schedule format to frontend format
      const transformedSchedules = schedules.map(schedule => {
        // Convert start_time and end_time to display format
        const startTime = new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        const endTime = new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        
        // Determine mode based on room
        const mode = schedule.room.toLowerCase().includes('online') || 
                     schedule.room.toLowerCase().includes('zoom') || 
                     schedule.room.toLowerCase().includes('teams') 
                     ? 'online' : 'on-site';

        // Determine type from course_name or notes
        let type = 'class';
        if (schedule.notes) {
          const notesLower = schedule.notes.toLowerCase();
          if (notesLower.includes('meeting')) type = 'meeting';
          else if (notesLower.includes('office')) type = 'office';
        }

        // Get next occurrence date for the day_of_week
        const today = new Date();
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = daysOfWeek.indexOf(schedule.day_of_week);
        const currentDay = today.getDay();
        let daysUntilTarget = (targetDay - currentDay + 7) % 7;
        if (daysUntilTarget === 0) daysUntilTarget = 7; // Next week if today
        const nextDate = new Date(today);
        nextDate.setDate(today.getDate() + daysUntilTarget);
        const dateStr = nextDate.toISOString().split('T')[0];

        return {
          id: schedule.id,
          title: schedule.course_name,
          date: dateStr,
          time: `${startTime} - ${endTime}`,
          room: schedule.room,
          type: type,
          mode: mode,
        };
      });
      
      setUpcomingSchedules(transformedSchedules);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      setScheduleError(error.response?.data?.message || 'Failed to fetch schedules');
    } finally {
      setLoadingSchedules(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoadingRooms(true);
      setRoomError(null);
      const response = await api.get('/api/rooms');
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRoomError(error.response?.data?.message || 'Failed to fetch rooms');
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchFaculties = async () => {
    try {
      setLoadingFaculty(true);
      setFacultyError(null);
      const response = await api.get('/api/faculties');
      setFacultyList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      setFacultyError(error.response?.data?.message || 'Failed to fetch faculties');
    } finally {
      setLoadingFaculty(false);
    }
  };

  const handleFacultyProfileSubmit = async (event) => {
    event.preventDefault();
    setCreatingFacultyProfile(true);
    setFacultyProfileError(null);
    setFacultyProfileSuccess(null);

    try {
      const payload = {
        user_id: user?.id ?? null,
        name: facultyProfileForm.name,
        email: facultyProfileForm.email,
        department: facultyProfileForm.department,
      };
      await api.post('/api/faculties', payload);
      setFacultyProfileSuccess('Faculty profile created. You can now schedule.');
      setRequiresFacultyProfile(false);
      setFacultyProfileForm({ name: '', email: '', department: '' });
      fetchFaculties();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.email?.[0] ||
        error.response?.data?.errors?.name?.[0] ||
        error.response?.data?.errors?.department?.[0] ||
        'Failed to create faculty profile. Please try again.';
      setFacultyProfileError(message);
    } finally {
      setCreatingFacultyProfile(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setSubmitError(null);
    setRequiresFacultyProfile(false);

    try {
      // Prepare data for API
      const scheduleData = {
        title: scheduleForm.title,
        type: scheduleForm.type,
        mode: scheduleForm.mode,
        date: scheduleForm.date,
        time: scheduleForm.time,
        duration: parseInt(scheduleForm.duration),
        room: scheduleForm.room,
        description: scheduleForm.description,
      };

      await api.post('/api/schedules', scheduleData);
      
      // Reset form and close modal
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

      // Refresh schedules list
      await fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      const responseMessage = error.response?.data?.message || '';
      if (error.response?.status === 404 && responseMessage.toLowerCase().includes('faculty')) {
        setRequiresFacultyProfile(true);
        setSubmitError('No faculty profile found for this account. Create one before scheduling.');
      } else {
        setSubmitError(
          responseMessage ||
          error.response?.data?.errors?.schedule_time?.[0] ||
          'Failed to create schedule. Please try again.'
        );
      }
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    setSubmittingRoom(true);
    setRoomSubmitError(null);

    try {
      const roomData = {
        name: roomForm.name,
        building: roomForm.building,
        floor: parseInt(roomForm.floor),
        capacity: parseInt(roomForm.capacity),
        status: roomForm.status,
        equipment: roomForm.equipment,
      };

      const response = await api.post('/api/rooms', roomData);
      const newRoom = response.data.room;
      
      // If Schedule Modal is open, automatically select the newly created room
      if (showScheduleModal && scheduleForm.mode === 'on-site') {
        setScheduleForm({ ...scheduleForm, room: newRoom.name });
      }
      
      // Reset form and close modal
      setShowRoomModal(false);
      setRoomForm({
        name: '',
        building: '',
        floor: '',
        capacity: '',
        status: 'available',
        equipment: [],
      });
      setEquipmentInput('');

      // Refresh rooms list
      await fetchRooms();
    } catch (error) {
      console.error('Error creating room:', error);
      setRoomSubmitError(
        error.response?.data?.message || 
        'Failed to create room. Please try again.'
      );
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleAddEquipment = () => {
    if (equipmentInput.trim()) {
      setRoomForm({
        ...roomForm,
        equipment: [...roomForm.equipment, equipmentInput.trim()],
      });
      setEquipmentInput('');
    }
  };

  const handleRemoveEquipment = (index) => {
    setRoomForm({
      ...roomForm,
      equipment: roomForm.equipment.filter((_, i) => i !== index),
    });
  };

  const availableRooms = classrooms.filter(room => room.status === 'available');
  const facultyDepartments = useMemo(() => {
    const departmentSet = new Set(
      facultyList
        .map((faculty) => faculty.department)
        .filter((department) => department && department.trim().length > 0),
    );
    return ['all', ...departmentSet];
  }, [facultyList]);

  const filteredFaculty = useMemo(() => {
    const normalizedSearch = facultySearch.trim().toLowerCase();
    return facultyList.filter((faculty) => {
      const name = faculty.name?.toLowerCase() || '';
      const email = faculty.email?.toLowerCase() || '';
      const department = faculty.department?.toLowerCase() || '';
      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        department.includes(normalizedSearch);
      const matchesDepartment = facultyDepartment === 'all' || faculty.department === facultyDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [facultyList, facultySearch, facultyDepartment]);

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Academy Dashboard</h2>
          <p className="text-muted mb-0">Welcome back, {user?.name || 'Faculty'}</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowScheduleModal(true);
            setSubmitError(null);
            setRequiresFacultyProfile(false);
          }}
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
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'faculty' ? 'active' : ''}`}
            onClick={() => setActiveTab('faculty')}
          >
            Faculty
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
                <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Available Classrooms</h5>
                  {user?.role === 'admin' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowRoomModal(true)}
                    >
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="me-1">
                        <path d="M10 4V10M10 10V16M10 10H16M10 10H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                      Add Room
                    </button>
                  )}
                </div>
                <div className="card-body p-0">
                  {loadingRooms ? (
                    <div className="text-center py-4">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : roomError ? (
                    <div className="alert alert-danger m-4" role="alert">
                      {roomError}
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {classrooms.length === 0 ? (
                        <div className="text-center py-4 text-muted">No rooms available</div>
                      ) : (
                        classrooms.map((room) => (
                          <div key={room.id} className="list-group-item border-0 border-bottom px-4 py-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <h6 className="mb-0">{room.name}</h6>
                                  <span className={`badge ${
                                    room.status === 'available' ? 'bg-success' :
                                    room.status === 'occupied' ? 'bg-warning' : 'bg-danger'
                                  }`}>
                                    {room.status}
                                  </span>
                                </div>
                                <p className="text-muted mb-1 small">
                                  📍 {room.building} • Floor {room.floor} • Capacity: {room.capacity} students
                                </p>
                                {room.equipment && room.equipment.length > 0 && (
                                  <div className="d-flex flex-wrap gap-2">
                                    {room.equipment.map((eq, idx) => (
                                      <span key={idx} className="badge bg-secondary">{eq}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
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

        {activeTab === 'faculty' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom">
              <div className="d-flex flex-column flex-lg-row gap-3 align-items-lg-center justify-content-between">
                <div>
                  <h5 className="mb-1">Faculty Directory</h5>
                  <p className="text-muted mb-0">Browse faculty profiles and departments</p>
                </div>
                <div className="d-flex flex-column flex-md-row gap-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search faculty..."
                    value={facultySearch}
                    onChange={(event) => setFacultySearch(event.target.value)}
                  />
                  <select
                    className="form-select"
                    value={facultyDepartment}
                    onChange={(event) => setFacultyDepartment(event.target.value)}
                  >
                    {facultyDepartments.map((department) => (
                      <option key={department} value={department}>
                        {department === 'all' ? 'All Departments' : department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loadingFaculty ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : facultyError ? (
                <div className="alert alert-danger" role="alert">
                  {facultyError}
                </div>
              ) : filteredFaculty.length === 0 ? (
                <div className="text-center text-muted py-4">No faculty profiles found.</div>
              ) : (
                <div className="row g-4">
                  {filteredFaculty.map((faculty) => (
                    <div key={faculty.id} className="col-md-6 col-lg-4 col-xl-3">
                      <FacultyCard faculty={faculty} onClick={() => navigate('/faculty-portal')} />
                    </div>
                  ))}
                </div>
              )}
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
                        className="form-select mb-2"
                        value={scheduleForm.room}
                        onChange={(e) => {
                          if (e.target.value === '__add_new__') {
                            setShowRoomModal(true);
                          } else {
                            setScheduleForm({ ...scheduleForm, room: e.target.value });
                          }
                        }}
                        required
                      >
                        <option value="">Select a room</option>
                        {availableRooms.map((room) => (
                          <option key={room.id} value={room.name}>
                            {room.name} - {room.building} (Capacity: {room.capacity})
                          </option>
                        ))}
                        {user?.role === 'admin' && (
                          <option value="__add_new__" style={{ fontWeight: 'bold', color: '#0d6efd' }}>
                            ➕ Add New Room
                          </option>
                        )}
                      </select>
                      {user?.role === 'admin' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary w-100"
                          onClick={() => {
                            setShowRoomModal(true);
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="me-1">
                            <path d="M10 4V10M10 10V16M10 10H16M10 10H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Add Room
                        </button>
                      )}
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
                  {submitError && (
                    <div className="alert alert-danger" role="alert">
                      {submitError}
                    </div>
                  )}
                  <div className="border rounded p-3">
                    <h6 className="mb-3">Create Faculty Profile</h6>
                      <form onSubmit={handleFacultyProfileSubmit}>
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="form-label">Name</label>
                            <input
                              type="text"
                              className="form-control"
                              value={facultyProfileForm.name}
                              onChange={(e) =>
                                setFacultyProfileForm({ ...facultyProfileForm, name: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-6">
                            <label className="form-label">Email</label>
                            <input
                              type="email"
                              className="form-control"
                              value={facultyProfileForm.email}
                              onChange={(e) =>
                                setFacultyProfileForm({ ...facultyProfileForm, email: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="col-md-12">
                            <label className="form-label">Department</label>
                            <input
                              type="text"
                              className="form-control"
                              value={facultyProfileForm.department}
                              onChange={(e) =>
                                setFacultyProfileForm({ ...facultyProfileForm, department: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                        {facultyProfileError && (
                          <div className="alert alert-danger mt-3" role="alert">
                            {facultyProfileError}
                          </div>
                        )}
                        {facultyProfileSuccess && (
                          <div className="alert alert-success mt-3" role="alert">
                            {facultyProfileSuccess}
                          </div>
                        )}
                        <div className="mt-3">
                          <button type="submit" className="btn btn-primary" disabled={creatingFacultyProfile}>
                            {creatingFacultyProfile ? 'Creating...' : 'Create Faculty Profile'}
                          </button>
                        </div>
                      </form>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSubmitError(null);
                    }}
                    disabled={submittingSchedule}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingSchedule}
                  >
                    {submittingSchedule ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Schedule'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add Room</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowRoomModal(false);
                    setRoomSubmitError(null);
                  }}
                ></button>
              </div>
              <form onSubmit={handleRoomSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Room Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                      required
                      placeholder="e.g., Room 101"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Building</label>
                    <input
                      type="text"
                      className="form-control"
                      value={roomForm.building}
                      onChange={(e) => setRoomForm({ ...roomForm, building: e.target.value })}
                      required
                      placeholder="e.g., Main Building"
                    />
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Floor</label>
                      <input
                        type="number"
                        className="form-control"
                        value={roomForm.floor}
                        onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Capacity</label>
                      <input
                        type="number"
                        className="form-control"
                        value={roomForm.capacity}
                        onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={roomForm.status}
                      onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
                      required
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Equipment</label>
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        value={equipmentInput}
                        onChange={(e) => setEquipmentInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddEquipment();
                          }
                        }}
                        placeholder="Add equipment (e.g., Projector)"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleAddEquipment}
                      >
                        Add
                      </button>
                    </div>
                    {roomForm.equipment.length > 0 && (
                      <div className="d-flex flex-wrap gap-2">
                        {roomForm.equipment.map((eq, idx) => (
                          <span key={idx} className="badge bg-secondary d-flex align-items-center gap-1">
                            {eq}
                            <button
                              type="button"
                              className="btn-close btn-close-white"
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => handleRemoveEquipment(idx)}
                              aria-label="Remove"
                            ></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  {roomSubmitError && (
                    <div className="alert alert-danger" role="alert">
                      {roomSubmitError}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowRoomModal(false);
                      setRoomSubmitError(null);
                    }}
                    disabled={submittingRoom}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submittingRoom}
                  >
                    {submittingRoom ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating...
                      </>
                    ) : (
                      'Add Room'
                    )}
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

