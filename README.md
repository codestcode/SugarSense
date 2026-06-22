![SugarSense Dashboard](https://github.com/codestcode/SugarSense/blob/main/Project%20Title.png)

# SugarSense

SugarSense is an AI-Powered mobile-first diabetes tracking app built with Next.js, 
React, Tailwind CSS, and Zustand. It helps users log glucose readings, insulin doses, 
meals, moods, and symptoms, then turns that data into readable trends, charts, and 
AI-supported insights.

This project is local-first by default. Data is stored in the browser, the UI is 
optimized for phones, and the app includes light/dark mode, English/Arabic support, 
backup/restore, and an AI assistant with safety guardrails.

---

## Update New Feature : AI Meal Photo Analysis

> One photo. Structured nutritional insight. No manual input.

A person with diabetes shouldn't have to manually log every meal — they should just 
take a photo.

This new feature handles everything from a single image:

- Detects food items using vision AI
- Estimates portion sizes in grams
- Structures the data for analytics
- Maps results to real nutrition databases (USDA)
- Generates a full carb report for the meal

**→ [Live Demo](https://lnkd.in/djrZFyvV)**

---

## Highlights

- Glucose tracking with meal relation, notes, and automatic low/normal/high status
- Insulin logging with dose type, time, and units
- Meal and wellness tracking for richer pattern analysis
- Dashboard with alerts, summaries, and quick actions
- History and statistics views with charts and filtering
- AI insights for patterns, food impact, predictive alerts, mood correlation, and chat
- **AI meal photo analysis — one photo to full carb breakdown**
- Floating AI chat on the home page
- Theme support: light and dark
- Localization: English and Arabic
- Backup and restore via JSON
- Local persistence with Zustand + `localStorage`

---

## AI Safety

The AI features are designed to stay educational and observational only.

- No diagnosis
- No replacement for doctors
- No insulin dose prescriptions
- No dangerous medical instructions

---

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Zustand
- Recharts
- React Hook Form
- i18next
- Lucide React

---

## Screens and Features

### Dashboard
- Today's glucose and insulin overview
- Alerts for high and low readings
- Notification bell for alert summaries
- Quick jump to AI patterns
- Floating AI chat widget

### Add
- Add glucose readings
- Add insulin doses
- Add meals
- Add wellness entries

### History
- Browse saved entries
- Filter and search records
- Review glucose, insulin, meals, and wellness logs

### Stats
- Daily, weekly, and monthly trends
- Time-in-range and distribution views
- Visual charts for glucose patterns

### AI
- Pattern Detection
- Food Impact Analysis — including photo-based meal recognition
- Predictive Alerts
- Emotional / Mood Correlation
- AI Chat Assistant

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm recommended

### Install
```bash
pnpm install
```

### Run locally
```bash
pnpm dev
```

Open `http://localhost:3000`.

### Production build
```bash
pnpm build
pnpm start
```

---

## Environment Variables

Create `.env.local` with your AI provider settings.

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=llama-3.1-8b-instant
```

Current AI route supports:

- `GROQ_API_KEY`
- `GROQ_MODEL`
- `GROQ_BASE_URL`
- `QWEN_API_KEY` as a fallback key name

The API route currently uses an OpenAI-compatible chat-completions endpoint.

---

## Backup and Restore

Backup and restore are available from Settings.

Export includes:

- glucose
- insulin
- meals
- wellness
- settings

Restore writes data back into the persisted local stores and reloads the app.

---

## Project Structure

```text
app/              Next.js routes, layouts, API
components/       Reusable UI and feature components
lib/              Types, utilities, AI helpers, stores, i18n
public/           Static assets, icons, manifest
styles/           Additional styling assets
```

---

## Notes

- This app is not a medical device.
- Data is stored locally in the browser unless you extend the project with a backend.
- AI quality depends on the completeness of logged glucose, meal, insulin, and wellness 
  data.
- Rate limits depend on the configured provider.

---

## Scripts

```bash
pnpm dev
pnpm build
pnpm start
pnpm lint
```

---

## License

© HabebaEhab — All rights reserved
