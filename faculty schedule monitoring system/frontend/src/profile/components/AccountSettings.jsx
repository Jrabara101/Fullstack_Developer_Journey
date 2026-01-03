import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/AccountSettings.css';

const AccountSettings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: user?.email || 'john.doe@example.com',
    organization: 'Pixinvent',
    phone: 'US (+1) 202 555 0111',
    address: '',
    zipCode: '231465',
    state: 'California',
    country: '',
    language: '',
    timezone: '',
    currency: '',
  });
  const [confirmDeactivation, setConfirmDeactivation] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 800 * 1024) {
        alert('File size must be less than 800KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setProfileImage(null);
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Handle save logic here
    console.log('Saving changes:', formData);
    alert('Changes saved successfully!');
  };

  const handleDeactivateAccount = () => {
    if (!confirmDeactivation) {
      alert('Please confirm account deactivation');
      return;
    }
    if (window.confirm('Are you absolutely sure you want to deactivate your account? This action cannot be undone.')) {
      // Handle deactivation logic here
      console.log('Account deactivated');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (name) => {
    if (!name) return '#667eea';
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="account-settings">
      <div className="page-header mb-4">
        <h4 className="mb-1">Account Settings / Account</h4>
        <p className="text-muted mb-0">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            Billing & Plans
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            Connections
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'account' && (
          <div>
            {/* Profile Details Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Profile Details</h5>
                
                {/* Profile Picture */}
                <div className="d-flex align-items-start mb-4">
                  <div className="me-4">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          width: '100px',
                          height: '100px',
                          backgroundColor: getAvatarColor(user?.name || 'User'),
                          fontSize: '2rem'
                        }}
                      >
                        {getInitials(user?.name || 'User')}
                      </div>
                    )}
                  </div>
                  <div className="flex-grow-1">
                    <div className="mb-2">
                      <label htmlFor="profile-upload" className="btn btn-primary btn-sm me-2">
                        Upload new photo
                      </label>
                      <input
                        type="file"
                        id="profile-upload"
                        className="d-none"
                        accept="image/jpeg,image/jpg,image/gif,image/png"
                        onChange={handleImageUpload}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleResetImage}
                      >
                        Reset
                      </button>
                    </div>
                    <p className="text-muted small mb-0">
                      Allowed JPG, GIF or PNG. Max size of 800K.
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <form onSubmit={handleSaveChanges}>
                  <div className="row g-3">
                    {/* Left Column */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="firstName" className="form-label text-uppercase small fw-semibold text-muted">
                          First Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label text-uppercase small fw-semibold text-muted">
                          E-mail
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="phone" className="form-label text-uppercase small fw-semibold text-muted">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="state" className="form-label text-uppercase small fw-semibold text-muted">
                          State
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="state"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="country" className="form-label text-uppercase small fw-semibold text-muted">
                          Country
                        </label>
                        <select
                          className="form-select"
                          id="country"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                        >
                          <option value="">Select</option>
                          <option value="us">United States</option>
                          <option value="uk">United Kingdom</option>
                          <option value="ca">Canada</option>
                          <option value="au">Australia</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="timezone" className="form-label text-uppercase small fw-semibold text-muted">
                          Timezone
                        </label>
                        <select
                          className="form-select"
                          id="timezone"
                          name="timezone"
                          value={formData.timezone}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Timezone</option>
                          <option value="pst">Pacific Standard Time (PST)</option>
                          <option value="mst">Mountain Standard Time (MST)</option>
                          <option value="cst">Central Standard Time (CST)</option>
                          <option value="est">Eastern Standard Time (EST)</option>
                        </select>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="lastName" className="form-label text-uppercase small fw-semibold text-muted">
                          Last Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="organization" className="form-label text-uppercase small fw-semibold text-muted">
                          Organization
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="organization"
                          name="organization"
                          value={formData.organization}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="address" className="form-label text-uppercase small fw-semibold text-muted">
                          Address
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Address"
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="zipCode" className="form-label text-uppercase small fw-semibold text-muted">
                          Zip Code
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label htmlFor="language" className="form-label text-uppercase small fw-semibold text-muted">
                          Language
                        </label>
                        <select
                          className="form-select"
                          id="language"
                          name="language"
                          value={formData.language}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Language</option>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label htmlFor="currency" className="form-label text-uppercase small fw-semibold text-muted">
                          Currency
                        </label>
                        <select
                          className="form-select"
                          id="currency"
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Currency</option>
                          <option value="usd">USD ($)</option>
                          <option value="eur">EUR (€)</option>
                          <option value="gbp">GBP (£)</option>
                          <option value="jpy">JPY (¥)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">
                      Save changes
                    </button>
                    <button type="button" className="btn btn-outline-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Delete Account Section */}
            <div className="card shadow-sm border-danger">
              <div className="card-body">
                <h5 className="card-title text-danger mb-3">Delete Account</h5>
                <div className="alert alert-warning mb-3" role="alert">
                  Are you sure you want to delete your account? Once you delete your account, there is no going back. Please be certain.
                </div>
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="confirmDeactivation"
                    checked={confirmDeactivation}
                    onChange={(e) => setConfirmDeactivation(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="confirmDeactivation">
                    I confirm my account deactivation
                  </label>
                </div>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeactivateAccount}
                  disabled={!confirmDeactivation}
                >
                  Deactivate Account
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Security Settings</h5>
              <p className="text-muted">Security settings coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Billing & Plans</h5>
              <p className="text-muted">Billing settings coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Notifications</h5>
              <p className="text-muted">Notification settings coming soon...</p>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Connections</h5>
              <p className="text-muted">Connection settings coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;

