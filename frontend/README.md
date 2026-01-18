# Query Management System - Frontend

A modern Next.js 14 frontend application with role-based access control, built with TypeScript, Tailwind CSS, and cookie-based JWT authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000`

## 📁 Project Structure

```
frontend/
├── src/app/                    # Next.js App Router pages
│   ├── layout.tsx             # Root layout with AuthProvider
│   ├── page.tsx               # Landing page
│   ├── login/page.tsx         # Login page
│   ├── register/page.tsx      # Register page
│   ├── dashboard/page.tsx     # Dashboard (role-based)
│   └── queries/[id]/page.tsx  # Query details
├── components/                 # Reusable UI components
│   ├── Navbar.tsx
│   ├── StatusBadge.tsx
│   └── QueryCard.tsx
├── context/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   └── axios.ts               # Axios instance + interceptors
├── types/
│   └── index.ts               # TypeScript interfaces
├── middleware.ts              # Route protection middleware
└── .env.local                 # Environment variables
```

## 🔐 Authentication (Cookie-Based)

1. Login/Register → Backend returns JWT
2. Save token to cookie (`js-cookie`, expires in 7 days)
3. Axios interceptor adds `Authorization: Bearer <token>`
4. Middleware protects routes server-side
5. AuthContext manages user state

## 👥 Role-Based Views

### Participant
- Create queries
- View own queries only
- See status and answers

### Admin (Dispatcher)
- View ALL queries
- Assign to Team Heads
- Dismantle queries

### Team Head (Resolver)
- View assigned queries
- Answer queries
- Dismantle assigned queries

## 📡 API Integration

Base URL: `http://localhost:5000/api`

All requests automatically include JWT from cookie via axios interceptor.

## 🎨 Key Features

- **Server-side route protection** (middleware.ts)
- **Cookie-based JWT** (secure, HTTP-only capable)
- **Real-time toast notifications** (react-hot-toast)
- **Responsive design** (Tailwind CSS)
- **Type-safe** (TypeScript)
- **Role-based UI** (different views per role)

## 🔧 Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## 📊 Status Colors

- 🟡 **UNASSIGNED** - Yellow
- 🔵 **ASSIGNED** - Blue  
- 🟢 **RESOLVED** - Green
- 🔴 **DISMANTLED** - Red

## 🧪 Testing

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev`
3. Register users with different roles
4. Test complete workflow

Demo credentials:
- Email: `participant@test.com`, `admin@test.com`, `teamhead@test.com`
- Password: `password123`

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios**
- **React Context API**
- **js-cookie**
- **react-hot-toast**
- **date-fns**

## 📚 Pages

- `/` - Landing page
- `/login` - Login form
- `/register` - Registration with role selection
- `/dashboard` - Role-based dashboard
- `/queries/[id]` - Query details with actions

## 🚀 Production Build

```bash
npm run build
npm start
```

---

**Built with Next.js 14 + TypeScript + Tailwind CSS**
