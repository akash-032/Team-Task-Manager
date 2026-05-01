# Team Task Manager

A full-stack web application that allows teams to create projects, assign tasks, and track their progress with role-based access control.

## 🚀 Key Features

- **Authentication (Signup/Login):** Secure JWT-based authentication system.
- **Role-Based Access Control:** 
  - **Admin:** Can create new projects, invite members, and create/delete tasks.
  - **Member:** Can view projects they belong to, see tasks assigned to them, and update task statuses.
- **Project & Team Management:** Create multiple projects and manage team members within them.
- **Task Tracking:** Create tasks with descriptions, due dates, and status tracking (Pending, In Progress, Completed, Overdue).
- **Interactive Dashboard:** Premium UI featuring a quick overview of your projects and recent tasks.

## 🛠️ Technology Stack

- **Frontend:** React (Vite), React Router DOM, Axios, Vanilla CSS (Premium Glassmorphism Design).
- **Backend:** Node.js, Express.js.
- **Database:** MongoDB (via Mongoose).
- **Authentication:** JSON Web Tokens (JWT) & bcryptjs.

## 📦 Installation & Local Setup

### Prerequisites
- Node.js installed on your machine
- MongoDB running locally or a MongoDB Atlas URI

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/akash-032/Team-Task-Manager.git
   cd "Team Task Manager"
   ```

2. **Install dependencies:**
   This project has a root `package.json` that will install dependencies for both the frontend and backend.
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file inside the `backend` folder with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/teamtaskmanager
   JWT_SECRET=your_secret_key_here
   ```

4. **Run the Application locally:**
   Start both the frontend and the backend development servers:
   ```bash
   # In one terminal tab, start the backend
   cd backend
   npm run dev
   
   # In another terminal tab, start the frontend
   cd frontend
   npm run dev
   ```
   The frontend will be accessible at `http://localhost:5173` and the backend at `http://localhost:5000`.

## 🌐 Deployment 

This application is configured for a seamless one-click deployment on **Railway**. 

1. Create a new project on Railway from this GitHub repository.
2. Add a **MongoDB** database via Railway's dashboard.
3. Add the `NODE_ENV=production`, `JWT_SECRET`, and `MONGO_URI` environment variables.
4. Railway will automatically build the frontend and start the Node.js server.
