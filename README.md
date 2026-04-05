# ⬡ CoreMatrix
### Personalized Workout and Nutrition Planner

CoreMatrix is a single-page AngularJS application backed by a Node.js and MySQL API. It provides workout logging, meal tracking, progress charts, a weekly training plan, and a per-user authentication flow so each account sees only its own data.

---

## What This App Does

CoreMatrix combines three layers:

1. A client-side AngularJS SPA for navigation and forms.
2. A Node.js/Express API for authentication and CRUD operations.
3. A MySQL database for persistent user, workout, and meal storage.

When a user registers, the app now collects body weight, height, age, activity level, and goal. Those values are used to calculate profile fields automatically, including BMI, calorie goal, protein goal, and target weight. Those values are stored in the database and restored on login.

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure MySQL

Set environment variables if your MySQL server is not using the defaults:

```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_PORT=3306
DB_NAME=corematrix_db
```

### 3. Start the backend

```bash
npm start
```

The server runs at `http://localhost:3000`.

### 4. Open the app

Open `http://localhost:3000` in your browser. Do not open `index.html` directly if you want the database-backed login and storage to work.

---

## Authentication Flow

### Registration

The registration form collects:

- Name
- Email
- Password
- Training goal
- Body weight in kg
- Height in cm
- Age
- Activity level

On submit, the backend stores the account in `users` and auto-calculates:

- BMI
- Calorie goal
- Protein goal
- Target weight

### Login

Login validates the email and password on the client and then verifies credentials on the server. On success, the current user is saved in `localStorage` and the SPA loads that user's workouts and meals.

### Sign out

The top-right profile menu includes a sign-out action. It clears the current session state in the browser and returns the user to the login screen.

---

## Project Structure

```text
WPP2/
├── app.js              # AngularJS routing
├── auth.html           # Login and register screen
├── authController.js   # Register and login handlers
├── controllers.js      # Main, Home, Workout, Nutrition, Progress, Logs controllers
├── dbConfig.js         # MySQL pool and schema bootstrap
├── forge.html          # Workout logging view
├── fuel.html           # Meal logging view
├── home.html           # Dashboard
├── index.html          # App shell and navigation
├── logs.html           # Full history table
├── package.json        # Scripts and dependencies
├── progress.html       # Charts and summary view
├── server.js           # Express entry point
├── services.js         # AngularJS data service and API calls
└── style.css           # Shared visual system and responsive layout
```

---

## Frontend Architecture

### AngularJS routing

The SPA uses `ngRoute` with these pages:

- `/` for the dashboard
- `/auth` for login and registration
- `/forge` for workout entry
- `/fuel` for nutrition entry
- `/progress` for charts and summaries
- `/logs` for full history

### Shared state

`MainCtrl` owns the current user profile and top-level UI state. Child controllers inherit that profile through AngularJS scope chaining.

### Data service

`DataService` is the main client-side API layer. It:

- stores the active user in `localStorage`
- loads user-specific workouts and meals
- supports create, update, and delete operations
- falls back to seeded local data if the API is not reachable

### Editing behavior

Workout logs can be edited inline from:

- The Forge
- My Logs

Meal logs can be edited inline from:

- The Fuel
- My Logs

---

## Backend Architecture

### `server.js`

Starts the Express app, initializes the database, wires auth and fitness routes, and serves the SPA.

### `dbConfig.js`

Creates the MySQL connection pool and ensures the schema exists. It now also upgrades the `users` table with the profile fields required for automatic body metric calculation.

### `authController.js`

Handles registration and login. Registration hashes passwords and stores profile metrics derived from the registration form.

### `fitnessLogic.js`

Implements user-scoped workout and meal CRUD operations. Reads and writes are filtered by `user_id` so one user's logs are not mixed with another user's.

---

## Database Schema

### Users table

Important fields:

- `name`
- `email`
- `password`
- `goal`
- `weight_kg`
- `height_cm`
- `age_years`
- `activity_level`
- `bmi`
- `calorie_goal`
- `protein_goal`
- `target_weight`

### Workouts table

Each workout belongs to a user via `user_id` and stores:

- name
- category
- sets
- reps
- weight
- intensity
- log date

### Meals table

Each meal belongs to a user via `user_id` and stores:

- name
- type
- calories
- protein
- carbs
- fat
- log date

---

## API Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/health | Backend health check |
| POST | /api/auth/register | Create a user account |
| POST | /api/auth/login | Authenticate a user |
| GET | /api/workouts | Fetch workouts for the active user |
| POST | /api/workouts | Create a workout |
| PUT | /api/workouts/:id | Update a workout |
| DELETE | /api/workouts/:id | Delete a workout |
| GET | /api/meals | Fetch meals for the active user |
| POST | /api/meals | Create a meal |
| PUT | /api/meals/:id | Update a meal |
| DELETE | /api/meals/:id | Delete a meal |
| GET | /api/tip | Fetch a daily nutrition tip |

### Request scoping

The client sends `userId` with workout and meal requests so every read/update/delete only touches that user's records.

---

## Running Notes

- If you want the database-backed experience, start the server with `npm start`.
- If the server is down, the app will fall back to local seeded data for some screens, but registration and login will not work.
- The app is designed to work best when opened from `http://localhost:3000`.

---

## Responsive Behavior

The layout is built to handle desktop and mobile screens:

- navigation wraps and collapses on smaller screens
- Forge and Fuel forms collapse into one column on mobile
- inline edit panels stack vertically on narrow screens
- the profile menu adapts to the viewport width

---

## Troubleshooting

### Registration fails

Check that:

- the Node server is running
- MySQL is reachable
- you opened the app through `http://localhost:3000`
- all registration fields are completed

### Login fails

Check that:

- the email matches a registered account
- the password is at least 8 characters and meets the client-side validation rules

### Logs do not match the current user

Make sure you are signed in. The app stores the active user in `localStorage` and uses that profile to load only matching records.

### Mobile layout looks cramped

Use the latest `style.css` changes. They include a responsive nav, single-column auth layout, and stacked inline editors for smaller screens.

---

## Development Commands

```bash
npm install
npm start
```

If you need to inspect or extend the schema manually, update `dbConfig.js` and restart the server.
