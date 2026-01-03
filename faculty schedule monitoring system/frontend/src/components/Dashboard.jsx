import { useEffect, useState } from 'react';
import api from '../services/api';

const Dashboard = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const response = await api.get('/api/health');
      setHealthStatus(response.data);
    } catch (error) {
      console.error('API health check failed:', error);
      setHealthStatus({ status: 'error', message: 'Unable to connect to backend' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="mb-4">Faculty Schedule Monitoring System</h1>
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">System Status</h5>
              {loading ? (
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              ) : (
                <div>
                  <p className={`mb-2 ${healthStatus?.status === 'ok' ? 'text-success fw-bold' : 'text-danger fw-bold'}`}>
                    {healthStatus?.status === 'ok' ? '✓ Connected' : '✗ Disconnected'}
                  </p>
                  <p className="text-muted mb-0">{healthStatus?.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Quick Stats</h5>
              <div className="list-group list-group-flush">
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span className="text-muted">Total Faculty:</span>
                  <span className="fw-bold">-</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span className="text-muted">Active Schedules:</span>
                  <span className="fw-bold">-</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                  <span className="text-muted">Today's Classes:</span>
                  <span className="fw-bold">-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
