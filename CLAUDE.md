# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This repository contains two main projects:

1. **expense-tracker/**: A modern Next.js 14 expense tracking application with TypeScript and Tailwind CSS
2. **trading-platforms/**: Python-based cryptocurrency and stock trading analysis scripts

## Commands

### Expense Tracker (Next.js Application)

All commands must be run from the `expense-tracker/` directory:

```bash
cd expense-tracker
```

**Development:**
- `npm run dev` - Start development server with Turbopack (http://localhost:3000)
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

**Installation:**
- `npm install` - Install dependencies

### Trading Platforms (Python Scripts)

Scripts are located in `trading-platforms/` directory. Key scripts:
- `python3 run_full_crawl.py` - Run full BTCUSDT historical data crawl
- `python3 btc_crawler.py` - Basic Bitcoin price crawler
- `python3 get_fpt_price.py` - Get FPT stock prices (requires vnstock library)

Dependencies are not managed through requirements.txt. Scripts import:
- pandas, requests, time, datetime (standard libraries)
- vnstock (for Vietnamese stock data)

## Architecture Overview

### Expense Tracker Architecture

**Framework:** Next.js 14 with App Router and TypeScript

**Key Directories:**
- `src/app/` - Next.js app router pages (dashboard, expenses, add-expense)
- `src/components/` - Organized by feature:
  - `dashboard/` - Charts, insights, summary cards
  - `expenses/` - List, filters, item management
  - `forms/` - Expense form with validation
  - `layout/` - Header, navigation
  - `ui/` - Reusable components (Button, Card, Input, etc.)
- `src/hooks/` - Custom React hooks for expenses and analytics
- `src/lib/` - Utilities and localStorage management
- `src/types/` - TypeScript definitions
- `src/contexts/` - Theme context for dark/light mode

**Data Storage:** Browser localStorage (no backend required)

**Key Technologies:**
- Styling: Tailwind CSS v4
- Charts: Recharts
- Icons: Lucide React
- Date handling: date-fns
- Utilities: clsx, tailwind-merge

**Categories System:** Predefined expense categories defined in `src/types/expense.ts`:
- Food, Transportation, Entertainment, Shopping, Bills, Finance, Other

### Trading Platforms Architecture

**Purpose:** Cryptocurrency (Bitcoin) and Vietnamese stock market data collection and analysis

**Key Scripts:**
- `btc_crawler.py` - Main BTCUSDT hourly data fetcher using Binance API
- `run_full_crawl.py` - Automated full historical data collection
- Various `btc_*.py` files - Different crawling strategies and analysis approaches
- `get_fpt_*.py` files - Vietnamese stock (FPT) price fetching

**Data Sources:**
- Binance API for cryptocurrency data
- VNStock library for Vietnamese stock market data

**Output:** CSV files with historical price data for backtesting

## Development Patterns

### Expense Tracker Patterns

**Component Structure:** Feature-based organization with clear separation of UI, business logic, and data management

**State Management:** Custom hooks (`useExpenses`, `useExpenseAnalytics`) with localStorage persistence

**Type Safety:** Comprehensive TypeScript definitions with strict typing

**Responsive Design:** Mobile-first approach with Tailwind CSS

**Data Flow:**
1. Forms validate and create expense objects
2. Custom hooks manage localStorage operations
3. Components consume data through hooks
4. Analytics computed in real-time from stored data

### Trading Scripts Patterns

**Error Handling:** Try-catch blocks with console logging
**API Integration:** Direct HTTP requests to financial APIs
**Data Processing:** Pandas DataFrames for data manipulation
**File Output:** CSV format for data persistence and analysis