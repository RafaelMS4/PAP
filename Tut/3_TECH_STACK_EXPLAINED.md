# Tech Stack Explained - What Each Technology Does

This guide explains **what each technology is** and **why we use it**, in simple terms.

---

## 🏗️ Architecture Overview

```
User's Browser (Frontend)
    ↓
    ↓ HTTP Requests
    ↓
Express Server (Backend)
    ↓
    ↓ SQL Queries
    ↓
SQLite Database
```

---

## 🎨 Frontend: React + Vite

### What is React?

**Simple definition:** A JavaScript library for building user interfaces.

**What it does:**
- Builds the web pages users see in their browser
- Makes interactive buttons, forms, and displays
- Updates the page without refreshing (smooth UX)
- Manages what data each part of the page needs

**Example:**
```javascript
// React component - a reusable piece of UI
function LoginForm() {
  return (
    <div>
      <input type="text" placeholder="Username" />
      <button>Login</button>
    </div>
  );
}
```

### What is Vite?

**Simple definition:** A tool that makes React development faster.

**What it does:**
- Builds your React code into a format browsers understand
- Hot Module Replacement (HMR) - updates your browser instantly when you save
- Makes development super fast
- Optimizes code for production

**Example of HMR:**
1. You edit a component
2. You save the file (Ctrl+S)
3. Browser updates immediately - no manual refresh needed

### Frontend Folder Structure

```
frontend/
├── src/
│   ├── main.jsx           ← Entry point (first thing that runs)
│   ├── App.jsx            ← Root component
│   ├── App.css            ← Styles
│   ├── components/        ← Reusable components (Button, Modal, etc)
│   ├── pages/             ← Full page components (Login, Dashboard, etc)
│   └── services/          ← API calls and utilities
├── index.html             ← HTML file (very minimal)
└── vite.config.js         ← Vite configuration
```

---

## 🖥️ Backend: Express.js

### What is Express?

**Simple definition:** A framework for building web servers in Node.js.

**What it does:**
- Runs on the server (your computer or cloud server)
- Listens for requests from the frontend
- Processes requests and returns responses
- Manages API endpoints (like `/api/users`, `/api/login`, etc)
- Handles database operations

**Example:**
```javascript
// Express route - responds to HTTP requests
app.get('/api/users', (req, res) => {
  // Get users from database
  res.json({ users: [...] }); // Send back JSON data
});
```

### What is Node.js?

**Simple definition:** JavaScript that runs on a server, not in a browser.

**Why use it?**
- Write backend code in JavaScript (same language as frontend)
- Lightweight and fast
- Great for building APIs
- Easy to run locally for development

### Backend Folder Structure

```
backend/
├── src/
│   ├── index.js           ← Server entry point (starts the server)
│   ├── config/
│   │   └── database.js    ← Database setup and tables
│   ├── models/            ← Database model definitions
│   ├── controllers/       ← Business logic (what to do with requests)
│   ├── routes/            ← API endpoints (URLs)
│   └── middleware/        ← Authentication, validation
├── package.json           ← Dependencies and scripts
└── .env                   ← Configuration (port, database path, etc)
```

---

## 🗄️ Database: SQLite

### What is SQLite?

**Simple definition:** A small, file-based database.

**What it does:**
- Stores application data (users, tickets, etc)
- Allows you to query data with SQL
- Works without a separate server (unlike MySQL, PostgreSQL)
- Good for small to medium projects
- Stores everything in a single `.db` file

**Why use it?**
- No installation needed (except Node package)
- Perfect for development
- Can be swapped for MySQL/PostgreSQL later
- Simple and fast

### How Data is Organized

**Table:** Like a spreadsheet with rows and columns

```
USERS table:
┌─────┬──────────┬──────────────────┐
│ id  │ username │ password_hash    │
├─────┼──────────┼──────────────────┤
│ 1   │ admin    │ $2b$10$hash...   │
│ 2   │ john     │ $2b$10$hash...   │
│ 3   │ sarah    │ $2b$10$hash...   │
└─────┴──────────┴──────────────────┘
```

**SQL Query:** Asking the database for information

```sql
-- Get user with username 'admin'
SELECT * FROM users WHERE username = 'admin';

-- Get all users
SELECT * FROM users;

-- Update user's password
UPDATE users SET password_hash = 'new_hash' WHERE id = 1;
```

---

## 🔄 How Everything Works Together

### The Flow: User Logs In

**Step 1: User types username and password**
- Happens in the browser (frontend)
- User clicks "Login" button

**Step 2: Frontend sends request**
```
POST http://localhost:5000/api/auth/login
{
  "username": "admin",
  "password": "admin"
}
```

**Step 3: Backend receives request**
- Express route `/api/auth/login` catches it
- Controller `authController.login()` handles it

**Step 4: Backend queries database**
```sql
SELECT * FROM users WHERE username = 'admin';
```

**Step 5: Backend validates password**
- Gets the hash from database
- Compares with what user sent
- Matches? ✅ Continue. Doesn't match? ❌ Reject.

**Step 6: Backend sends token back**
```
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "admin" }
}
```

**Step 7: Frontend receives and stores token**
- Stores in browser's `localStorage`
- Uses it for future requests

**Step 8: Frontend redirects to dashboard**
- User sees dashboard
- Future API calls include the token
- Backend verifies token before responding

---

## 🔐 Security Concepts

### JWT (JSON Web Tokens)

**What is it?** A way to securely identify users

**How it works:**
1. User logs in with username/password
2. Backend creates a JWT token (like a digital ID card)
3. Frontend stores this token
4. For every request, frontend sends the token
5. Backend verifies the token is valid
6. If valid, process the request. If invalid, reject it.

**Why secure?**
- Token is digitally signed by the backend
- Frontend can't fake or modify it
- Backend can verify it hasn't been tampered with

### Password Hashing

**What is it?** Converting passwords into unreadable text

**Why?**
- Database stores hashes, not real passwords
- Even if database leaks, passwords are safe
- User's hash won't match someone else's

**Example:**
```
Real password: "admin"
Stored hash:   "$2b$10$abcd1234efgh5678ijkl9012"

Later, user logs in with "admin"
Backend hashes it: "$2b$10$abcd1234efgh5678ijkl9012"
Matches! ✅ Login successful
```

---

## 📡 API Endpoints

### What is an API?

**Simple definition:** A way for the frontend to ask the backend to do things.

**Common Endpoints in This App:**

| Method | URL | Purpose |
|--------|-----|---------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get specific user |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### HTTP Methods

- **GET** - Retrieve data (read only)
- **POST** - Create new data
- **PUT/PATCH** - Update existing data
- **DELETE** - Remove data

---

## 🛠️ Development Tools

### npm (Node Package Manager)

**What is it?** A tool for managing project dependencies

**Commands you'll use:**
```bash
npm install        # Install all dependencies listed in package.json
npm run dev        # Run the development server (defined in package.json)
npm run build      # Build for production
npm run migrate    # Custom command to set up database
```

### package.json

**What is it?** A file that describes your project

**Contains:**
- Project name and version
- List of dependencies (packages you need)
- Scripts (commands like `npm run dev`)
- Project metadata

---

## 🔄 Development Workflow

### Making Changes

**Frontend Changes:**
1. Edit a `.jsx` or `.css` file
2. Save (Ctrl+S)
3. Browser updates automatically (HMR)
4. No server restart needed

**Backend Changes:**
1. Edit a `.js` file
2. Save (Ctrl+S)
3. Nodemon detects change and restarts server
4. Browser might need refresh, but server is restarted

**Database Changes:**
1. Edit `backend/src/config/database.js`
2. Run `npm run migrate` (backend folder)
3. Database is updated
4. Restart backend server

---

## 🎯 Key Takeaways

| Component | Purpose | Runs On | Port |
|-----------|---------|---------|------|
| **React + Vite** | User interface | Browser | 5173 |
| **Express** | API server | Your computer | 5000 |
| **SQLite** | Data storage | Your computer | (file) |

### Communication

```
Browser (port 5173)
    ↓ fetch/axios calls
Express (port 5000)
    ↓ SQL queries
SQLite (file)
    ↓ returns data
Express (port 5000)
    ↓ JSON response
Browser (port 5173)
```

---

## 📚 Further Reading

- **React Docs:** https://react.dev
- **Express Docs:** https://expressjs.com
- **MDN JavaScript:** https://developer.mozilla.org/en-US/docs/Web/JavaScript
- **SQLite Docs:** https://www.sqlite.org/docs.html

---

## ✅ Concepts to Understand

- [ ] React is for building UIs
- [ ] Express is for building servers
- [ ] SQLite stores data
- [ ] JWT tokens identify users
- [ ] Passwords are hashed for security
- [ ] Frontend and backend communicate via HTTP
- [ ] APIs are endpoints that receive/return data
- [ ] npm manages project dependencies

---

**Next: Read [4_CODE_GUIDE.md](4_CODE_GUIDE.md) to learn how to read the actual code!** 🚀
