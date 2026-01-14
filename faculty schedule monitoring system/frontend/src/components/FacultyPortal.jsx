import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FacultyCard from './FacultyCard';
import api from '../services/api';

const FacultyPortal = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      // Replace with actual API call
      const mockFaculties = [
        { 
          id: 1, 
          name: 'Dr. Sarah Johnson', 
          department: 'Computer Science', 
          email: 'sarah.j@university.edu',
          phone: '+1 (555) 123-4567',
          office_location: 'Building A, Room 305',
          attendance: 95,
          totalClasses: 6,
          status: 'active'
        },
        { 
          id: 2, 
          name: 'Prof. Michael Chen', 
          department: 'Mathematics', 
          email: 'michael.c@university.edu',
          phone: '+1 (555) 234-5678',
          office_location: 'Building B, Room 201',
          attendance: 92,
          totalClasses: 5,
          status: 'active'
        },
        { 
          id: 3, 
          name: 'Dr. Emily Rodriguez', 
          department: 'Physics', 
          email: 'emily.r@university.edu',
          phone: '+1 (555) 345-6789',
          office_location: 'Building C, Room 410',
          attendance: 98,
          totalClasses: 4,
          status: 'active'
        },
        { 
          id: 4, 
          name: 'Prof. David Kim', 
          department: 'Chemistry', 
          email: 'david.k@university.edu',
          phone: '+1 (555) 456-7890',
          office_location: 'Building D, Room 215',
          attendance: 89,
          totalClasses: 5,
          status: 'active'
        },
        { 
          id: 5, 
          name: 'Dr. Lisa Anderson', 
          department: 'Biology', 
          email: 'lisa.a@university.edu',
          phone: '+1 (555) 567-8901',
          office_location: 'Building E, Room 320',
          attendance: 94,
          totalClasses: 6,
          status: 'active'
        },
        { 
          id: 6, 
          name: 'Prof. James Wilson', 
          department: 'Computer Science', 
          email: 'james.w@university.edu',
          phone: '+1 (555) 678-9012',
          office_location: 'Building A, Room 310',
          attendance: 91,
          totalClasses: 5,
          status: 'active'
        },
        { 
          id: 7, 
          name: 'Dr. Maria Garcia', 
          department: 'Mathematics', 
          email: 'maria.g@university.edu',
          phone: '+1 (555) 789-0123',
          office_location: 'Building B, Room 205',
          attendance: 96,
          totalClasses: 4,
          status: 'active'
        },
        { 
          id: 8, 
          name: 'Prof. Robert Taylor', 
          department: 'Physics', 
          email: 'robert.t@university.edu',
          phone: '+1 (555) 890-1234',
          office_location: 'Building C, Room 415',
          attendance: 87,
          totalClasses: 5,
          status: 'on-leave'
        },
      ];
      setFaculties(mockFaculties);
    } catch (error) {
      console.error('Error fetching faculties:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = ['all', ...new Set(faculties.map(f => f.department))];

  const filteredFaculties = faculties.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || faculty.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Faculty Portal</h2>
          <p className="text-muted mb-0">Browse and manage faculty members</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <div className="text-end">
            <span className="text-muted">Total: {filteredFaculties.length} faculty members</span>
          </div>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No faculty members found matching your criteria.</p>
        </div>
      ) : (
        <div className="row g-4">
          {filteredFaculties.map((faculty) => (
            <div key={faculty.id} className="col-md-6 col-lg-4 col-xl-3">
              <FacultyCard faculty={faculty} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyPortal;

