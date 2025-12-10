# Getting Started - Setup & First Run

This guide will get your project running in **5 minutes**.

---

## Step 1: Install Node.js (if not already installed)

**Check if installed:**
```bash
node --version
npm --version
```

If you see version numbers, you're good! If not:
- Download from: https://nodejs.org (choose LTS version)
- Install and verify with commands above

---

## Step 2: Open a Terminal in Project Folder

Navigate to your project:
```bash
cd C:\Users\rafae_le5l7xt\PAP
```

---

## Step 3: Install All Dependencies

Run this ONE command (it installs for root, backend, and frontend):

```bash
npm install && cd backend && npm install && cd ../frontend && npm install && cd ..
```

**What's happening:**
- `npm install` - Installs root dependencies
- `cd backend && npm install` - Installs Express and backend packages
- `cd ../frontend && npm install` - Installs React and frontend packages
- `cd ..` - Returns to project root

**Wait for it to finish** (might take 1-2 minutes on first run)

---

## Step 4: Initialize the Database

```bash
cd backend && npm run migrate
```

This creates the SQLite database with the admin user:
- **Username:** admin
- **Password:** admin

---

## Step 5: Start the Backend (Terminal 1)

Keep the terminal open:
```bash
cd backend && npm run dev
```

You should see:
```
✓ Server running on http://localhost:5000
```

**Keep this running!** Don't close this terminal.

---

## Step 6: Start the Frontend (Terminal 2)

Open a **NEW terminal** in the project folder:
```bash
cd frontend && npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173
```

---

## Step 7: Open in Browser

Click or visit: **http://localhost:5173**

You should see the **login page**.

---

## Step 8: Login

Use:
- **Username:** admin
- **Password:** admin

If successful, you'll see a **dashboard** 🎉

---

## ✅ Troubleshooting

### "Port already in use"
If you see `EADDRINUSE` error:

**For Backend (port 5000):**
```bash
cd backend
# Edit .env and change PORT=5001
```

**For Frontend (port 5173):**
```bash
cd frontend
# Edit vite.config.js and change port in server config
```

### "npm: command not found"
Node.js isn't installed. Download from https://nodejs.org

### "Cannot find module"
Clear and reinstall:
```bash
rm -r node_modules package-lock.json
npm install
```

### Login doesn't work
Make sure you ran:
```bash
cd backend && npm run migrate
```

---

## 🎯 What's Next?

Now that it's running:

1. **Explore the app** - Click around the dashboard
2. **Read [2_LEARNING_PATH.md](2_LEARNING_PATH.md)** - Understand how to learn
3. **Read [3_TECH_STACK_EXPLAINED.md](3_TECH_STACK_EXPLAINED.md)** - Learn the tech
4. **Read [4_CODE_GUIDE.md](4_CODE_GUIDE.md)** - Understand the code

---

## 💡 Remember

- **Backend terminal** must stay running (port 5000)
- **Frontend terminal** must stay running (port 5173)
- If you close either, just restart it with the commands above
- Both need to be running at the same time

**Ready to learn? Read [2_LEARNING_PATH.md](2_LEARNING_PATH.md) next!** 🚀
