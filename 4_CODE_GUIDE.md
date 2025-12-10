# Code Guide - How to Read and Understand the Code

This guide teaches you **how to read code** and understand what it does without getting lost.

---

## 🎯 Before You Start

1. **Have a text editor open** - VS Code is best
2. **Have the browser open** - See live changes
3. **Have terminal open** - Run commands
4. **Take notes** - Write down what you learn

---

## 📖 Reading Code: The Method

### 1. Start with Small Files

**Rule:** Always read the smallest file first. It's less overwhelming.

**In frontend:**
- Start with `main.jsx` (usually 5-10 lines)
- Then `App.jsx`
- Then smaller components

**In backend:**
- Start with `package.json` (see what packages are used)
- Then `index.js` (see how server starts)
- Then one controller

### 2. Read Top to Bottom

**How to read:**
1. Start at line 1
2. Read each line
3. When you don't understand something, mark it
4. Keep reading
5. Scroll to bottom
6. Come back and research the marked parts

**Don't:**
- Jump around randomly
- Try to understand everything at once
- Get stuck on one line for 10 minutes

### 3. Identify the Purpose

Ask yourself: "What does this file do?"

**Examples:**
- `main.jsx` - Starts the React app
- `Login.jsx` - Shows login form
- `authController.js` - Handles login logic
- `database.js` - Sets up database

**One sentence rule:** If you can't explain the file in one sentence, read it again.

### 4. Find Key Sections

Every file has sections:

**JavaScript files usually have:**
- Imports (at top)
- Configuration/setup
- Main code/functions
- Exports (at bottom)

**Mark these sections mentally:**
```javascript
// IMPORTS
import express from 'express';
import db from './config/database.js';

// SETUP
const app = express();
app.use(express.json());

// ROUTES
app.get('/api/users', (req, res) => {
  // ... code here
});

// SERVER START
app.listen(5000, () => {
  console.log('Server running');
});
```

### 5. Trace the Flow

**Goal:** Follow the code path from start to end

**Example - Login Flow:**

Step 1: Find where it starts
```javascript
// frontend/src/pages/Login.jsx
function handleLogin() {
  // What function is called?
  api.login(username, password);
}
```

Step 2: Find the API call
```javascript
// frontend/src/services/api.js
export function login(username, password) {
  // What endpoint is called?
  return fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}
```

Step 3: Find the backend route
```javascript
// backend/src/routes/auth.js
router.post('/login', authController.login);
```

Step 4: Find the controller
```javascript
// backend/src/controllers/authController.js
export function login(req, res) {
  // What database query?
  const user = db.prepare('SELECT * FROM users WHERE username = ?')
    .get(req.body.username);
  // ... rest of logic
}
```

You've traced the full flow! 🎉

---

## 🔍 Common Code Patterns

### Pattern 1: Importing Dependencies

```javascript
import express from 'express';  // External package
import { UserModel } from './models/User.js';  // Your code
```

**What it means:**
- `import X from 'Y'` - Load code from somewhere
- `'express'` - Package installed via npm
- `'./models/User.js'` - Your own file (relative path)

### Pattern 2: Functions

```javascript
// Function definition
function handleLogin(username, password) {
  // Code inside runs when function is called
  console.log("User:", username);
}

// Function call
handleLogin('admin', 'password');
```

**What it means:**
- Define once, call many times
- Parameters are inputs (username, password)
- Code inside runs when you call it

### Pattern 3: Async/Await (Promise handling)

```javascript
// Async function - does something that takes time
async function fetchUsers() {
  // await - wait for this to finish before continuing
  const response = await fetch('/api/users');
  const data = await response.json();
  return data;
}
```

**What it means:**
- Fetch takes time (network request)
- `await` pauses here until response comes back
- Then continues to next line
- Avoids blocking the rest of the code

### Pattern 4: Database Query

```javascript
// Query the database
const user = db.prepare('SELECT * FROM users WHERE username = ?')
  .get(username);

// INSERT
db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
  .run(username, hashedPassword);

// UPDATE
db.prepare('UPDATE users SET password = ? WHERE id = ?')
  .run(newHash, userId);
```

**What it means:**
- `?` is a placeholder (security feature)
- `.get()` returns one row
- `.run()` executes but doesn't return
- `.all()` returns all matching rows

### Pattern 5: React Components

```javascript
// Component - a reusable UI piece
function LoginForm() {
  return (
    <div>
      <input type="text" placeholder="Username" />
      <button onClick={handleClick}>Login</button>
    </div>
  );
}

export default LoginForm;
```

**What it means:**
- Component returns JSX (looks like HTML but is JavaScript)
- Can be imported and used in other files
- `onClick={handleClick}` - runs function when clicked

### Pattern 6: State in React

```javascript
import { useState } from 'react';

function LoginForm() {
  const [username, setUsername] = useState('');
  
  return (
    <input 
      value={username}
      onChange={(e) => setUsername(e.target.value)}
    />
  );
}
```

**What it means:**
- `useState` - Create a variable that React watches
- When it changes, component re-renders
- `setUsername` - Update the variable
- Component automatically updates in browser

### Pattern 7: Middleware

```javascript
// Middleware - code that runs on every request
app.use(authMiddleware);

function authMiddleware(req, res, next) {
  // Check if user is logged in
  if (!req.headers.authorization) {
    return res.status(401).json({ error: 'Not authorized' });
  }
  // If authorized, continue
  next();
}
```

**What it means:**
- Middleware runs before the actual route handler
- `next()` - Pass control to next middleware or route
- Used for authentication, logging, validation, etc

---

## 🛠️ Debugging Code

### Technique 1: Console Logging

**Add to your code:**
```javascript
console.log("Variable value:", variable);
console.log("About to call function");
```

**See output:**
- Backend: Terminal where you ran `npm run dev`
- Frontend: Browser DevTools (F12 → Console)

**Use for:**
- See what value a variable has
- Track if code is running
- Check function parameters

### Technique 2: Break at a Point

**Frontend (browser DevTools):**
1. Press F12
2. Go to "Sources" tab
3. Click line number to add breakpoint
4. Reload page
5. Code pauses at that line
6. Inspect variables
7. Click play to continue

**Backend:**
1. Add `debugger;` statement in code
2. Run with: `node --inspect-brk backend/src/index.js`
3. Open Chrome DevTools
4. Step through code

### Technique 3: Read Error Messages

**Error messages tell you:**
- What went wrong
- Which file and line number
- What caused it

**Example:**
```
TypeError: Cannot read property 'username' of undefined
at authController.login (backend/src/controllers/authController.js:5:20)
```

**Translation:**
- Line 5 in authController.js
- Trying to access `.username` on something that's undefined
- Probably `req.body` is missing or empty

**Fix:**
- Check why req.body is empty
- Add validation to check if it exists
- Print req.body to see what's there

---

## 📚 Files to Read First (In Order)

### Frontend

1. **`frontend/src/main.jsx`** (2-5 lines)
   - Starting point
   - Mounts React to HTML

2. **`frontend/src/App.jsx`** (10-30 lines)
   - Main app structure
   - Routes setup

3. **`frontend/src/pages/Login.jsx`** (20-50 lines)
   - Login form
   - API call
   - Token handling

4. **`frontend/src/components/`** (pick one small file)
   - Single component
   - See how React components work

### Backend

1. **`backend/src/index.js`** (5-30 lines)
   - Server startup
   - Middleware setup
   - Port configuration

2. **`backend/src/config/database.js`** (20-50 lines)
   - Database schema
   - Table definitions
   - How data is structured

3. **`backend/src/routes/auth.js`** or similar (10-30 lines)
   - API endpoints
   - Request/response flow

4. **`backend/src/controllers/authController.js`** (20-50 lines)
   - Business logic
   - Database operations
   - Validation

---

## 🎯 Reading a New File: Step by Step

**Assume you're reading `authController.js`**

### Step 1: Read imports (top)
```javascript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/database.js';
```
**Question:** What do these do?
- bcrypt: Hash passwords
- jwt: Create tokens
- db: Database access

### Step 2: Understand purpose
Read the first function name: `login()`, `register()`, etc.
**Question:** What does this file do?
Answer: "Handles user authentication (login, register, etc)"

### Step 3: Find and read one function
```javascript
export function login(req, res) {
  // 1. Get data from request
  const { username, password } = req.body;
  
  // 2. Query database
  const user = db.prepare('SELECT * FROM users WHERE username = ?')
    .get(username);
  
  // 3. Check if user exists
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 4. Compare passwords
  const passwordMatch = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // 5. Create token
  const token = jwt.sign({ id: user.id }, 'secret-key');
  
  // 6. Send response
  res.json({ token, user: { id: user.id, username: user.username } });
}
```

**Read and mark each section:**
1. ✅ Get data from request - makes sense
2. ✅ Query database - makes sense
3. ✅ Check if user exists - makes sense
4. ❓ What is `bcrypt.compareSync`? (mark to research)
5. ✅ Create token - makes sense
6. ✅ Send response - makes sense

### Step 4: Research unclear parts
Google "bcrypt compareSync" or "how does bcrypt work"
Read one article
Come back and re-read that section

### Step 5: Write it in your own words
"Login function gets username/password, checks database, compares password using bcrypt, creates JWT token if valid, and sends token back"

---

## 💡 Tips for Understanding Code

1. **Don't read too much at once** - 1 file per session
2. **Run the code** - Make changes and see what happens
3. **Take notes** - Write what you understand
4. **Ask why** - Why this function? Why this name?
5. **Compare files** - See similarities in patterns
6. **Test it** - Add console.log to see what happens
7. **Read others' code** - Find the same pattern in 2 files
8. **Explain it** - Teach someone else what you learned

---

## 🚀 Next Steps

Now you know HOW to read code:

1. **Read [5_COMMON_TASKS.md](5_COMMON_TASKS.md)** - Learn what to do with it
2. **Start with small files** - Pick one and read it
3. **Take notes** - Document what you learn
4. **Make changes** - Edit code and test it
5. **Debug** - Use console.log to understand flow

---

## ✅ Checklist

- [ ] Understand how to read top-to-bottom
- [ ] Know the "One Sentence" rule
- [ ] Able to trace a flow from frontend to backend
- [ ] Understand common patterns (imports, functions, async, etc)
- [ ] Know how to use console.log for debugging
- [ ] Have a list of files to read in order
- [ ] Ready to read actual code in the project

---

**Start with frontend/src/main.jsx - it's only 5-10 lines!** 🎯

Next: [5_COMMON_TASKS.md](5_COMMON_TASKS.md)
