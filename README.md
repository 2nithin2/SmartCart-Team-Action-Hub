# 🛒 DMart Real-Time Shopping List & Group Task Assigner

A modern, mobile-friendly collaborative web application designed for DMart shopping follow-ups and team task delegation. Built for real-time synchronization across multiple users and phones.

---

## ✨ Features

### 1. 🛒 DMart Shopping List (`1st Floor & 2nd Floor`)
- **Pre-seeded with all 81 items** parsed directly from `dmart list.docx`:
  - **1st Floor**: Grains, Staples, Dals, Spices, Flours, Oils, Snacks (52 items)
  - **2nd Floor**: Detergents, Cleaning, Toiletries, Pooja items, Bath & Body (29 items)
- **Detailed Item Fields**:
  - **Quantity (Qty)** with quick `+` / `-` steppers for easy one-hand mobile shopping
  - **Unit / Pieces (Pcs)**: `pcs`, `kg`, `gm`, `packet`, `bottle`, `bundle`, `litres`, `box`, `bag`, `dozen`
  - **Size / Specs**: e.g. `25 kgs`, `1/2 kg (500g)`, `1 Litre`, `50 gm`, `24 clips`, etc.
  - **Floor / Department**: `1st Floor`, `2nd Floor`, or create custom floors
  - **Assigned To**: Assign specific grocery items to family or team members (e.g. Nithin, Rahul, Priya)
  - **Notes / Special Instructions**: Brand preference, offers, or packaging details
  - **Status**: Click to mark purchased (strikethrough animation + celebratory confetti when floor is complete!)
- **Quick 1-Tap Add Bar** & Full Detailed Modal.
- **Instant Search & Filters**: Filter by Floor, Pending/Purchased, or Assignee.
- **Copy for WhatsApp**: Formats the list with checkboxes for 1-click sharing.

### 2. 👥 Group Action & Task Management
- **Assign Tasks by Name**: Follow up on shopping actions, price checks, offers, bill verifications, or pick-ups.
- **Team Member Management**: Add and manage team members by name.
- **Filter by Assignee**: Click any team member to see only their tasks.
- **Task Tracking**:
  - Priority levels: `Urgent`, `High`, `Medium`, `Low`
  - Status stages: `To Do`, `In Progress`, `Follow Up`, `Completed`
  - Due date & Category tags
  - Detailed notes & follow-up comments

### 3. ⚡ Multi-User Real-Time Synchronization
- **Simultaneous Updates**: When one user updates quantity, strikes an item, or changes an assignee, **all other users see it update live in real-time**!
- **Free Cloud Backend**: Integrates with Google Firebase Realtime Database (100% free, 0 server maintenance).
- **Dual Mode**:
  - **Local Mode**: Works instantly out of the box with `localStorage` and `BroadcastChannel` without any setup.
  - **Live Cloud Sync**: Connect in 60 seconds by pasting your Firebase config in the app's **"Connect Multi-User Sync"** modal or setting Vercel Environment Variables.
- **Export & Import**: Download JSON backup anytime or restore on any device.

---

## 🚀 How to Host on GitHub & Deploy to Vercel

### Step 1: Push to your GitHub Repository
```bash
# 1. Initialize git and commit files
git init
git add .
git commit -m "Initial commit: DMart collaborative list and group task assigner"

# 2. Link to your GitHub repository (replace with your repo URL)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/dmart-list.git
git push -u origin main
```

### Step 2: Deploy to Vercel (1-Click)
1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **"Add New Project"** &rarr; Select your `dmart-list` GitHub repository.
3. Vercel automatically detects the **Vite** framework preset:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Your app will be live on `https://dmart-list-xxx.vercel.app` in under 30 seconds!

---

## ☁️ Enabling Real-Time Multi-User Sync (Firebase)

To make updates sync live across all phones:

1. Go to [console.firebase.google.com](https://console.firebase.google.com) (free).
2. Click **Create Project** (e.g. `dmart-tracker`).
3. In the left sidebar, click **Build** &rarr; **Realtime Database** &rarr; **Create Database**.
4. Choose location and select **Start in test mode** (enables read/write for your group).
5. Click the **Settings Gear (Project Settings)** &rarr; scroll to **Your apps** &rarr; click **Web (</>)** to register an app.
6. Copy the `databaseURL` and `apiKey`.
7. **Two ways to connect**:
   - **Option A (Instant in UI)**: Click the yellow **"Connect Multi-User Sync"** button in the app header and paste your config!
   - **Option B (Vercel Environment Variables)**: In your Vercel Project Settings &rarr; Environment Variables, add:
     ```env
     VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
     VITE_FIREBASE_API_KEY=AIzaSy...
     VITE_FIREBASE_PROJECT_ID=your-project
     ```

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📁 Project Structure

```
├── dmart list.docx          # Original source list
├── index.html               # Main HTML entry point
├── package.json             # Dependencies and build scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS theme
├── vercel.json              # Vercel deployment configuration
├── src/
│   ├── main.jsx             # React DOM root
│   ├── App.jsx              # Main application shell & state coordinator
│   ├── index.css            # Tailwind directives & styles
│   ├── data/
│   │   └── seedItems.js     # All 81 items categorized from dmart list.docx
│   ├── services/
│   │   └── syncService.js   # Realtime sync service (Firebase + Local fallback)
│   └── components/
│       ├── Header.jsx       # Header with tabs, sync indicator, export/import
│       ├── DmartList.jsx    # DMart shopping list with qty/pcs/size controls
│       ├── GroupTasks.jsx   # Group action & task assigner by member name
│       ├── ItemModal.jsx    # Item add/edit modal (qty/pcs/size/floor)
│       └── CloudSyncModal.jsx # Multi-user live sync setup modal & guide
```
