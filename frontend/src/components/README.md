# Components Folder

Reusable React components for the IT HelpDesk Management System.

## 📂 Structure

- **Card.jsx** - Container component for content cards
- **Button.jsx** - Reusable button component with variants (primary, secondary, danger)
- **FormInput.jsx** - Input field with label, error handling, and validation
- **LoadingSpinner.jsx** - Loading indicator component
- **Alert.jsx** - Alert/notification component (info, success, warning, error)
- **Navbar.jsx** - Navigation bar with user info and logout
- **index.js** - Central export file (use named imports from here)

## 🎯 Usage Examples

### Importing Components

```javascript
// Option 1: From index.js (recommended)
import { Card, Button, FormInput } from '../components'

// Option 2: Direct import
import Card from '../components/Card'
```

### Using Card Component

```javascript
<Card title="Dashboard">
  <p>Content goes here</p>
</Card>
```

### Using Button Component

```javascript
<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>

<Button variant="danger" disabled={isLoading}>
  Delete
</Button>
```

### Using FormInput Component

```javascript
<FormInput
  label="Username"
  id="username"
  type="text"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  placeholder="Enter username"
  error={error}
  required
/>
```

### Using LoadingSpinner Component

```javascript
{loading && <LoadingSpinner message="Loading dashboard..." />}
```

### Using Alert Component

```javascript
{error && (
  <Alert 
    type="error" 
    message={error}
    onClose={() => setError('')}
  />
)}
```

### Using Navbar Component

```javascript
<Navbar 
  brand="IT HelpDesk"
  user={currentUser}
  onLogout={handleLogout}
/>
```

## 💡 Tips

- All components are reusable across multiple pages
- Use the `index.js` for cleaner imports
- Components accept `className` prop for custom styling
- Components follow React best practices
- Check existing page files to see real usage examples

## 🎨 Styling

All component styles are defined in `components.css`. Components use standard CSS classes:
- Button: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- Card: `.card`, `.card-title`, `.card-content`
- FormInput: `.form-input-group`, `.form-input-label`, `.form-input-field`
- Alert: `.alert`, `.alert-info`, `.alert-success`, `.alert-warning`, `.alert-error`
- Navbar: `.navbar`, `.navbar-user`, `.navbar-username`, `.navbar-role`
- LoadingSpinner: `.loading-spinner-container`, `.spinner`
