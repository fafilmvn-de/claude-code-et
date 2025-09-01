# ExpenseTracker - Personal Finance Management

A modern, professional expense tracking application built with Next.js 14, TypeScript, and Tailwind CSS. Track your personal expenses, analyze spending patterns, and manage your finances with ease.

## 🚀 Features

### Core Functionality
- **Add Expenses**: Create new expense entries with amount, description, category, and date
- **View & Manage**: Browse all expenses in a clean, organized list
- **Search & Filter**: Find expenses by description, category, or date range
- **Edit & Delete**: Modify or remove existing expenses
- **Categories**: Organize expenses into predefined categories (Food, Transportation, Entertainment, Shopping, Bills, Other)

### Dashboard & Analytics
- **Summary Cards**: Quick overview of total expenses, monthly spending, and top categories
- **Visual Analytics**: Interactive charts showing spending by category and monthly trends
- **Recent Activities**: Display of your most recent expense entries

### Data Management
- **Local Storage**: All data persists in your browser's local storage
- **CSV Export**: Export filtered expense data to CSV format
- **Data Validation**: Form validation ensures data integrity

### Design & Accessibility
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional interface with intuitive navigation
- **Mobile Optimized**: Touch-friendly interface with mobile-specific optimizations
- **Accessibility**: Built with accessibility best practices

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data**: localStorage (browser-based)

## 🏁 Getting Started

### Prerequisites
- Node.js 18.0 or later
- npm package manager

### Installation

1. **Navigate to the project directory**
   ```bash
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## 📱 How to Use

### First Time Setup
1. Open the application in your browser
2. You'll see a welcome screen with an invitation to add your first expense
3. Click "Add Your First Expense" to get started

### Adding Expenses
1. Navigate to "Add Expense" from the sidebar or click the "+" button
2. Fill in the expense details:
   - **Amount**: Enter the expense amount in USD
   - **Description**: Brief description of the expense
   - **Category**: Select from predefined categories
   - **Date**: Choose the expense date
3. Click "Add Expense" to save

### Managing Expenses
1. Go to the "Expenses" page to view all your expenses
2. Use the search bar to find specific expenses
3. Filter by category or date range using the filter controls
4. Click the three dots menu on any expense to edit or delete

### Dashboard Overview
- **Total Expenses**: Your complete spending amount
- **This Month**: Current month's expenses with trend indicator
- **Average Expense**: Average amount per expense
- **Top Category**: Your most expensive category
- **Charts**: Visual representation of spending patterns
- **Recent Expenses**: Your latest expense entries

### Exporting Data
1. Go to the "Expenses" page
2. Apply any filters you want (optional)
3. Click "Export CSV" to download your expense data

## 🎨 Customization

### Adding New Categories
To add new expense categories, modify the `EXPENSE_CATEGORIES` array in `src/types/expense.ts`:

```typescript
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Bills',
  'Other',
  'Your New Category' // Add here
];
```

## 📱 Mobile Experience

The application is fully responsive and optimized for mobile use:
- **Mobile Navigation**: Hamburger menu for easy navigation on small screens
- **Touch-Friendly**: All buttons and interactive elements are sized for touch
- **Responsive Layout**: Components adapt to different screen sizes
- **Mobile Forms**: Optimized form inputs for mobile keyboards

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
│   ├── dashboard/       # Dashboard-specific components
│   ├── expenses/        # Expense management components
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   └── ui/              # Basic UI components
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and storage
└── types/               # TypeScript type definitions
```

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔐 Data Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Data persists across browser sessions
- You can clear data by clearing browser storage

## 🚀 Deployment

The application can be deployed to any platform that supports Next.js:

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with one click

### Other Platforms
- Netlify, AWS Amplify, Railway, or any platform supporting Node.js

## 🐛 Troubleshooting

### Common Issues

**Data not persisting**
- Ensure your browser allows localStorage
- Check if you're in private/incognito mode

**Charts not displaying**
- Ensure you have expenses added
- Check browser console for JavaScript errors

**Mobile menu not working**
- Ensure JavaScript is enabled
- Check for browser compatibility issues

## 🤝 Features Included

✅ Expense form with validation and date picker  
✅ Expense list with search and filter functionality  
✅ Dashboard with summary cards and analytics  
✅ Edit and delete functionality for expenses  
✅ CSV export functionality  
✅ Responsive design and mobile optimization  
✅ Professional, modern UI design  
✅ TypeScript for type safety  
✅ Local storage persistence  

---

**Built with ❤️ using Next.js 14, TypeScript, and Tailwind CSS**
