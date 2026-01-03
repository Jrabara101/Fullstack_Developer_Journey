# Profile Directory

This directory contains all profile-related components and styles.

## Structure

```
profile/
├── components/          # Profile components
│   └── AccountSettings.jsx  # Main account settings component
└── styles/             # Profile-specific styles
    └── AccountSettings.css   # Account settings styles
```

## Components

### AccountSettings

The main account settings component that includes:
- Profile picture upload
- User information form (two columns)
- Account deletion section
- Tab navigation (Account, Security, Billing, Notifications, Connections)

## Usage

The AccountSettings component is imported in the main Profile component:

```jsx
import AccountSettings from '../profile/components/AccountSettings';
```

## Features

- **Profile Picture Upload**: Upload and reset profile images
- **Form Fields**: Two-column layout with all user information fields
- **Tab Navigation**: Multiple tabs for different settings sections
- **Account Deletion**: Secure account deactivation with confirmation
- **Bootstrap 5**: Uses Bootstrap for responsive design

