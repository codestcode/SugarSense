# Diabetes Tracker - Quick Start Guide

## Overview

A modern, mobile-first diabetes tracking application built with React, Next.js, and Tailwind CSS. Track blood glucose readings and insulin doses with comprehensive statistics and data export capabilities.

## ✨ Key Features

- **Dashboard** - Real-time glucose stats, latest reading, insulin doses, and alerts
- **Blood Sugar Tracking** - Add readings with meal relation and notes
- **Insulin Tracking** - Log insulin doses by type (Rapid/Long/Mixed)
- **History** - View, edit, search, and delete all readings
- **Statistics** - Interactive charts showing daily/weekly/monthly trends
- **Data Export** - Export full reports, glucose reports, and insulin reports as text files
- **Settings** - Theme toggle, language selection (English/Arabic), target range customization
- **Local Storage** - All data persists automatically in your browser

## 🚀 Getting Started

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running the App

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Using the App

### Dashboard (Home)
- View today's average glucose
- See your latest reading with time
- Check alerts for low/high readings
- See insulin dose information
- Quick access buttons to add new readings

### Adding Readings

**Blood Sugar:**
1. Click "Add" → Blood Sugar Reading tab
2. Enter glucose value
3. Select meal relation (Before/After Breakfast/Lunch/Dinner, Before Sleep, Random)
4. Date/time auto-filled (edit if needed)
5. Add optional notes
6. Click "Add"

**Insulin:**
1. Click "Add" → Insulin Dose tab
2. Select insulin type (Rapid Acting, Long Acting, Mixed)
3. Enter units
4. Date/time auto-filled (edit if needed)
5. Add optional notes
6. Click "Add"

### History
- View all readings (Blood Sugar or Insulin Doses)
- Search by content
- Filter by date
- Edit any entry
- Delete entries with confirmation

### Statistics
- **Daily Trend** - Line chart of today's readings
- **Time In Range** - Percentage within target (70-180 mg/dL by default)
- **Weekly Average** - Bar chart of 7-day averages
- **Monthly Average** - 30-day trends
- Charts update automatically as you add readings

### Exporting Data

Go to Settings and choose:
- **Full Report** - Complete diabetes statistics
- **Glucose Report** - Glucose readings with analysis
- **Insulin Report** - Insulin doses with breakdown by type
- **Backup** - JSON export for data backup
- **Restore** - Import JSON backup file

### Settings
- **Theme** - Toggle between Light/Dark mode
- **Language** - Choose English or Arabic
- **Target Range** - Set your personalized glucose targets
- **Reset** - Clear all data (with confirmation)

## 📊 Sample Data

The app comes pre-loaded with 30+ sample readings from April-May for testing charts and features. Data is from various dates so you can see how the app displays historical data.

## 💾 Data Storage

All data is stored in your browser's localStorage:
- `glucose-store` - Blood glucose readings
- `insulin-store` - Insulin doses
- `settings-store` - App preferences

Data persists even after closing the browser.

## 🎨 Design

- Mobile-first responsive design
- Clean, modern interface with soft medical aesthetic
- Color-coded glucose status (Green=Normal, Red=Low, Orange=High)
- Accessible design with semantic HTML
- Large buttons and readable text for ease of use

## 🌍 Language Support

Currently supports:
- English (en)
- Arabic (ar) with RTL support

Additional languages can be added by creating new JSON files in `/lib/i18n/locales/`

## 🔧 Tech Stack

- **Framework**: React 19 + Next.js 16
- **State**: Zustand with localStorage persistence
- **Forms**: React Hook Form
- **Charts**: Recharts
- **Styling**: Tailwind CSS
- **Localization**: i18next
- **Icons**: Lucide React
- **Date Utils**: date-fns

## 📁 Project Structure

```
├── app/              # Next.js pages and layouts
├── components/       # React components
│   ├── dashboard/
│   ├── glucose/
│   ├── insulin/
│   ├── charts/
│   ├── layout/
│   └── common/
├── lib/              # Utilities and stores
│   ├── store/        # Zustand stores
│   ├── i18n/         # Translations
│   └── utils.ts
└── public/           # Icons and manifest
```

## 🎯 Use Cases

- Personal diabetes management
- Family health tracking (parent monitoring child)
- Doctor appointment preparation (review before visit)
- Pattern identification (meals affecting glucose)
- Medication effectiveness tracking
- Lifestyle impact analysis

## 📝 Notes

- All data is stored locally - no account or sign-up required
- Data is never sent to external servers
- Reports are exported as text files (can be printed or shared with doctor)
- Fully functional offline (once loaded)
- Designed for personal/family use (not HIPAA-compliant as-is)

## 🚀 Future Enhancements

- Cloud backup integration
- Doctor/caregiver sharing
- Medication reminders
- A1C calculations
- Blood pressure tracking
- Export to PDF with formatting
- Mobile app versions

## 📄 License

Personal/Family Use - Non-commercial

## 💬 Support

For questions or issues with the app, please refer to the FINAL_SUMMARY.md file for detailed documentation.

---

**Start tracking your health today!** 🏥✨

All readings are saved automatically. Your data never leaves your device.
