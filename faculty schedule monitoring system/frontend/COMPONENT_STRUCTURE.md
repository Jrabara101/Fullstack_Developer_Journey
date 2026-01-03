# Component Structure

This document describes the organization of components and styles in the frontend application.

## Directory Structure

```
src/
├── components/          # React components (JSX files)
│   ├── Dashboard.jsx
│   ├── Layout.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── UserDropdown.jsx
│   ├── FacultySchedule.jsx
│   ├── Profile.jsx
│   ├── Settings.jsx
│   ├── Billing.jsx
│   ├── FAQ.jsx
│   ├── Pricing.jsx
│   └── ProtectedRoute.jsx
│
├── styles/             # CSS stylesheets (separated from components)
│   ├── components/     # Component-specific styles
│   │   ├── Auth.css
│   │   ├── Dashboard.css
│   │   ├── FacultySchedule.css
│   │   ├── Layout.css
│   │   ├── PagePlaceholder.css
│   │   └── UserDropdown.css
│   ├── index.css      # Main styles index
│   └── README.md      # Styles documentation
│
├── contexts/           # React contexts
│   └── AuthContext.jsx
│
├── services/           # API services
│   └── api.js
│
├── App.jsx            # Main app component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## Separation of Concerns

### Components (`/components`)
- Contains only **JSX/JavaScript** files
- Pure React components with no CSS imports
- Uses Bootstrap 5 classes for styling
- Clean, focused on component logic

### Styles (`/styles`)
- Contains all **CSS** files
- Organized by component name
- Can be imported when needed
- Currently not actively used (Bootstrap handles styling)

## Benefits

1. **Better Organization**: Clear separation between logic and styles
2. **Easier Maintenance**: Find styles quickly in dedicated directory
3. **Scalability**: Easy to add new components and styles
4. **Clean Components**: Components focus on functionality, not styling
5. **Flexibility**: Can switch between Bootstrap and custom CSS easily

## Usage Example

### Component File (Dashboard.jsx)
```jsx
import { useEffect, useState } from 'react';
import api from '../services/api';
// No CSS import needed - using Bootstrap

const Dashboard = () => {
  // Component logic here
  return (
    <div className="container">
      {/* Bootstrap classes used */}
    </div>
  );
};
```

### Style File (styles/components/Dashboard.css)
```css
/* Custom styles if needed */
.dashboard-custom-class {
  /* Custom styling */
}
```

### Importing Custom Styles (if needed)
```jsx
import '../styles/components/Dashboard.css';
```

## Current Styling Approach

The application currently uses **Bootstrap 5** for all styling:
- Imported globally in `main.jsx`
- Components use Bootstrap utility classes
- Custom CSS files are available but not imported
- Can be enabled when custom styling is needed

