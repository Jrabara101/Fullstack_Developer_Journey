# Styles Directory

This directory contains all CSS stylesheets for the application, separated from component files for better organization.

## Structure

```
styles/
├── components/          # Component-specific styles
│   ├── Auth.css        # Login and Register page styles
│   ├── Dashboard.css   # Dashboard component styles
│   ├── FacultySchedule.css  # Schedule component styles
│   ├── Layout.css      # Layout and navigation styles
│   ├── PagePlaceholder.css  # Placeholder page styles
│   └── UserDropdown.css     # User dropdown menu styles
└── index.css           # Main styles index (imports all styles)
```

## Usage

### Import Individual Styles

If you need to use custom styles in a component:

```jsx
import '../styles/components/Dashboard.css';
```

### Import All Styles

To import all styles at once:

```jsx
import '../styles/index.css';
```

## Note

Currently, the application uses **Bootstrap 5** for styling, so most of these CSS files are not actively imported. They are kept here for:
- Future custom styling needs
- Overriding Bootstrap styles
- Component-specific animations or effects

## Bootstrap 5

Bootstrap 5 is imported globally in `main.jsx`:

```jsx
import 'bootstrap/dist/css/bootstrap.min.css'
```

Most components use Bootstrap utility classes instead of custom CSS.

