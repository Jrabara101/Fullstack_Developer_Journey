import { useState } from 'react';

const FacultySchedule = () => {
  const [schedules] = useState([]);

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Faculty Schedule</h1>
        <button className="btn btn-primary">Add Schedule</button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {schedules.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">No schedules found. Start by adding a new schedule.</p>
            </div>
          ) : (
            <div>
              {/* Schedule items will be rendered here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultySchedule;
