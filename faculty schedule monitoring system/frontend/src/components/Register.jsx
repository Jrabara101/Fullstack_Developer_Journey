import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrors({});

    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password, passwordConfirmation);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Registration failed');
      if (result.errors) {
        setErrors(result.errors);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light position-relative overflow-hidden">
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
        <div className="position-absolute rounded-circle" style={{
          width: '400px',
          height: '400px',
          top: '-200px',
          left: '-200px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1
        }}></div>
        <div className="position-absolute rounded-circle" style={{
          width: '300px',
          height: '300px',
          bottom: '-150px',
          right: '-150px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          opacity: 0.1
        }}></div>
      </div>
      
      <div className="card shadow-lg border-0" style={{ maxWidth: '450px', width: '100%', zIndex: 1, borderRadius: '12px' }}>
        <div className="card-body p-4">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="rounded" style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div className="position-absolute bg-danger rounded" style={{
                width: '20px',
                height: '20px',
                top: '8px',
                right: '8px'
              }}></div>
            </div>
            <span className="fs-4 fw-bold text-dark">Frest</span>
          </div>

          <h2 className="h4 mb-2">
            Welcome to Frest! 👋
          </h2>
          <p className="text-muted mb-4">
            Create an account to start the adventure
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="mb-3">
              <label htmlFor="name" className="form-label text-uppercase small fw-semibold text-muted">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                className={`form-control form-control-lg ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label text-uppercase small fw-semibold text-muted">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`form-control form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label text-uppercase small fw-semibold text-muted">
                Password
              </label>
              <div className="position-relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control form-control-lg pe-5 ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-decoration-none"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ border: 'none', background: 'none' }}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="invalid-feedback d-block">{errors.password[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password_confirmation" className="form-label text-uppercase small fw-semibold text-muted">
                Confirm Password
              </label>
              <div className="position-relative">
                <input
                  id="password_confirmation"
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  className="form-control form-control-lg pe-5"
                  placeholder="Confirm your password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-decoration-none"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  style={{ border: 'none', background: 'none' }}
                >
                  {showPasswordConfirmation ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                      <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-decoration-none fw-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
