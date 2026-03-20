# TaskFlow v3 — Liquid Intelligence

A premium, glassmorphic task management application with real-time analytics, calendar integration, and a sophisticated theme engine.

![Liquid Intelligence Theme](https://github.com/SagarHedav/task-1/raw/main/preview.png)

## ✨ Features

- **Liquid Glass UI**: Sophisticated "Liquid Intelligence" aesthetic with deep frosting, glowing orbs, and fluid animations.
- **Dual Theme Engine**: 
  - **Dark Mode**: Original high-contrast liquid intelligence design.
  - **Light Mode**: Breathtaking Neomorphic design with soft 3D shadows.
- **Intelligent Analytics**:
  - **Workspace Overview**: Real-time completion progress tracking with dynamic gradient meters.
  - **Live Velocity**: Animated productivity metrics and trends.
- **Guest Mode & Cloud Sync**: Use instantly as a guest with local storage, or sign in to persist data via PostgreSQL (NeonDB).
- **Pro Calendar**: Full-featured event and reminder management (Exclusive for registered users).
- **Smart Sorting & Search**: Align tasks by date, priority, or jump to specific items instantly.

## 🚀 Tech Stack

- **Frontend**: React, Vite, Tailwind CSS (V4), Lucide, Date-fns.
- **Backend**: Node.js, Express, PostgreSQL (NeonDB).
- **Auth**: JWT-based session management with Bcrypt password hashing.

## 🛠️ Installation

### 1. Clone the Repo
```bash
git clone https://github.com/SagarHedav/task-1.git
cd task-1
```

### 2. Setup Backend
```bash
cd backend
npm install
# Configure your .env (DATABASE_URL, JWT_SECRET)
node server.js
```

### 3. Setup Frontend
```bash
cd frontend
npm install
# Configure .env (VITE_API_URL)
npm run dev
```

## 🌍 Deployment

- **Backend**: Recommended for [Render](https://render.com).
- **Frontend**: Recommended for [Vercel](https://vercel.com) or [Netlify](https://netlify.com).

---
© 2026 TaskFlow. Crafted for premium productivity.
