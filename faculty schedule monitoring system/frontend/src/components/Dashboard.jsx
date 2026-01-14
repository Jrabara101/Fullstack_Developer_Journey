import { useAuth } from '../contexts/AuthContext';
import AnalyticsDashboard from './AnalyticsDashboard';
import AcademyDashboard from './AcademyDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  
  // Show Analytics Dashboard for admin, Academy Dashboard for faculty
  if (user?.role === 'admin') {
    return <AnalyticsDashboard />;
  }
  
  return <AcademyDashboard />;
};

export default Dashboard;
