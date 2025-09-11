# Task & Finance Planner (Frontend v0)

A modern, mobile-first task and finance management application built with React, Next.js, and Tailwind CSS.

## Features

- **Smart Task Management**: Automatic task prioritization based on deadline urgency, user weight, and estimated hours
- **Finance Tracking**: Comprehensive income, expense, and investment management
- **Mobile-First Design**: Responsive layout with floating action button (FAB) and bottom navigation
- **Real-time Scoring**: Dynamic task scoring algorithm for optimal productivity
- **Quick Actions**: Fast task and transaction creation from dashboard

## Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: Zustand
- **Storage**: Local Storage (with mock data)
- **Icons**: Lucide React

## Installation

1. **Clone or download** the project files
2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`
3. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`
4. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
/src
  /components
    app-shell.tsx       # Main layout with responsive navigation
    task-card.tsx       # Individual task display
    task-modal.tsx      # Task creation/editing form
    transaction-card.tsx # Individual transaction display
    fab.tsx            # Mobile floating action button
    kpi-bar.tsx        # Dashboard metrics
  /lib
    types.ts           # TypeScript interfaces
    store.ts           # Zustand state management
    score.ts           # Task prioritization algorithm
    storage.ts         # Local storage utilities
  /app
    /dashboard         # Main overview page
    /tasks            # Task management
    /finance          # Financial tracking
    /settings         # User preferences
\`\`\`

## Key Features

### Task Prioritization Algorithm
Tasks are automatically scored based on:
- **Deadline urgency** (60% weight): Closer deadlines get higher priority
- **User weight** (30% weight): Manual priority setting (1-5 scale)
- **Estimated hours** (10% weight): Shorter tasks can be prioritized when urgent

### Mobile Experience
- **Bottom Navigation**: Easy thumb navigation on mobile devices
- **Floating Action Button**: Quick access to add tasks/transactions
- **Responsive Cards**: Optimized layouts for all screen sizes
- **Touch-Friendly**: Large tap targets and intuitive gestures

### Financial Management
- **Multi-Type Tracking**: Income, expenses, and investments
- **Category Management**: Organized transaction categorization
- **Real-Time Balance**: Automatic balance calculations
- **Monthly Summaries**: Period-based financial insights

## Usage

1. **Dashboard**: View top priority tasks and financial summary
2. **Tasks**: Manage and prioritize your tasks with automatic scoring
3. **Finance**: Track income, expenses, and investments
4. **Mobile**: Use FAB for quick additions, bottom nav for navigation

## Development Notes

- **State Management**: Uses Zustand for simple, effective state management
- **Data Persistence**: Local storage with automatic save/load
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Accessibility**: ARIA labels, keyboard navigation, proper contrast ratios
- **Performance**: Optimized components with proper memoization

## Customization

- **Colors**: Modify CSS variables in `globals.css`
- **Categories**: Update category arrays in modal components
- **Scoring**: Adjust weights in `lib/score.ts`
- **Layout**: Customize responsive breakpoints in components

Built with ❤️ using v0 by Vercel
