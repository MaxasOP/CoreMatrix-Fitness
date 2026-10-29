# DumbbellDore

An Indian-first training, nutrition, and fitness platform for planning workouts, logging sessions and meals, reviewing progress, and improving exercise form.

The repository is still named `CoreMatrix-Fitness`; the current product interface and brand are **DumbbellDore**.

<img width="645" height="1398" alt="image" src="https://github.com/user-attachments/assets/4d623f54-2017-424e-9f6b-e29225891ad9" />

<img width="645" height="1398" alt="image" src="https://github.com/user-attachments/assets/c5372358-fb73-4583-9d30-bf8aaa124e47" />
<img width="645" height="1398" alt="image" src="https://github.com/user-attachments/assets/394879e9-092a-4e1c-b632-6c962f3a7c72" />
<img width="645" height="1398" alt="image" src="https://github.com/user-attachments/assets/75f08213-0424-46a8-a2c6-d89b4bb1e040" />


<img width="645" height="1398" alt="image" src="https://github.com/user-attachments/assets/95c9ebc8-7085-4dc6-9c3a-a54d56845655" />
<img width="645" height="1398" alt="image" src="https://github.com/user-attachments/assets/4790adb9-7e15-47d5-b7d4-24fbe5823e5b" />


## What is included

- Focused daily dashboard with session, energy, protein, and weekly activity summaries
- Workout logging and AI-assisted weekly workout planning
- Exercise-form video analysis with a separate Python motion-analysis service
- Meal logging, AI diet planning, and Indian food alternatives
- Progress history, challenges, leaderboards, and community reels
- Supplement discovery and price-comparison APIs
- Trainer marketplace, bookings, payments, and notifications
- Responsive desktop and mobile navigation

## The training loop

1. Set a goal, experience level, schedule, and available equipment during onboarding.
2. Generate a saved plan, then log each planned exercise and its perceived effort.
3. Finish a training day to save its session summary. Attach a video review to a specific logged exercise.
4. Review the next-session suggestion. Easy effort plus a clearly visible linked review with no flagged issues can suggest one extra rep at the same load; otherwise the baseline is repeated.
5. After every planned day is finished, start the next cycle with those rep targets. Previous logs remain in history.
6. Use the dashboard and meal log to see protein and energy remaining against your saved daily targets.

Progression is a transparent rule-based suggestion. It does not automatically increase weight. Nutrition targets remain profile estimates; they are not automatically adjusted by exercise calories.

### Upgrade verification

The backend includes `scripts/verifyTrainingLoop.js`, an isolated integration harness covering registration, profile setup, saved plans, workout logs, linked form results, progression, session completion, meals, deletion consistency, and the next cycle. It requires `mongodb-memory-server` (or an absolute module path through `TEST_MONGO_MODULE`) and never connects to the configured application database. Plan generation and video findings use synthetic fixtures in this harness; live AI provider quality is a separate check.

## Stack

| Layer | Technology |
| --- | --- |
| Web app | Next.js 16, React 19, Tailwind CSS 4 |
| API | Node.js, Express, MongoDB, Mongoose |
| AI | Google Gemini |
| Motion analysis | Python service |
| Media | Cloudinary / S3-compatible uploads |
| Cache and realtime | Redis, Socket.IO |
| Payments | Razorpay and Stripe |
| Deployment | Vercel, Render, Docker |

## Repository layout

```text
CoreMatrix-Fitness/
├── client/       # Next.js application
├── backend/      # Express API, models, services, and tests
├── ai_service/   # Python motion-analysis service
├── docs/images/  # README screenshots
└── docker-compose.yml
```

## Run locally

### Prerequisites

- Node.js 20 or newer
- npm
- MongoDB
- Python 3.10+ when running the motion-analysis service locally
- Redis for caching and realtime features that depend on it

### 1. Install dependencies

```bash
git clone https://github.com/your-org/CoreMatrix-Fitness.git
cd CoreMatrix-Fitness

cd backend
npm install

cd ../client
npm install
```

### 2. Configure the backend

Create `backend/.env` and add the values needed by the features you plan to run. At minimum, configure MongoDB and authentication:

```dotenv
MONGO_URI=mongodb://127.0.0.1:27017/corematrix
JWT_SECRET=replace-with-a-long-random-secret
NODE_ENV=development
PORT=4000
```

Optional integrations such as Gemini, Cloudinary, SendGrid, Razorpay, Stripe, and Redis require their corresponding environment variables. See [ENV_CHECKLIST.md](./ENV_CHECKLIST.md) and [ENV_VARIABLES_SETUP.md](./ENV_VARIABLES_SETUP.md).

The frontend uses `/api` in development. To point it at another API, create `client/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### 3. Start the API and web app

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The API health endpoint is [http://localhost:4000/api/health](http://localhost:4000/api/health).

To add sample data:

```bash
cd backend
node scripts/seedDatabase.js
```

## Useful commands

| Location | Command | Purpose |
| --- | --- | --- |
| `client/` | `npm run dev` | Start the Next.js development server |
| `client/` | `npm run build` | Create a production frontend build |
| `client/` | `npm run lint` | Run frontend lint checks |
| `backend/` | `npm run dev` | Start the API with Nodemon |
| `backend/` | `npm test` | Run backend tests |
| repository root | `docker compose up --build` | Start the API and AI service containers |

## Main application routes

| Route | Purpose |
| --- | --- |
| `/` | Daily training dashboard |
| `/forge` | Workout logging |
| `/ai-workout` | AI workout-plan generation |
| `/form-analysis` | Exercise-form analysis |
| `/fuel` | Meal logging |
| `/ai-dietician` | AI meal planning |
| `/progress` | Training progress |
| `/challenges` | Fitness challenges |
| `/leaderboards` | Rankings |
| `/reels` | Community progress feed |
| `/supplements` | Supplement discovery |
| `/trainer-marketplace` | Trainer discovery and booking |

## Documentation

- [Feature and API overview](./FEATURES.md)
- [Quick start](./QUICK_START.md)
- [Environment checklist](./ENV_CHECKLIST.md)
- [Environment setup](./ENV_VARIABLES_SETUP.md)
- [Backend notes](./backend/README.md)
- [AI service notes](./ai_service/README.md)

## Deployment

- Set the Vercel project root to `client/` for the web app.
- Configure `NEXT_PUBLIC_API_URL` with the deployed API URL.
- Deploy the Express API and Python AI service separately, or use the included Docker configuration as a starting point.
- Keep secrets in the deployment provider's environment-variable store; do not commit `.env` files.

## License

[MIT](./LICENSE)
