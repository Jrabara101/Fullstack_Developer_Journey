import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FacultyCard from './FacultyCard';
import api from '../services/api';

const initialFormState = {
  id: '',
  user_id: '',
  name: '',
  email: '',
  department: '',
  phone: '',
  office_location: '',
  created_at: '',
  updated_at: '',
};

const FacultyPortal = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/faculties');
      setFaculties(Array.isArray(response.data) ? response.data : []);
    } catch (fetchError) {
      console.error('Error fetching faculties:', fetchError);
      setError('Unable to load faculty list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const departments = useMemo(() => {
    const departmentSet = new Set(
      faculties
        .map((faculty) => faculty.department)
        .filter((department) => department && department.trim().length > 0),
    );
    return ['all', ...departmentSet];
  }, [faculties]);

  const filteredFaculties = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return faculties.filter((faculty) => {
      const name = faculty.name?.toLowerCase() || '';
      const email = faculty.email?.toLowerCase() || '';
      const department = faculty.department?.toLowerCase() || '';
      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        department.includes(normalizedSearch);
      const matchesDepartment = filterDepartment === 'all' || faculty.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    });
  }, [faculties, searchTerm, filterDepartment]);

  const isAdmin = user?.role === 'admin';

  const openModal = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setSaveError('');
    setSaveSuccess('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setFormErrors({});
    setSaveError('');
    setSaveSuccess('');
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setFormErrors({});
    setSaveError('');
    setSaveSuccess('');

    const payload = {
      user_id: formData.user_id || null,
      name: formData.name,
      email: formData.email,
      department: formData.department,
      phone: formData.phone || null,
      office_location: formData.office_location || null,
    };

    try {
      const response = await api.post('/api/faculties', payload);
      const createdFaculty = response.data;
      setFaculties((prev) => [createdFaculty, ...prev]);
      setFormData({
        ...initialFormState,
        ...createdFaculty,
        user_id: createdFaculty.user_id ?? '',
      });
      setSaveSuccess('Faculty created successfully.');
    } catch (submitError) {
      if (submitError.response?.status === 422) {
        setFormErrors(submitError.response.data?.errors || {});
        setSaveError('Please fix the validation errors and try again.');
      } else if (submitError.response?.status === 409) {
        setSaveError(submitError.response.data?.message || 'Faculty already exists for this user.');
      } else {
        setSaveError('Unable to save faculty. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const resetForAnother = () => {
    setFormData(initialFormState);
    setFormErrors({});
    setSaveError('');
    setSaveSuccess('');
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <h2 className="mb-1">Faculty Portal</h2>
          <p className="text-muted mb-0">Browse and manage faculty members</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary" onClick={openModal}>
            Add Faculty
          </button>
        )}
      </div>

      <div className="row mb-4 g-3">
        <div className="col-lg-6">
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
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
        <div className="col-lg-3">
          <select
            className="form-select"
            value={filterDepartment}
            onChange={(event) => setFilterDepartment(event.target.value)}
          >
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept === 'all' ? 'All Departments' : dept}
              </option>
            ))}
          </select>
        </div>
        <div className="col-lg-3">
          <div className="text-lg-end text-muted">
            Total: {filteredFaculties.length} faculty members
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : filteredFaculties.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted mb-0">No faculty members found matching your criteria.</p>
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

      {isModalOpen && (
        <>
          <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-modal="true">
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add Faculty</h5>
                  <button type="button" className="btn-close" onClick={closeModal} aria-label="Close" />
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    {saveError && <div className="alert alert-danger">{saveError}</div>}
                    {saveSuccess && <div className="alert alert-success">{saveSuccess}</div>}

                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label">ID</label>
                        <input className="form-control" value={formData.id || ''} readOnly />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">User ID</label>
                        <input
                          className={`form-control ${formErrors.user_id ? 'is-invalid' : ''}`}
                          name="user_id"
                          value={formData.user_id}
                          onChange={handleInputChange}
                        />
                        {formErrors.user_id && <div className="invalid-feedback">{formErrors.user_id[0]}</div>}
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">Department</label>
                        <input
                          className={`form-control ${formErrors.department ? 'is-invalid' : ''}`}
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          required
                        />
                        {formErrors.department && <div className="invalid-feedback">{formErrors.department[0]}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input
                          className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                        {formErrors.name && <div className="invalid-feedback">{formErrors.name[0]}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        {formErrors.email && <div className="invalid-feedback">{formErrors.email[0]}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input
                          className={`form-control ${formErrors.phone ? 'is-invalid' : ''}`}
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                        {formErrors.phone && <div className="invalid-feedback">{formErrors.phone[0]}</div>}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Office Location</label>
                        <input
                          className={`form-control ${formErrors.office_location ? 'is-invalid' : ''}`}
                          name="office_location"
                          value={formData.office_location}
                          onChange={handleInputChange}
                        />
                        {formErrors.office_location && (
                          <div className="invalid-feedback">{formErrors.office_location[0]}</div>
                        )}
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Created At</label>
                        <input className="form-control" value={formData.created_at || ''} readOnly />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Updated At</label>
                        <input className="form-control" value={formData.updated_at || ''} readOnly />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    {formData.id ? (
                      <>
                        <button type="button" className="btn btn-outline-primary" onClick={resetForAnother}>
                          Add Another
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                          Close
                        </button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn btn-secondary" onClick={closeModal}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Faculty'}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      )}
    </div>
  );
};

export default FacultyPortal;

