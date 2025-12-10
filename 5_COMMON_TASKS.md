# Common Tasks - Learn By Doing

This guide shows you **HOW TO DO** common development tasks. Try these on your own before asking for help.

---

## 📋 Beginner Tasks (Start Here)

### Task 1: Change Text on a Page

**Goal:** Edit what users see

**Steps:**
1. Open `frontend/src/pages/Login.jsx`
2. Find text like "Admin Login" or "Login"
3. Change it to something else
4. Save file (Ctrl+S)
5. Check browser - it updated!

**What you learned:**
- How to edit React files
- Hot reload works instantly
- Text comes from component's JSX

**Experiment:**
- Change button text
- Change input placeholder
- Change error messages

---

### Task 2: Change a Color

**Goal:** Modify the design

**Steps:**
1. In browser, open DevTools (F12)
2. Right-click on element → "Inspect"
3. Find the color code (like `#0f3460` or `rgb(...)`)
4. Look for where it's defined:
   - In `src/App.css` or similar
   - Or inline in the component
5. Change the color code
6. Save file
7. Browser updates

**What you learned:**
- How to use browser DevTools to inspect elements
- Where CSS comes from
- How colors are defined

**Experiment:**
- Change button color
- Change background color
- Change text color

---

### Task 3: Add a Console Message

**Goal:** Understand where code runs

**Backend:**
1. Open `backend/src/index.js`
2. Add: `console.log("Server is starting...");`
3. Save and restart server (Ctrl+C, then `npm run dev`)
4. Look at terminal - see your message!

**Frontend:**
1. Open `frontend/src/App.jsx`
2. Add: `console.log("App component loaded");`
3. Save (no restart needed)
4. Open browser DevTools (F12 → Console)
5. See your message!

**What you learned:**
- How to debug with console.log
- Backend logs appear in terminal
- Frontend logs appear in browser

**Experiment:**
- Add logs in different files
- Log variable values: `console.log("User:", user);`
- See when code runs

---

## 🔧 Intermediate Tasks

### Task 4: Create a New API Endpoint

**Goal:** Add a simple endpoint that returns data

**Backend Steps:**

1. **Find existing route file:**
   ```bash
   # Open: backend/src/routes/auth.js or similar
   ```

2. **See the pattern:**
   ```javascript
   router.post('/login', authController.login);
   ```

3. **Add a new endpoint:**
   ```javascript
   // At end of file, before export
   router.get('/test', (req, res) => {
     res.json({ message: 'This is a test endpoint' });
   });
   ```

4. **Save file**

5. **Restart backend** (Ctrl+C, then `npm run dev`)

6. **Test it:**
   - Open: http://localhost:5000/api/test
   - You should see: `{"message":"This is a test endpoint"}`

**What you learned:**
- How to create API routes
- How to return JSON
- Backend must restart for changes

---

### Task 5: Call API from Frontend

**Goal:** Make frontend talk to your new endpoint

**Frontend Steps:**

1. **Find where API calls are made:**
   - Look in `frontend/src/` for files with `fetch` or `axios`
   - Or create a new one

2. **Add your API call:**
   ```javascript
   async function testAPI() {
     const response = await fetch('http://localhost:5000/api/test');
     const data = await response.json();
     console.log("Response:", data);
   }
   ```

3. **Call it from a component:**
   ```javascript
   import { useState } from 'react';
   
   export function TestComponent() {
     const [result, setResult] = useState(null);
     
     async function handleClick() {
       const response = await fetch('http://localhost:5000/api/test');
       const data = await response.json();
       setResult(data.message);
     }
     
     return (
       <div>
         <button onClick={handleClick}>Test API</button>
         {result && <p>{result}</p>}
       </div>
     );
   }
   ```

4. **Import and use it somewhere:**
   ```javascript
   // In App.jsx or another page
   import { TestComponent } from './components/TestComponent.jsx';
   
   export default function App() {
     return (
       <div>
         <TestComponent />
       </div>
     );
   }
   ```

5. **Test:**
   - Click button in browser
   - See response appear
   - Check browser DevTools Console

**What you learned:**
- How to make API calls from frontend
- How to handle responses
- How frontend and backend communicate

---

### Task 6: Add Data to Database

**Goal:** Store data permanently

**Database Changes:**

1. **Open:** `backend/src/config/database.js`
2. **Find where tables are created:**
   ```javascript
   const db = new Database(':memory:'); // or file path
   db.exec(`CREATE TABLE users (...)`);
   ```

3. **Add a new field to a table:**
   ```javascript
   // Find the table definition
   db.exec(`CREATE TABLE users (
     id INTEGER PRIMARY KEY,
     username TEXT UNIQUE NOT NULL,
     password_hash TEXT NOT NULL,
     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
     email TEXT  // NEW FIELD
   )`);
   ```

4. **Restart and run migration:**
   ```bash
   cd backend
   npm run migrate
   ```

5. **Update controller to use new field:**
   ```javascript
   // In authController.js
   const user = {
     id: user.id,
     username: user.username,
     email: user.email  // NEW
   };
   ```

6. **Test:**
   - Login and check if user object has email

**What you learned:**
- How database tables are structured
- How to add new fields
- How to update code to use new data

---

### Task 7: Add Validation

**Goal:** Check data is correct before saving

**Example: Validate email format**

```javascript
// In controller
function register(req, res) {
  const { email, password } = req.body;
  
  // Validation
  if (!email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be 6+ characters' });
  }
  
  // If validation passes, continue...
}
```

**Test:**
- Try invalid email → See error
- Try short password → See error
- Valid data → Success

**What you learned:**
- How validation works
- How to return error responses
- When to validate (before saving)

---

## 🎯 Real Feature Tasks

### Task 8: Add a New Page

**Goal:** Create a new screen in the app

**Steps:**

1. **Create file:** `frontend/src/pages/NewPage.jsx`
   ```javascript
   export default function NewPage() {
     return (
       <div>
         <h1>My New Page</h1>
         <p>This is a new page</p>
       </div>
     );
   }
   ```

2. **Add route to App.jsx:**
   ```javascript
   // Find routing setup
   import NewPage from './pages/NewPage.jsx';
   
   // Add route
   <Route path="/new" element={<NewPage />} />
   ```

3. **Add link to navigate:**
   ```javascript
   <Link to="/new">Go to New Page</Link>
   ```

4. **Test:**
   - Click link
   - See your new page

**What you learned:**
- How to create pages
- How routing works
- How to link between pages

---

### Task 9: Display Data from API

**Goal:** Fetch data and show it on screen

**Steps:**

1. **Create component:**
   ```javascript
   import { useState, useEffect } from 'react';
   
   export function UserList() {
     const [users, setUsers] = useState([]);
     const [loading, setLoading] = useState(true);
   
     useEffect(() => {
       async function fetchUsers() {
         try {
           const response = await fetch('http://localhost:5000/api/users');
           const data = await response.json();
           setUsers(data.users);
         } catch (error) {
           console.error("Error:", error);
         } finally {
           setLoading(false);
         }
       }
       fetchUsers();
     }, []); // Empty array = run once on load
   
     if (loading) return <p>Loading...</p>;
     
     return (
       <div>
         <h2>Users</h2>
         {users.map(user => (
           <div key={user.id}>
             <p>{user.username}</p>
           </div>
         ))}
       </div>
     );
   }
   ```

2. **Use component somewhere:**
   ```javascript
   import { UserList } from './components/UserList.jsx';
   
   // In a page or App
   <UserList />
   ```

3. **Test:**
   - See loading message
   - Then see users list

**What you learned:**
- useEffect hook for loading data
- How to display lists
- Error handling
- Conditional rendering

---

### Task 10: Create a Form

**Goal:** Get user input and send to API

**Steps:**

```javascript
import { useState } from 'react';

export function AddUserForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create user');
        return;
      }

      // Success - clear form
      setUsername('');
      setPassword('');
      alert('User created!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

**What you learned:**
- How forms work in React
- How to handle input changes
- How to send POST requests
- Error handling

---

## 🐛 Debugging Tasks

### Task 11: Find and Fix a Bug

**Steps:**

1. **Find the problem:**
   - What's not working?
   - Get error message
   - Check browser console (F12)
   - Check backend terminal

2. **Use console.log:**
   ```javascript
   // Add logging to track flow
   console.log("Before API call");
   const response = await fetch(...);
   console.log("After API call, response:", response);
   ```

3. **Check error message:**
   - Read it carefully
   - It tells you the file and line
   - It tells you what's wrong

4. **Try fixes:**
   - Change the code
   - Test
   - If not fixed, revert and try different fix

5. **Understand why:**
   - Why was there a bug?
   - How did you fix it?
   - Will it happen again?

**Example Bug Hunt:**
```
Error: "Cannot read property 'username' of undefined"
  → Line 15 in Login.jsx
  → user object is undefined
  → Why? Because API response wasn't what we expected
  → Fix: Add error handling, check response structure
```

---

### Task 12: Add Error Handling

**Goal:** Handle problems gracefully

**Frontend:**
```javascript
async function fetchData() {
  try {
    const response = await fetch('http://localhost:5000/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch failed:", error);
    // Show user-friendly message
    alert('Failed to load data. Please try again.');
    return null;
  }
}
```

**Backend:**
```javascript
router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    res.json({ users });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
```

**What you learned:**
- Try/catch for error handling
- HTTP status codes
- User-friendly error messages

---

## ✅ Task Completion Checklist

**Beginner (Must Do):**
- [ ] Task 1: Change text
- [ ] Task 2: Change color
- [ ] Task 3: Add console message

**Intermediate (Should Do):**
- [ ] Task 4: Create API endpoint
- [ ] Task 5: Call API from frontend
- [ ] Task 6: Add database field

**Advanced (Challenge):**
- [ ] Task 7: Add validation
- [ ] Task 8: Create new page
- [ ] Task 9: Display data from API
- [ ] Task 10: Create form

**Debugging (Important):**
- [ ] Task 11: Find and fix bug
- [ ] Task 12: Add error handling

---

## 💡 Before You Ask for Help

1. **Read error messages** - They often tell you the answer
2. **Console.log everything** - See what's actually happening
3. **Google the error** - Usually someone had the same problem
4. **Try a different approach** - There's often multiple ways
5. **Read documentation** - Check official docs for that library
6. **Ask a human** - Before asking AI
7. **Then ask AI** - If still stuck after 30+ minutes

---

## 🚀 Next

- Pick a task above
- Try it completely on your own first
- Only check this guide if you get stuck
- Take notes on what you learn
- Celebrate when it works! 🎉

---

**Go build something! Pick Task 1 and start.** 🚀
