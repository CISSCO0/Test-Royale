# 🎮 Test Royale - Frontend

> A competitive multiplayer platform for software testing battles where developers compete in real-time to write the most comprehensive test suites.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38bdf8)](https://tailwindcss.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://vercel.com)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [API Integration](#api-integration)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

## 🌟 Overview

Test Royale Frontend is a modern, real-time web application built with Next.js 14 that provides an immersive competitive testing experience. Players join rooms, write test cases in a collaborative environment, and receive instant feedback on test coverage, mutation testing scores, and code quality metrics.

**Live Demo:** [https://test-royale.vercel.app](https://test-royale.vercel.app)

## ✨ Features

### 🎯 Core Gameplay
- **Real-time Multiplayer Rooms** - Create and join game rooms with unique codes
- **Live Code Editor** - Write tests with syntax highlighting and auto-completion
- **Instant Test Execution** - Run C# tests with immediate feedback
- **Timer System** - Timed challenges with auto-submission
- **Results Dashboard** - Comprehensive performance analytics

### 📊 Advanced Metrics
- **Code Coverage Analysis** - Line and branch coverage visualization
- **Mutation Testing** - Stryker.NET integration for mutation score calculation
- **Test Quality Metrics** - Test line counting and execution time tracking
- **Comparative Rankings** - Real-time leaderboards with player rankings

### 🎨 User Experience
- **Responsive Design** - Optimized for desktop and tablet
- **Dark Theme UI** - Modern, eye-friendly interface
- **Animated Transitions** - Smooth page transitions and loading states
- **Battle Animations** - Engaging visual effects
- **PDF Reports** - Downloadable performance reports

### 🏆 Progression System
- **Player Profiles** - Track statistics and game history
- **Badge System** - Earn badges for achievements
- **Leaderboards** - Global and weekly rankings
- **Win Streaks** - Track consecutive victories

## 🛠️ Tech Stack

### Core Framework
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **React 18** - UI library with modern features

### Styling & UI
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Lucide Icons** - Icon library
- **Framer Motion** - Animation library

### Code Editor
- **CodeMirror 6** - Advanced code editor
- **@codemirror/lang-cpp** - C# syntax support
- **@codemirror/theme-one-dark** - Dark theme

### State & Data
- **React Context** - Authentication state management
- **Socket.io Client** - Real-time communication
- **Fetch API** - HTTP requests

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone the repository
git clone https://github.com/CISSCO0/Test-Royale.git
cd Test-Royale/Frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 📁 Project Structure

```
Frontend/
├── app/                      # Next.js App Router pages
│   ├── game/[id]/           # Game session page
│   ├── results/[id]/        # Results dashboard
│   ├── room/[code]/         # Room lobby
│   ├── leaderboard/         # Global leaderboards
│   ├── profile/             # Player profile
│   ├── login/               # Authentication
│   └── register/            # Registration
├── components/              # Reusable React components
│   ├── code-editor-display.tsx
│   ├── coverage-code-editor.tsx
│   ├── navigation.tsx
│   ├── SparklerTimer.tsx
│   └── ...
├── lib/                     # Utility libraries
│   ├── api.ts              # API service layer
│   ├── auth-context.tsx    # Authentication context
│   └── utils.ts            # Helper functions
├── interface/               # TypeScript interfaces
│   ├── GetGameResponse.ts
│   └── ...
├── public/                  # Static assets
└── styles/                  # Global styles
```

## 🔑 Key Components

### Code Editor Display
Real-time code editor with syntax highlighting and execution:
```typescript
<CodeEditorDisplay
  code={baseCode}
  language="cpp"
  editable={false}
  coveredLines={coveredLines}
/>
```

### Sparkler Timer
Animated countdown timer with auto-submission:
```typescript
<SparklerTimer
  duration={timerDuration}
  onComplete={handleTimerEnd}
/>
```

### Results Modal
Comprehensive test results visualization:
```typescript
<ResultsModal
  playerData={playerData}
  onClose={() => setShowResultsModal(false)}
/>
```

## 🔌 API Integration

### API Service Layer (`lib/api.ts`)

```typescript
// Authentication
await apiService.login(email, password);
await apiService.register(name, email, password);

// Room Management
await apiService.createRoom(playerId);
await apiService.joinRoom(playerId, roomCode);
await apiService.setPlayerReady(playerId, roomCode);

// Game Operations
await apiService.submitTestCode(gameId, playerId, testCode);
await apiService.calculatePlayerData(playerId, gameId);
await apiService.compileAndRunCSharpCode(baseCode, tests, playerId);

// Results & Reports
await apiService.getGameResults(gameId);
await apiService.generatePDFReport(playerId, gameId);

// Leaderboards
await apiService.getLeaderboard();
```

### Authentication Context
```typescript
const { player, isAuthenticated, login, logout } = useAuth();
```

## 🔐 Environment Variables

Create `.env.local` in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-url.com

# Socket.io URL (optional, defaults to API_URL)
NEXT_PUBLIC_SOCKET_URL=https://your-backend-url.com
```

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Production
npm run build           # Create production build
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript compiler check

# Testing (if configured)
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
```

## 🎨 Styling Guidelines

### Tailwind Configuration
- Custom color palette with orange/yellow theme
- Custom animations and transitions
- Responsive breakpoints for all devices

### Component Patterns
```typescript
// Card with gradient background
className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 p-6"

// Button with hover effect
className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 rounded-xl transition-all"
```

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository:**
   - Import project from GitHub
   - Select the Frontend directory

2. **Configure Environment:**
   - Add `NEXT_PUBLIC_API_URL` in Vercel dashboard
   - Enable automatic deployments from `main` branch

3. **Deploy:**
   - Vercel automatically builds and deploys on push
   - Preview deployments for pull requests

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy the .next folder to your hosting provider
# Ensure Node.js 18+ is available on the server
```

## 🔧 Troubleshooting

### Common Issues

**Issue: API calls fail with CORS error**
```
Solution: Ensure backend is configured with correct CORS origins
Backend needs: app.use(cors({ origin: 'https://your-frontend-url.com' }))
```

**Issue: Socket connection fails**
```
Solution: Check NEXT_PUBLIC_SOCKET_URL matches backend URL
Verify backend Socket.io is configured for cross-origin
```

**Issue: Build fails with TypeScript errors**
```bash
# Check type errors
npm run type-check

# Fix common issues
- Ensure all interfaces are properly imported
- Check for null/undefined handling
```

## 📄 License

This project is part of Test Royale educational platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using Next.js 14 and TypeScript**
