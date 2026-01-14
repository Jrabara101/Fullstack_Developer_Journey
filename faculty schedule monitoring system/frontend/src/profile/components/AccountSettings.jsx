import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import '../styles/AccountSettings.css';

const AccountSettings = ({ initialTab = 'account' }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update active tab when initialTab prop changes
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
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
  
  // Security tab states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [apiKeyType, setApiKeyType] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      name: 'Server Key 1',
      accessLevel: 'FULL ACCESS',
      key: '23eaf7f0-f4f7-495e-8b86-fad3261282ac',
      createdAt: '28 Apr 2021, 18:20 GTM+4:10',
    },
    {
      id: 2,
      name: 'Server Key 2',
      accessLevel: 'READ ONLY',
      key: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      createdAt: '15 May 2021, 10:30 GTM+4:10',
    },
    {
      id: 3,
      name: 'Mobile Key 1',
      accessLevel: 'FULL ACCESS',
      key: '98765432-1098-7654-3210-fedcba987654',
      createdAt: '20 Jun 2021, 14:45 GTM+4:10',
    },
  ]);
  const [recentDevices] = useState([
    {
      browser: 'Chrome',
      os: 'Windows',
      device: 'HP Spectre 360',
      location: 'Switzerland',
      date: '10 July 2021 20:07',
      icon: 'windows',
    },
    {
      browser: 'Chrome',
      os: 'iPhone',
      device: 'iPhone 12x',
      location: 'Australia',
      date: '13 July 2021 10:10',
      icon: 'apple',
    },
    {
      browser: 'Chrome',
      os: 'Android',
      device: 'Oneplus 9 Pro',
      location: 'Dubai',
      date: '14 July 2021 15:15',
      icon: 'android',
    },
    {
      browser: 'Chrome',
      os: 'MacOS',
      device: 'Apple iMac',
      location: 'India',
      date: '16 July 2021 16:17',
      icon: 'apple',
    },
    {
      browser: 'Chrome',
      os: 'Windows',
      device: 'HP Spectre 360',
      location: 'Switzerland',
      date: '20 July 2021 21:01',
      icon: 'windows',
    },
    {
      browser: 'Chrome',
      os: 'Android',
      device: 'Oneplus 9 Pro',
      location: 'Dubai',
      date: '21 July 2021 12:22',
      icon: 'android',
    },
  ]);

  // Billing tab states
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardData, setCardData] = useState({
    cardNumber: '1356 3215 6548 7898',
    name: 'John Doe',
    expDate: '',
    cvv: '654',
    saveCard: true,
  });
  const [savedCards, setSavedCards] = useState([
    {
      id: 1,
      type: 'mastercard',
      name: 'Tom McBride',
      number: '9856',
      expiry: '12/26',
      isPrimary: true,
    },
    {
      id: 2,
      type: 'visa',
      name: 'Mildred Wagner',
      number: '5896',
      expiry: '10/27',
      isPrimary: false,
    },
  ]);
  const [billingAddress, setBillingAddress] = useState({
    companyName: 'Pixinvent',
    taxId: '',
    mobile: 'US (+1) 202 555 0111',
    billingAddress: '',
    state: 'California',
    billingEmail: 'john.doe@example.com',
    vatNumber: '',
    country: 'USA',
    zipCode: '231465',
  });
  const [currentPlan] = useState({
    name: 'Basic',
    description: 'A simple start for everyone.',
    activeUntil: 'Dec 09, 2021',
    price: '$199',
    period: 'Per Month',
    tag: 'POPULAR',
    description2: 'Standard plan for small to medium businesses.',
    daysRemaining: 6,
    totalDays: 30,
  });

  // Notifications tab states
  const [notificationSettings, setNotificationSettings] = useState({
    newForYou: { email: true, browser: true, app: true },
    accountActivity: { email: true, browser: true, app: true },
    newBrowserSignIn: { email: true, browser: true, app: false },
    newDeviceLinked: { email: true, browser: false, app: false },
  });
  const [notificationTiming, setNotificationTiming] = useState('online');

  // Connections tab states
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: true,
    slack: false,
    github: true,
    mailchimp: true,
    asana: false,
  });
  const [socialAccounts, setSocialAccounts] = useState({
    facebook: { connected: false, username: null },
    twitter: { connected: true, username: '@Pixinvent' },
    instagram: { connected: true, username: '@Pixinvent' },
    dribbble: { connected: false, username: null },
    behance: { connected: false, username: null },
  });

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

  // Security handlers
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    // Handle password change logic here
    console.log('Changing password');
    alert('Password changed successfully!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleEnableTwoFactor = () => {
    setTwoFactorEnabled(true);
    alert('Two-factor authentication enabled!');
  };

  const handleCreateApiKey = (e) => {
    e.preventDefault();
    if (!apiKeyType || !apiKeyName) {
      alert('Please fill in all fields');
      return;
    }
    const newKey = {
      id: apiKeys.length + 1,
      name: apiKeyName,
      accessLevel: apiKeyType === 'full' ? 'FULL ACCESS' : 'READ ONLY',
      key: `${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' GTM+4:10',
    };
    setApiKeys([...apiKeys, newKey]);
    setApiKeyType('');
    setApiKeyName('');
    alert('API key created successfully!');
  };

  const copyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    alert('API key copied to clipboard!');
  };

  // Billing handlers
  const handleCardDataChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setCardData(prev => ({ ...prev, [name]: checked }));
    } else {
      setCardData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBillingAddressChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    alert('Card saved successfully!');
  };

  const handleSaveBillingAddress = (e) => {
    e.preventDefault();
    alert('Billing address saved successfully!');
  };

  const handleDeleteCard = (id) => {
    if (window.confirm('Are you sure you want to delete this card?')) {
      setSavedCards(prev => prev.filter(card => card.id !== id));
    }
  };

  // Notifications handlers
  const handleNotificationToggle = (type, channel) => {
    setNotificationSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [channel]: !prev[type][channel]
      }
    }));
  };

  const handleRequestPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          alert('Notification permission granted!');
        } else {
          alert('Notification permission denied.');
        }
      });
    } else {
      alert('Your browser does not support notifications.');
    }
  };

  const handleSaveNotifications = (e) => {
    e.preventDefault();
    alert('Notification settings saved!');
  };

  // Connections handlers
  const handleConnectedAccountToggle = (account) => {
    setConnectedAccounts(prev => ({
      ...prev,
      [account]: !prev[account]
    }));
  };

  const handleSocialAccountConnect = (account) => {
    const username = prompt(`Enter your ${account} username:`);
    if (username) {
      setSocialAccounts(prev => ({
        ...prev,
        [account]: { connected: true, username: `@${username}` }
      }));
    }
  };

  const handleSocialAccountDisconnect = (account) => {
    if (window.confirm(`Are you sure you want to disconnect ${account}?`)) {
      setSocialAccounts(prev => ({
        ...prev,
        [account]: { connected: false, username: null }
      }));
    }
  };

  const getDeviceIcon = (icon) => {
    if (icon === 'windows') {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M0 0h9.377v9.372H0V0zm10.623 0H20v9.372H10.623V0zM0 10.628h9.377V20H0V10.628zm10.623 0H20V20H10.623V10.628z"/>
        </svg>
      );
    } else if (icon === 'apple') {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M15.5 1.5c-.3-.3-.8-.4-1.2-.2-.3.1-.6.4-.8.7-.4.5-.6 1.1-.5 1.7.1.5.4 1 .8 1.3.3.3.8.4 1.2.2.3-.1.6-.4.8-.7.4-.5.6-1.1.5-1.7-.1-.5-.4-1-.8-1.3zm-1.2 3.2c-1.1 0-2.1-.6-2.7-1.4-.7-.9-1-2.1-.8-3.2.1.1.2.1.3.2.8.6 1.4 1.5 1.9 2.5.1.2.2.4.3.6.1.1.2.1.3.1.1 0 .2 0 .3-.1.1-.1.1-.1.1-.3zm-1.1 1.1c-.9-.1-1.7.2-2.4.7-.8.6-1.3 1.5-1.4 2.5-.1 1 .2 2 1 2.7.7.6 1.6 1 2.6 1.1.9.1 1.7-.2 2.4-.7.8-.6 1.3-1.5 1.4-2.5.1-1-.2-2-1-2.7-.7-.6-1.6-1-2.6-1.1z"/>
        </svg>
      );
    } else {
      return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13h2v6h-2V5zm0 8h2v2h-2v-2z"/>
        </svg>
      );
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
        <h4 className="mb-1">
          Account Settings / {activeTab === 'account' ? 'Account' : activeTab === 'security' ? 'Security' : activeTab === 'billing' ? 'Billing & Plans' : activeTab === 'notifications' ? 'Notifications' : 'Connections'}
        </h4>
        <p className="text-muted mb-0">Manage your account settings and preferences</p>
      </div>

      {/* Tabs */}
      <ul className="nav nav-tabs mb-4" role="tablist">
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
            </svg>
            Account
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            </svg>
            Security
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v1h14V4a1 1 0 0 0-1-1H2zm13 4H1v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
              <path d="M2 10a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-1z"/>
            </svg>
            Billing & Plans
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z"/>
            </svg>
            Notifications
          </button>
        </li>
        <li className="nav-item" role="presentation">
          <button
            className={`nav-link ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
              <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1 1.65-2.547l.647-.647a4.018 4.018 0 0 1 2.547-1.65L11.45 2.12a4 4 0 1 1 5.657 5.657l-.789.789a1 1 0 0 1-1.414-1.414l.789-.789a2 2 0 1 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a2 2 0 0 0-2.828 2.828l.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l.79.79a4 4 0 0 1 5.657 0l.79-.79a1 1 0 0 1 1.414 1.414l-.79.79a4 4 0 0 1 0 5.657l-.79.79a1 1 0 0 1-1.414-1.414l.79-.79a2 2 0 0 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a2 2 0 0 0-2.828 2.828l.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l-.79.79a4 4 0 0 1 5.657 0l.79-.79a1 1 0 0 1 1.414 1.414l-.79.79a4 4 0 0 1 0 5.657l-.79.79a1 1 0 0 1-1.414-1.414l.79-.79a2 2 0 0 0-2.828-2.828l-.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a2 2 0 0 0-2.828 2.828l.79.79a1 1 0 0 1-1.414 1.414l-.79-.79a4 4 0 0 1 0-5.657l.79-.79a1 1 0 0 1 1.414-1.414l-.79.79a4 4 0 0 1 5.657 0z"/>
            </svg>
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
          <div>
            {/* Change Password Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Change Password</h5>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label text-uppercase small fw-semibold text-muted">
                      Current Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        className="form-control"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-decoration-none"
                        onClick={() => togglePasswordVisibility('current')}
                        style={{ border: 'none', background: 'none' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          {showPasswords.current ? (
                            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                          ) : (
                            <>
                              <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                              <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label text-uppercase small fw-semibold text-muted">
                      New Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        className="form-control"
                        id="newPassword"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-decoration-none"
                        onClick={() => togglePasswordVisibility('new')}
                        style={{ border: 'none', background: 'none' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          {showPasswords.new ? (
                            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                          ) : (
                            <>
                              <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                              <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label text-uppercase small fw-semibold text-muted">
                      Confirm New Password
                    </label>
                    <div className="position-relative">
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        className="form-control"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3 text-decoration-none"
                        onClick={() => togglePasswordVisibility('confirm')}
                        style={{ border: 'none', background: 'none' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          {showPasswords.confirm ? (
                            <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                          ) : (
                            <>
                              <path d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zM10 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                              <line x1="2" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="2"/>
                            </>
                          )}
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="small text-muted mb-2">Password Requirements:</p>
                    <ul className="small text-muted mb-0" style={{ listStyle: 'none', paddingLeft: '0' }}>
                      <li className="mb-1">• Minimum 8 characters long - the more, the better</li>
                      <li className="mb-1">• At least one lowercase character</li>
                      <li className="mb-1">• At least one number, symbol, or whitespace character</li>
                    </ul>
                  </div>

                  <div className="d-flex gap-2">
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

            {/* Two-steps verification Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">Two-steps verification</h5>
                {twoFactorEnabled ? (
                  <div>
                    <p className="text-success mb-2">Two factor authentication is enabled.</p>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => setTwoFactorEnabled(false)}
                    >
                      Disable two-factor authentication
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-muted mb-2">Two factor authentication is not enabled yet.</p>
                    <p className="text-muted mb-3">
                      Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in.{' '}
                      <a href="#" className="text-decoration-none">Learn more</a>.
                    </p>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleEnableTwoFactor}
                    >
                      Enable two-factor authentication
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Create an API key Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Create an API key</h5>
                <form onSubmit={handleCreateApiKey}>
                  <div className="mb-3">
                    <label htmlFor="apiKeyType" className="form-label text-uppercase small fw-semibold text-muted">
                      Choose the API key type you want to create
                    </label>
                    <select
                      className="form-select"
                      id="apiKeyType"
                      value={apiKeyType}
                      onChange={(e) => setApiKeyType(e.target.value)}
                      required
                    >
                      <option value="">Choose Key Type</option>
                      <option value="full">Full Access</option>
                      <option value="read">Read Only</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="apiKeyName" className="form-label text-uppercase small fw-semibold text-muted">
                      Name the API key
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="apiKeyName"
                      value={apiKeyName}
                      onChange={(e) => setApiKeyName(e.target.value)}
                      placeholder="Server Key 1"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Create Key
                  </button>
                </form>
              </div>
            </div>

            {/* API Key List & Access Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-3">API Key List & Access</h5>
                <p className="text-muted mb-4">
                  An API key is a simple encrypted string that identifies an application without any principal. They are useful for accessing public data anonymously, and are used to associate API requests with your project for quota and billing.
                </p>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th className="text-uppercase small fw-semibold text-muted">Name</th>
                        <th className="text-uppercase small fw-semibold text-muted">Access Level</th>
                        <th className="text-uppercase small fw-semibold text-muted">Key</th>
                        <th className="text-uppercase small fw-semibold text-muted">Created</th>
                        <th className="text-uppercase small fw-semibold text-muted"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((apiKey) => (
                        <tr key={apiKey.id}>
                          <td className="fw-semibold">{apiKey.name}</td>
                          <td>
                            <span className={`badge ${apiKey.accessLevel === 'FULL ACCESS' ? 'bg-primary' : 'bg-secondary'}`}>
                              {apiKey.accessLevel}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <code className="small">{apiKey.key}</code>
                              <button
                                type="button"
                                className="btn btn-sm btn-link text-decoration-none p-0"
                                onClick={() => copyApiKey(apiKey.key)}
                                title="Copy key"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H6zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1H2z" fill="currentColor"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                          <td className="text-muted small">Created on {apiKey.createdAt}</td>
                          <td>
                            <div className="dropdown">
                              <button
                                className="btn btn-link text-muted p-0"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                              >
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                  <circle cx="10" cy="4" r="1.5"/>
                                  <circle cx="10" cy="10" r="1.5"/>
                                  <circle cx="10" cy="16" r="1.5"/>
                                </svg>
                              </button>
                              <ul className="dropdown-menu">
                                <li><a className="dropdown-item" href="#">Edit</a></li>
                                <li><a className="dropdown-item text-danger" href="#">Delete</a></li>
                              </ul>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Devices Section */}
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-4">Recent Devices</h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th className="text-uppercase small fw-semibold text-muted">Browser</th>
                        <th className="text-uppercase small fw-semibold text-muted">Device</th>
                        <th className="text-uppercase small fw-semibold text-muted">Location</th>
                        <th className="text-uppercase small fw-semibold text-muted">Recent Activities</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentDevices.map((device, index) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-primary">{getDeviceIcon(device.icon)}</span>
                              <span>{device.browser} on {device.os}</span>
                            </div>
                          </td>
                          <td className="fw-semibold">{device.device}</td>
                          <td>{device.location}</td>
                          <td className="text-muted">{device.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            {/* Current Plan Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h5 className="card-title mb-3">Your Current Plan is {currentPlan.name}</h5>
                    <p className="text-muted mb-3">{currentPlan.description}</p>
                    <p className="mb-3">
                      <strong>Active until {currentPlan.activeUntil}</strong>
                      <br />
                      <small className="text-muted">We will send you a notification upon Subscription expiration.</small>
                    </p>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div>
                        <h4 className="mb-0">
                          {currentPlan.price} <span className="badge bg-primary ms-2">{currentPlan.tag}</span>
                        </h4>
                        <p className="text-muted mb-0 small">{currentPlan.period}</p>
                        <p className="text-muted mb-0 small">{currentPlan.description2}</p>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary">Upgrade Plan</button>
                      <button className="btn btn-outline-secondary">Cancel Subscription</button>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="alert alert-warning mb-3">
                      <strong>We need your attention!</strong>
                      <br />
                      Your plan requires update.
                    </div>
                    <div className="mb-2">
                      <div className="d-flex justify-content-between mb-1">
                        <span className="small text-muted">{currentPlan.daysRemaining} of {currentPlan.totalDays} Days</span>
                        <span className="small text-muted">{currentPlan.daysRemaining} days remaining</span>
                      </div>
                      <div className="progress" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: `${((currentPlan.totalDays - currentPlan.daysRemaining) / currentPlan.totalDays) * 100}%` }}
                        ></div>
                      </div>
                      <p className="small text-muted mt-2 mb-0">until your plan requires update</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Payment Methods</h5>
                <form onSubmit={handleSaveCard}>
                  <div className="mb-3">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="paymentCard"
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="paymentCard">
                        Credit/Debit/ATM Card
                      </label>
                    </div>
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="paymentMethod"
                        id="paymentPaypal"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <label className="form-check-label" htmlFor="paymentPaypal">
                        Paypal account
                      </label>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <>
                      <div className="row g-3">
                        <div className="col-md-12">
                          <label htmlFor="cardNumber" className="form-label text-uppercase small fw-semibold text-muted">
                            Card Number
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="cardNumber"
                            name="cardNumber"
                            value={cardData.cardNumber}
                            onChange={handleCardDataChange}
                            placeholder="1356 3215 6548 7898"
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="cardName" className="form-label text-uppercase small fw-semibold text-muted">
                            Name
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="cardName"
                            name="name"
                            value={cardData.name}
                            onChange={handleCardDataChange}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="col-md-3">
                          <label htmlFor="expDate" className="form-label text-uppercase small fw-semibold text-muted">
                            Exp. Date
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="expDate"
                            name="expDate"
                            value={cardData.expDate}
                            onChange={handleCardDataChange}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="col-md-3">
                          <label htmlFor="cvv" className="form-label text-uppercase small fw-semibold text-muted">
                            CVV Code
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="ms-1" style={{ cursor: 'help' }} title="Card Verification Value">
                              <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1"/>
                              <text x="8" y="11" textAnchor="middle" fontSize="10" fill="currentColor">?</text>
                            </svg>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="cvv"
                            name="cvv"
                            value={cardData.cvv}
                            onChange={handleCardDataChange}
                            placeholder="654"
                            maxLength="4"
                          />
                        </div>
                      </div>
                      <div className="form-check mt-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="saveCard"
                          name="saveCard"
                          checked={cardData.saveCard}
                          onChange={handleCardDataChange}
                        />
                        <label className="form-check-label" htmlFor="saveCard">
                          Save card for future billing?
                        </label>
                      </div>
                    </>
                  )}

                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                    <button type="button" className="btn btn-outline-secondary">Cancel</button>
                  </div>
                </form>
              </div>
            </div>

            {/* My Cards Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">My Cards</h5>
                {savedCards.map((card) => (
                  <div key={card.id} className="d-flex align-items-center justify-content-between p-3 border rounded mb-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="bg-primary text-white rounded p-2" style={{ width: '50px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {card.type === 'mastercard' ? 'MC' : 'VISA'}
                      </div>
                      <div>
                        <div className="fw-semibold">
                          {card.name}
                          {card.isPrimary && <span className="badge bg-primary ms-2">PRIMARY</span>}
                        </div>
                        <div className="text-muted small">
                          **** **** {card.number}
                        </div>
                        <div className="text-muted small">
                          Card expires at {card.expiry}
                        </div>
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-sm btn-outline-primary">Edit</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCard(card.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="card shadow-sm mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">Billing Address</h5>
                <form onSubmit={handleSaveBillingAddress}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="companyName" className="form-label text-uppercase small fw-semibold text-muted">
                          Company Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="companyName"
                          name="companyName"
                          value={billingAddress.companyName}
                          onChange={handleBillingAddressChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="taxId" className="form-label text-uppercase small fw-semibold text-muted">
                          Tax ID
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="taxId"
                          name="taxId"
                          value={billingAddress.taxId}
                          onChange={handleBillingAddressChange}
                          placeholder="Enter Tax ID"
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="mobile" className="form-label text-uppercase small fw-semibold text-muted">
                          Mobile
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="mobile"
                          name="mobile"
                          value={billingAddress.mobile}
                          onChange={handleBillingAddressChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="billingAddress" className="form-label text-uppercase small fw-semibold text-muted">
                          Billing Address
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="billingAddress"
                          name="billingAddress"
                          value={billingAddress.billingAddress}
                          onChange={handleBillingAddressChange}
                          placeholder="Billing Address"
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
                          value={billingAddress.state}
                          onChange={handleBillingAddressChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="billingEmail" className="form-label text-uppercase small fw-semibold text-muted">
                          Billing Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="billingEmail"
                          name="billingEmail"
                          value={billingAddress.billingEmail}
                          onChange={handleBillingAddressChange}
                        />
                      </div>
                      <div className="mb-3">
                        <label htmlFor="vatNumber" className="form-label text-uppercase small fw-semibold text-muted">
                          VAT Number
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="vatNumber"
                          name="vatNumber"
                          value={billingAddress.vatNumber}
                          onChange={handleBillingAddressChange}
                          placeholder="Enter VAT Number"
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
                          value={billingAddress.country}
                          onChange={handleBillingAddressChange}
                        >
                          <option value="USA">USA</option>
                          <option value="UK">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                        </select>
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
                          value={billingAddress.zipCode}
                          onChange={handleBillingAddressChange}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button type="submit" className="btn btn-primary">Save changes</button>
                    <button type="button" className="btn btn-outline-secondary">Discard</button>
                  </div>
                </form>
              </div>
            </div>

            {/* Billing History Section */}
            <div className="card shadow-sm">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Billing History</h5>
                  <div className="d-flex align-items-center gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <label className="small text-muted mb-0">Entries per page:</label>
                      <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                        <option>10</option>
                        <option>25</option>
                        <option>50</option>
                      </select>
                    </div>
                    <button className="btn btn-primary btn-sm">+ Create Invoice</button>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div></div>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search Invoice"
                      style={{ width: '200px' }}
                    />
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th className="text-uppercase small fw-semibold text-muted">#ID</th>
                        <th className="text-uppercase small fw-semibold text-muted">Client</th>
                        <th className="text-uppercase small fw-semibold text-muted">Total</th>
                        <th className="text-uppercase small fw-semibold text-muted">Issued Date</th>
                        <th className="text-uppercase small fw-semibold text-muted">Balance</th>
                        <th className="text-uppercase small fw-semibold text-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan="6" className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <p className="text-muted small mb-0">Showing 0 to 0 of 0 entries</p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" disabled>Previous</button>
                    <button className="btn btn-sm btn-outline-secondary" disabled>Next</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-4">Recent Devices</h5>
              <p className="text-muted mb-3">
                We need permission from your browser to show notifications.{' '}
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  onClick={handleRequestPermission}
                >
                  Request Permission
                </button>
              </p>

              <div className="table-responsive mb-4">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-uppercase small fw-semibold text-muted">Type</th>
                      <th className="text-uppercase small fw-semibold text-muted text-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
                          <path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm3.993 5.993l1.414-1.414a.5.5 0 0 1 .707 0L8.5 7.5l2.293-2.293a.5.5 0 0 1 .707.707L9.207 8.207a.5.5 0 0 1-.707 0L6.5 6.207 5.207 7.5a.5.5 0 0 1-.707-.707z"/>
                        </svg>
                        Email
                      </th>
                      <th className="text-uppercase small fw-semibold text-muted text-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
                          <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H2z"/>
                        </svg>
                        Browser
                      </th>
                      <th className="text-uppercase small fw-semibold text-muted text-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="me-1">
                          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                        </svg>
                        App
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="fw-semibold">New for you</td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newForYou.email}
                            onChange={() => handleNotificationToggle('newForYou', 'email')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newForYou.browser}
                            onChange={() => handleNotificationToggle('newForYou', 'browser')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newForYou.app}
                            onChange={() => handleNotificationToggle('newForYou', 'app')}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Account activity</td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.accountActivity.email}
                            onChange={() => handleNotificationToggle('accountActivity', 'email')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.accountActivity.browser}
                            onChange={() => handleNotificationToggle('accountActivity', 'browser')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.accountActivity.app}
                            onChange={() => handleNotificationToggle('accountActivity', 'app')}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">A new browser used to sign in</td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newBrowserSignIn.email}
                            onChange={() => handleNotificationToggle('newBrowserSignIn', 'email')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newBrowserSignIn.browser}
                            onChange={() => handleNotificationToggle('newBrowserSignIn', 'browser')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newBrowserSignIn.app}
                            onChange={() => handleNotificationToggle('newBrowserSignIn', 'app')}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">A new device is linked</td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newDeviceLinked.email}
                            onChange={() => handleNotificationToggle('newDeviceLinked', 'email')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newDeviceLinked.browser}
                            onChange={() => handleNotificationToggle('newDeviceLinked', 'browser')}
                          />
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="form-check d-inline-block">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={notificationSettings.newDeviceLinked.app}
                            onChange={() => handleNotificationToggle('newDeviceLinked', 'app')}
                          />
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mb-4">
                <h6 className="fw-semibold mb-3">When should we send you notifications?</h6>
                <select
                  className="form-select"
                  value={notificationTiming}
                  onChange={(e) => setNotificationTiming(e.target.value)}
                >
                  <option value="online">Only when I'm online</option>
                  <option value="always">Always</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <button type="button" className="btn btn-primary" onClick={handleSaveNotifications}>
                  Save changes
                </button>
                <button type="button" className="btn btn-outline-secondary">Discard</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="row g-4">
            {/* Connected Accounts */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title mb-2">Connected Accounts</h5>
                  <p className="text-muted small mb-4">Display content from your connected accounts on your site</p>
                  
                  <div className="list-group list-group-flush">
                    {/* Google */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">G</span>
                        </div>
                        <div>
                          <div className="fw-semibold">Google</div>
                          <div className="text-muted small">Calendar and contacts</div>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={connectedAccounts.google}
                          onChange={() => handleConnectedAccountToggle('google')}
                        />
                      </div>
                    </div>

                    {/* Slack */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">#</span>
                        </div>
                        <div>
                          <div className="fw-semibold">Slack</div>
                          <div className="text-muted small">Communication</div>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={connectedAccounts.slack}
                          onChange={() => handleConnectedAccountToggle('slack')}
                        />
                      </div>
                    </div>

                    {/* Github */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.683-.103-.253-.446-1.03.097-2.147 0 0 .84-.215 2.75 1.025A9.578 9.578 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.24 2.747-1.025 2.747-1.025.546 1.117.203 1.894.1 2.147.64.695 1.028 1.59 1.028 2.683 0 3.848-2.339 4.695-4.566 4.942.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="fw-semibold">Github</div>
                          <div className="text-muted small">Manage your Git repositories</div>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={connectedAccounts.github}
                          onChange={() => handleConnectedAccountToggle('github')}
                        />
                      </div>
                    </div>

                    {/* Mailchimp */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">M</span>
                        </div>
                        <div>
                          <div className="fw-semibold">Mailchimp</div>
                          <div className="text-muted small">Email marketing service</div>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={connectedAccounts.mailchimp}
                          onChange={() => handleConnectedAccountToggle('mailchimp')}
                        />
                      </div>
                    </div>

                    {/* Asana */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">A</span>
                        </div>
                        <div>
                          <div className="fw-semibold">Asana</div>
                          <div className="text-muted small">Communication</div>
                        </div>
                      </div>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={connectedAccounts.asana}
                          onChange={() => handleConnectedAccountToggle('asana')}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Accounts */}
            <div className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body">
                  <h5 className="card-title mb-2">Social Accounts</h5>
                  <p className="text-muted small mb-4">Display content from social accounts on your site</p>
                  
                  <div className="list-group list-group-flush">
                    {/* Facebook */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">f</span>
                        </div>
                        <div>
                          <div className="fw-semibold">Facebook</div>
                          <div className="text-muted small">
                            {socialAccounts.facebook.connected ? socialAccounts.facebook.username : 'Not Connected'}
                          </div>
                        </div>
                      </div>
                      {socialAccounts.facebook.connected ? (
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleSocialAccountDisconnect('facebook')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 5.5a.5.5 0 0 1 .708 0L8 7.293l1.792-1.793a.5.5 0 1 1 .708.708L8.707 8l1.793 1.792a.5.5 0 0 1-.708.708L8 8.707l-1.792 1.793a.5.5 0 0 1-.708-.708L7.293 8 5.5 6.208a.5.5 0 0 1 0-.708z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="btn btn-link text-muted p-0"
                          onClick={() => handleSocialAccountConnect('facebook')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Twitter */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84"/>
                          </svg>
                        </div>
                        <div>
                          <div className="fw-semibold">Twitter</div>
                          <div className="text-muted small">
                            {socialAccounts.twitter.connected ? socialAccounts.twitter.username : 'Not Connected'}
                          </div>
                        </div>
                      </div>
                      {socialAccounts.twitter.connected ? (
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleSocialAccountDisconnect('twitter')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 5.5a.5.5 0 0 1 .708 0L8 7.293l1.792-1.793a.5.5 0 1 1 .708.708L8.707 8l1.793 1.792a.5.5 0 0 1-.708.708L8 8.707l-1.792 1.793a.5.5 0 0 1-.708-.708L7.293 8 5.5 6.208a.5.5 0 0 1 0-.708z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="btn btn-link text-muted p-0"
                          onClick={() => handleSocialAccountConnect('twitter')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Instagram */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                            <path d="M10 0C7.284 0 6.944.012 5.877.048 4.812.084 4.066.222 3.4.42a5.958 5.958 0 0 0-2.155 1.4A5.958 5.958 0 0 0 .42 3.4C.222 4.066.084 4.812.048 5.877.012 6.944 0 7.284 0 10s.012 3.056.048 4.123c.036 1.065.174 1.811.372 2.477a5.958 5.958 0 0 0 1.4 2.155 5.958 5.958 0 0 0 2.155 1.4c.666.198 1.412.336 2.477.372C6.944 19.988 7.284 20 10 20s3.056-.012 4.123-.048c1.065-.036 1.811-.174 2.477-.372a5.958 5.958 0 0 0 2.155-1.4 5.958 5.958 0 0 0 1.4-2.155c.198-.666.336-1.412.372-2.477C19.988 13.056 20 12.716 20 10s-.012-3.056-.048-4.123c-.036-1.065-.174-1.811-.372-2.477a5.958 5.958 0 0 0-1.4-2.155A5.958 5.958 0 0 0 15.6.42c-.666-.198-1.412-.336-2.477-.372C12.056.012 11.716 0 10 0zm0 1.802c2.203 0 2.266.008 3.042.048.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.04.776.048.84.048 3.041s-.008 2.265-.048 3.041c-.036.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.705.24-1.485.276-.776.04-.84.048-3.042.048s-2.008-.048-3.041c-.036-.78-.166-1.204-.275-1.486a2.478 2.478 0 0 1-.599-.92c-.28-.28-.453-.546-.598-.92-.11-.281-.24-.705-.275-1.485-.04-.776-.048-.84-.048-3.041s.008-2.266.048-3.042c.036-.78.166-1.204.275-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.281-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.841-.047v.002zm0 4.865a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666zm5.338-9.87a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="fw-semibold">Instagram</div>
                          <div className="text-muted small">
                            {socialAccounts.instagram.connected ? socialAccounts.instagram.username : 'Not Connected'}
                          </div>
                        </div>
                      </div>
                      {socialAccounts.instagram.connected ? (
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleSocialAccountDisconnect('instagram')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 5.5a.5.5 0 0 1 .708 0L8 7.293l1.792-1.793a.5.5 0 1 1 .708.708L8.707 8l1.793 1.792a.5.5 0 0 1-.708.708L8 8.707l-1.792 1.793a.5.5 0 0 1-.708-.708L7.293 8 5.5 6.208a.5.5 0 0 1 0-.708z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="btn btn-link text-muted p-0"
                          onClick={() => handleSocialAccountConnect('instagram')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Dribbble */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="10" cy="10" r="3" fill="currentColor"/>
                          </svg>
                        </div>
                        <div>
                          <div className="fw-semibold">Dribbble</div>
                          <div className="text-muted small">
                            {socialAccounts.dribbble.connected ? socialAccounts.dribbble.username : 'Not Connected'}
                          </div>
                        </div>
                      </div>
                      {socialAccounts.dribbble.connected ? (
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleSocialAccountDisconnect('dribbble')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 5.5a.5.5 0 0 1 .708 0L8 7.293l1.792-1.793a.5.5 0 1 1 .708.708L8.707 8l1.793 1.792a.5.5 0 0 1-.708.708L8 8.707l-1.792 1.793a.5.5 0 0 1-.708-.708L7.293 8 5.5 6.208a.5.5 0 0 1 0-.708z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="btn btn-link text-muted p-0"
                          onClick={() => handleSocialAccountConnect('dribbble')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Behance */}
                    <div className="list-group-item d-flex align-items-center justify-content-between border-0 px-0 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold">B</span>
                        </div>
                        <div>
                          <div className="fw-semibold">Behance</div>
                          <div className="text-muted small">
                            {socialAccounts.behance.connected ? socialAccounts.behance.username : 'Not Connected'}
                          </div>
                        </div>
                      </div>
                      {socialAccounts.behance.connected ? (
                        <button
                          className="btn btn-link text-danger p-0"
                          onClick={() => handleSocialAccountDisconnect('behance')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.5 5.5a.5.5 0 0 1 .708 0L8 7.293l1.792-1.793a.5.5 0 1 1 .708.708L8.707 8l1.793 1.792a.5.5 0 0 1-.708.708L8 8.707l-1.792 1.793a.5.5 0 0 1-.708-.708L7.293 8 5.5 6.208a.5.5 0 0 1 0-.708z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      ) : (
                        <button
                          className="btn btn-link text-muted p-0"
                          onClick={() => handleSocialAccountConnect('behance')}
                        >
                          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
                            <path d="M3 0h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V3a3 3 0 0 1 3-3zm0 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2H3z"/>
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;

