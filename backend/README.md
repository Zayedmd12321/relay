# Query Management System - RESTful API

A complete Node.js backend system for managing queries with Role-Based Access Control (RBAC).

## 🎯 Features

- **User Authentication & Authorization** (JWT)
- **Role-Based Access Control (RBAC)**
  - **Participant**: Create queries, view own history
  - **Admin (Dispatcher)**: View all queries, assign to Team Heads, dismantle queries
  - **Team Head (Resolver)**: View assigned queries, answer or reject them
- **Query Workflow States**: UNASSIGNED → ASSIGNED → RESOLVED / DISMANTLED
- **Email Notifications**: Automated emails when queries are answered
- **Secure Password Hashing** (bcrypt)
- **MongoDB Database** with Mongoose ODM

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js         # MongoDB connection
├── models/
│   ├── User.js            # User schema
│   └── Query.js           # Query schema
├── middlewares/
│   ├── auth.js            # JWT authentication
│   └── roleCheck.js       # Role-based authorization
├── controllers/
│   ├── authController.js  # Auth logic (register/login)
│   └── queryController.js # Query CRUD operations
├── routes/
│   ├── authRoutes.js      # Auth endpoints
│   └── queryRoutes.js     # Query endpoints
├── utils/
│   └── emailService.js    # Email notification utility
├── .env.example           # Environment variables template
├── index.js               # Main server file
└── package.json           # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/query_management
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   
   # Email Configuration
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   EMAIL_FROM=noreply@querymanagement.com
   ```

4. **Start MongoDB:**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## 📡 API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |

### Queries

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/queries` | Participant | Create new query |
| GET | `/api/queries` | Private | Get all queries (filtered by role) |
| GET | `/api/queries/:id` | Private | Get single query |
| PATCH | `/api/queries/:id/assign` | Admin | Assign query to Team Head |
| PATCH | `/api/queries/:id/answer` | Team Head | Answer query (resolve) |
| PATCH | `/api/queries/:id/dismantle` | Admin/Team Head | Dismantle query |

## 📝 API Usage Examples

### 1. Register a User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Participant"
}
```

**Roles:** `Participant`, `Admin`, `Team_Head`

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "John Doe", "role": "Participant" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Create Query (Participant)

```bash
POST /api/queries
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Unable to access dashboard",
  "description": "I'm getting a 404 error when trying to access the dashboard..."
}
```

### 4. Assign Query (Admin)

```bash
PATCH /api/queries/:id/assign
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "teamHeadId": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

### 5. Answer Query (Team Head)

```bash
PATCH /api/queries/:id/answer
Authorization: Bearer <teamhead_token>
Content-Type: application/json

{
  "answer": "The dashboard is currently under maintenance. It will be back online by 5 PM."
}
```

### 6. Dismantle Query (Admin or Team Head)

```bash
PATCH /api/queries/:id/dismantle
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Invalid query - duplicate submission"
}
```

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 🎭 Role-Based Logic

### Query Visibility:
- **Participant**: Can only see queries they created
- **Team Head**: Can only see queries assigned to them
- **Admin**: Can see all queries

### Workflow Rules:
- Only `UNASSIGNED` queries can be assigned (by Admin)
- Only `ASSIGNED` queries can be answered (by assigned Team Head)
- `RESOLVED` queries cannot be dismantled
- `DISMANTLED` queries cannot be modified

## 📧 Email Notifications

When a Team Head answers a query, the system automatically sends an email to the Participant who created it, containing:
- Query title and description
- The answer provided
- Team Head's name

## 🛠️ Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Nodemailer** - Email service
- **dotenv** - Environment variables

## 🧪 Testing

Use tools like **Postman**, **Insomnia**, or **Thunder Client** to test the API endpoints.

### Sample Test Flow:

1. Register 3 users (Participant, Admin, Team_Head)
2. Login as Participant → Create a query
3. Login as Admin → Get all queries → Assign to Team Head
4. Login as Team Head → Get assigned queries → Answer query
5. Check that email notification was sent

## 📄 License

ISC

## 👨‍💻 Author

Senior Backend Developer

---

**Note:** Make sure MongoDB is running before starting the server. Update the `.env` file with your actual credentials for production use.
